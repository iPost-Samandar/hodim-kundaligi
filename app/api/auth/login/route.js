import { cookies } from "next/headers";
import { supabaseAdmin } from "../../../lib/server-supabase.js";
import {
  verifyPassword, hashPassword, isBcryptHash,
  signSession, sessionCookieOptions,
} from "../../../lib/auth.js";
import {
  ok, bad, checkLoginRateLimit, resetLoginRateLimit, clientKey,
} from "../../../lib/api-helpers.js";
import { audit } from "../../../lib/audit.js";

export async function POST(req) {
  let body;
  try { body = await req.json(); } catch { return bad("invalid JSON"); }
  const login = String(body?.login || "").trim();
  const password = String(body?.password || "");
  if (!login || !password) return bad("login and password required");

  const key = clientKey(req, login);
  const rl = checkLoginRateLimit(key);
  if (!rl.allowed) {
    return Response.json({ error: "rate_limited", retryAfterSec: rl.retryAfterSec }, { status: 429 });
  }

  const cleanPhone = login.replace(/\D/g, "").replace(/^998/, "");
  const { data: users, error } = await supabaseAdmin
    .from("users")
    .select("id, login, password, full_name, phone, emoji, role, is_active, lang, theme, telegram_chat_id, telegram_link_token, telegram_link_expires_at")
    .or(`login.eq.${login},phone.eq.${login},phone.eq.${cleanPhone}`)
    .limit(1);

  if (error) return bad("server_error", 500);

  const u = users?.[0];
  if (!u || !u.is_active) {
    await audit(req, null, "login_failed", "users", null, { login, reason: u ? "inactive" : "not_found" });
    return bad("invalid_credentials", 401);
  }

  const valid = await verifyPassword(password, u.password);
  if (!valid) {
    await audit(req, null, "login_failed", "users", u.id, { login, reason: "wrong_password" });
    return bad("invalid_credentials", 401);
  }

  if (!isBcryptHash(u.password)) {
    const hashed = await hashPassword(password);
    await supabaseAdmin.from("users").update({ password: hashed }).eq("id", u.id);
  }

  resetLoginRateLimit(key);

  const token = await signSession({
    sub: u.id, login: u.login, role: u.role, name: u.full_name,
  });
  const opts = sessionCookieOptions();
  cookies().set(opts.name, token, opts);

  const { password: _pw, telegram_chat_id, telegram_link_token, telegram_link_expires_at, ...rest } = u;
  const safe = { ...rest, telegram_linked: Boolean(telegram_chat_id) };
  await audit(req, { sub: u.id, login: u.login, role: u.role }, "login_success", "users", u.id);
  return ok({ user: safe });
}
