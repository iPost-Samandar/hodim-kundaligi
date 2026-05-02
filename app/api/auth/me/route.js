import { supabaseAdmin } from "../../../lib/server-supabase.js";
import { getSession } from "../../../lib/api-helpers.js";

export async function GET() {
  const s = await getSession();
  if (!s) return Response.json({ user: null });
  const { data } = await supabaseAdmin
    .from("users")
    .select("id, login, full_name, phone, emoji, role, is_active, lang, theme, telegram_chat_id")
    .eq("id", s.sub)
    .single();
  if (!data || !data.is_active) return Response.json({ user: null });
  // Frontend'ga faqat boolean ko'rsatamiz, chat_idning o'zini emas
  const { telegram_chat_id, ...rest } = data;
  return Response.json({ user: { ...rest, telegram_linked: Boolean(telegram_chat_id) } });
}
