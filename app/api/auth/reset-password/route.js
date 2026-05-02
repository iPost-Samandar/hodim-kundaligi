import bcrypt from "bcryptjs";
import { supabaseAdmin } from "../../../lib/server-supabase.js";
import { ok, bad, checkLoginRateLimit, clientKey } from "../../../lib/api-helpers.js";
import { hashPassword } from "../../../lib/auth.js";
import { audit } from "../../../lib/audit.js";
import { sendMessage } from "../../../lib/telegram.js";

const MAX_ATTEMPTS = 5;

export async function POST(req) {
  let body;
  try { body = await req.json(); } catch { return bad("invalid JSON"); }
  const login = String(body?.login || "").trim();
  const code = String(body?.code || "").trim();
  const newPassword = String(body?.newPassword || "");
  if (!login || !code || !newPassword) return bad("login, code, newPassword required");
  if (newPassword.length < 4) return bad("password_too_short");

  const rl = checkLoginRateLimit(`reset|${clientKey(req, login)}`, 5);
  if (!rl.allowed) {
    return Response.json({ error: "rate_limited", retryAfterSec: rl.retryAfterSec }, { status: 429 });
  }

  const cleanPhone = login.replace(/\D/g, "").replace(/^998/, "");
  const { data: users } = await supabaseAdmin
    .from("users")
    .select("id, login, telegram_chat_id, is_active")
    .or(`login.eq.${login},phone.eq.${login},phone.eq.${cleanPhone}`)
    .limit(1);
  const u = users?.[0];
  if (!u || !u.is_active) return bad("invalid_or_expired", 400);

  // Eng so'nggi ishlatilmagan kodni topish
  const { data: codes } = await supabaseAdmin
    .from("password_reset_codes")
    .select("id, code_hash, expires_at, used_at, attempts")
    .eq("user_id", u.id)
    .is("used_at", null)
    .order("created_at", { ascending: false })
    .limit(1);
  const rec = codes?.[0];
  if (!rec) return bad("invalid_or_expired", 400);

  if (new Date(rec.expires_at).getTime() < Date.now()) {
    await supabaseAdmin.from("password_reset_codes").update({ used_at: new Date().toISOString() }).eq("id", rec.id);
    return bad("invalid_or_expired", 400);
  }

  if ((rec.attempts || 0) >= MAX_ATTEMPTS) {
    await supabaseAdmin.from("password_reset_codes").update({ used_at: new Date().toISOString() }).eq("id", rec.id);
    return bad("too_many_attempts", 400);
  }

  const valid = await bcrypt.compare(code, rec.code_hash);
  if (!valid) {
    await supabaseAdmin
      .from("password_reset_codes")
      .update({ attempts: (rec.attempts || 0) + 1 })
      .eq("id", rec.id);
    await audit(req, null, "reset_password_failed", "users", u.id, { login, reason: "wrong_code" });
    return bad("invalid_or_expired", 400);
  }

  // Parolni yangilash + kodni "ishlatilgan" deb belgilash
  const hashed = await hashPassword(newPassword);
  await Promise.all([
    supabaseAdmin.from("users").update({ password: hashed }).eq("id", u.id),
    supabaseAdmin.from("password_reset_codes").update({ used_at: new Date().toISOString() }).eq("id", rec.id),
  ]);

  await audit(req, null, "reset_password_success", "users", u.id, { login });

  if (u.telegram_chat_id) {
    await sendMessage(u.telegram_chat_id, "✅ Parolingiz muvaffaqiyatli o'zgartirildi. Agar bu siz emas bo'lsangiz — darhol administratorga murojaat qiling.");
  }
  return ok({ ok: true });
}
