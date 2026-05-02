import bcrypt from "bcryptjs";
import { supabaseAdmin } from "../../../lib/server-supabase.js";
import { ok, bad, checkLoginRateLimit, clientKey } from "../../../lib/api-helpers.js";
import { sendMessage, generateOtp, tgEnabled } from "../../../lib/telegram.js";
import { audit } from "../../../lib/audit.js";

const TTL_MIN = 10;
const MAX_PER_15MIN = 3;

export async function POST(req) {
  if (!tgEnabled()) return bad("telegram_not_configured", 503);
  let body;
  try { body = await req.json(); } catch { return bad("invalid JSON"); }
  const login = String(body?.login || "").trim();
  if (!login) return bad("login required");

  // Rate-limit
  const rl = checkLoginRateLimit(`forgot|${clientKey(req, login)}`, MAX_PER_15MIN);
  if (!rl.allowed) {
    return Response.json({ error: "rate_limited", retryAfterSec: rl.retryAfterSec }, { status: 429 });
  }

  const cleanPhone = login.replace(/\D/g, "").replace(/^998/, "");
  const { data: users } = await supabaseAdmin
    .from("users")
    .select("id, login, full_name, telegram_chat_id, is_active")
    .or(`login.eq.${login},phone.eq.${login},phone.eq.${cleanPhone}`)
    .limit(1);

  const u = users?.[0];

  // Foydalanuvchi mavjudligi yoki Telegram bog'langanligini ko'rsatmaymiz (enumeration himoyasi)
  if (!u || !u.is_active || !u.telegram_chat_id) {
    await audit(req, null, "forgot_password_request", "users", u?.id || null,
      { login, has_user: !!u, has_telegram: !!u?.telegram_chat_id });
    return ok({ sent: true });
  }

  // OTP
  const code = generateOtp();
  const codeHash = await bcrypt.hash(code, 8);
  const expiresAt = new Date(Date.now() + TTL_MIN * 60_000).toISOString();
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;

  // Eski ishlatilmagan kodlarni bekor qilish
  await supabaseAdmin
    .from("password_reset_codes")
    .update({ used_at: new Date().toISOString() })
    .eq("user_id", u.id)
    .is("used_at", null);

  await supabaseAdmin.from("password_reset_codes").insert({
    user_id: u.id, code_hash: codeHash, expires_at: expiresAt, ip,
  });

  await sendMessage(
    u.telegram_chat_id,
    `🔑 <b>Parol tiklash kodi</b>\n\nKod: <code>${code}</code>\n\nBu kod ${TTL_MIN} daqiqa ichida amal qiladi.\n\nAgar bu siz emassiz — bu xabarni o'tkazib yuboring.`
  );

  await audit(req, null, "forgot_password_request", "users", u.id, { login });
  return ok({ sent: true });
}
