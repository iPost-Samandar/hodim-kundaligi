import "server-only";

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const API = TOKEN ? `https://api.telegram.org/bot${TOKEN}` : null;

export const tgEnabled = () => Boolean(TOKEN);

export const botUsername = () =>
  process.env.TELEGRAM_BOT_USERNAME || "";

export const webhookSecret = () =>
  process.env.TELEGRAM_WEBHOOK_SECRET || "";

export async function sendMessage(chatId, text, opts = {}) {
  if (!API || !chatId) return { ok: false, error: "telegram_not_configured" };
  try {
    const res = await fetch(`${API}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: opts.parse_mode || "HTML",
        disable_web_page_preview: true,
        ...opts,
      }),
    });
    const j = await res.json().catch(() => ({}));
    return { ok: res.ok && j.ok, result: j.result, error: j.description };
  } catch (e) {
    return { ok: false, error: String(e?.message || e) };
  }
}

export function buildStartLink(token) {
  const u = botUsername().replace(/^@/, "");
  if (!u) return null;
  return `https://t.me/${u}?start=${encodeURIComponent(token)}`;
}

// 6 raqamli OTP
export function generateOtp() {
  const n = Math.floor(Math.random() * 1_000_000);
  return n.toString().padStart(6, "0");
}

// Bog'lash uchun random uzun token
export function generateLinkToken() {
  const arr = new Uint8Array(16);
  (globalThis.crypto || require("crypto").webcrypto).getRandomValues(arr);
  return Array.from(arr).map((b) => b.toString(16).padStart(2, "0")).join("");
}
