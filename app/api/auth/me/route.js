import { supabaseAdmin } from "../../../lib/server-supabase.js";
import { getSession } from "../../../lib/api-helpers.js";

export async function GET() {
  const s = await getSession();
  if (!s) return Response.json({ user: null });
  const { data } = await supabaseAdmin
    .from("users")
    .select("id, login, full_name, phone, emoji, role, is_active, lang, theme")
    .eq("id", s.sub)
    .single();
  return Response.json({ user: data && data.is_active ? data : null });
}
