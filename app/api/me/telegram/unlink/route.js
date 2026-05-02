import { supabaseAdmin } from "../../../../lib/server-supabase.js";
import { requireUser, ok, bad } from "../../../../lib/api-helpers.js";
import { audit } from "../../../../lib/audit.js";
import { sendMessage } from "../../../../lib/telegram.js";

export async function POST(req) {
  const r = await requireUser();
  if (r.error) return r.error;
  const { data: u } = await supabaseAdmin
    .from("users").select("telegram_chat_id").eq("id", r.user.sub).single();

  const { error } = await supabaseAdmin
    .from("users")
    .update({ telegram_chat_id: null, telegram_link_token: null, telegram_link_expires_at: null })
    .eq("id", r.user.sub);
  if (error) return bad("server_error", 500);

  if (u?.telegram_chat_id) {
    await sendMessage(u.telegram_chat_id, "🔌 Bog'lanish uzildi. Endi xabarnomalar kelmaydi.");
  }
  await audit(req, r.user, "telegram_unlinked", "users", r.user.sub);
  return ok({ ok: true });
}
