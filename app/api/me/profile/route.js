import { supabaseAdmin } from "../../../lib/server-supabase.js";
import { requireUser, ok, bad } from "../../../lib/api-helpers.js";

const ALLOWED = new Set(["full_name", "phone", "emoji", "lang", "theme"]);

export async function PATCH(req) {
  const r = await requireUser();
  if (r.error) return r.error;
  let body;
  try { body = await req.json(); } catch { return bad("invalid JSON"); }
  const update = {};
  for (const k of Object.keys(body || {})) {
    if (ALLOWED.has(k)) update[k] = body[k];
  }
  if (Object.keys(update).length === 0) return bad("nothing_to_update");

  const { error } = await supabaseAdmin
    .from("users").update(update).eq("id", r.user.sub);
  if (error) return bad("server_error", 500);
  return ok({ ok: true });
}
