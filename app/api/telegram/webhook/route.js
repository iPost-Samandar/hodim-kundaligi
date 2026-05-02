import { supabaseAdmin } from "../../../lib/server-supabase.js";
import { sendMessage, webhookSecret, tgEnabled } from "../../../lib/telegram.js";
import { audit } from "../../../lib/audit.js";

// Telegram bot webhook handler.
// Telegram URL: https://YOUR_DOMAIN/api/telegram/webhook?secret=<TELEGRAM_WEBHOOK_SECRET>

export async function POST(req) {
  if (!tgEnabled()) return Response.json({ ok: false, error: "telegram_not_configured" }, { status: 503 });

  // Webhook secretni tekshirish
  const url = new URL(req.url);
  const secret = url.searchParams.get("secret") || req.headers.get("x-telegram-bot-api-secret-token");
  if (secret !== webhookSecret()) {
    return Response.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  let update;
  try { update = await req.json(); } catch { return Response.json({ ok: false }, { status: 400 }); }

  const msg = update?.message;
  if (!msg?.chat?.id || !msg?.text) return Response.json({ ok: true });

  const chatId = msg.chat.id;
  const text = String(msg.text).trim();

  // /start <token>
  const startMatch = text.match(/^\/start\s+([a-f0-9]{8,})$/i);
  if (startMatch) {
    const token = startMatch[1];
    const { data: u } = await supabaseAdmin
      .from("users")
      .select("id, full_name, telegram_link_expires_at")
      .eq("telegram_link_token", token)
      .single();

    if (!u) {
      await sendMessage(chatId, "❌ Token noto'g'ri yoki muddati tugagan.");
      return Response.json({ ok: true });
    }
    const expired = u.telegram_link_expires_at && new Date(u.telegram_link_expires_at).getTime() < Date.now();
    if (expired) {
      await sendMessage(chatId, "❌ Token muddati tugagan. Sozlamalardan yangi token oling.");
      return Response.json({ ok: true });
    }

    await supabaseAdmin
      .from("users")
      .update({
        telegram_chat_id: chatId,
        telegram_link_token: null,
        telegram_link_expires_at: null,
      })
      .eq("id", u.id);

    await sendMessage(
      chatId,
      `✅ <b>Bog'landi!</b>\n\nSalom, ${u.full_name}. Endi sizga muhim bildirishnomalar va parol tiklash kodlari shu yerga keladi.`
    );
    await audit(req, { sub: u.id, login: null, role: null }, "telegram_linked", "users", u.id);
    return Response.json({ ok: true });
  }

  if (text === "/start" || text === "/help") {
    await sendMessage(
      chatId,
      "👋 Bu Hodim Kundaligi xabarnoma boti.\n\nAkkauntingizni bog'lash uchun ilovaning <b>Sozlamalar</b> bo'limidan <b>Telegram bilan bog'lash</b> tugmasini bosing va keladigan havoladan o'ting."
    );
    return Response.json({ ok: true });
  }

  if (text === "/unlink") {
    await supabaseAdmin
      .from("users")
      .update({ telegram_chat_id: null })
      .eq("telegram_chat_id", chatId);
    await sendMessage(chatId, "🔌 Bog'lanish uzildi. Endi xabarnomalar kelmaydi.");
    return Response.json({ ok: true });
  }

  // Boshqa xabarlarga muloyim javob
  await sendMessage(chatId, "Ushbu botda buyruqlar: /start (yordam), /unlink (bog'lashni uzish).");
  return Response.json({ ok: true });
}
