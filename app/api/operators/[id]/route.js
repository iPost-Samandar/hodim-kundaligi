import { supabaseAdmin } from "../../../lib/server-supabase.js";
import { requireAdmin, ok, bad } from "../../../lib/api-helpers.js";
import { hashPassword } from "../../../lib/auth.js";
import { audit } from "../../../lib/audit.js";

const SAFE_COLS = "id, login, full_name, phone, emoji, role, is_active, lang, theme, created_at";
const ALLOWED = new Set(["login", "full_name", "phone", "emoji", "is_active", "lang", "theme"]);

export async function PATCH(req, { params }) {
  const r = await requireAdmin();
  if (r.error) return r.error;
  let body;
  try { body = await req.json(); } catch { return bad("invalid JSON"); }
  const id = params.id;
  if (!id) return bad("id required");

  const update = {};
  for (const k of Object.keys(body || {})) {
    if (ALLOWED.has(k)) update[k] = body[k];
  }
  if (typeof body?.password === "string" && body.password.length > 0) {
    update.password = await hashPassword(body.password);
  }
  if (Object.keys(update).length === 0) return bad("nothing_to_update");

  const { error } = await supabaseAdmin.from("users").update(update).eq("id", id);
  if (error) return bad("server_error", 500);
  const { data } = await supabaseAdmin.from("users").select(SAFE_COLS).eq("id", id).single();
  await audit(req, r.user, "operator_update", "users", id, { fields: Object.keys(update) });
  return ok({ operator: data });
}

export async function DELETE(req, { params }) {
  const r = await requireAdmin();
  if (r.error) return r.error;
  const id = params.id;
  if (!id) return bad("id required");
  if (id === r.user.sub) return bad("cannot_delete_self", 400);
  const { error } = await supabaseAdmin.from("users").delete().eq("id", id).eq("role", "operator");
  if (error) return bad("server_error", 500);
  await audit(req, r.user, "operator_delete", "users", id);
  return ok({ ok: true });
}
