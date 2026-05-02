import { supabaseAdmin } from "../../../lib/server-supabase.js";
import { requireUser, ok, bad } from "../../../lib/api-helpers.js";
import { hashPassword, verifyPassword } from "../../../lib/auth.js";
import { audit } from "../../../lib/audit.js";

export async function PATCH(req) {
  const r = await requireUser();
  if (r.error) return r.error;
  let body;
  try { body = await req.json(); } catch { return bad("invalid JSON"); }
  const currentPassword = String(body?.currentPassword || "");
  const newPassword = String(body?.newPassword || "");
  if (newPassword.length < 4) return bad("password_too_short");

  const { data: u } = await supabaseAdmin
    .from("users").select("password").eq("id", r.user.sub).single();
  if (!u) return bad("not_found", 404);

  const valid = await verifyPassword(currentPassword, u.password);
  if (!valid) return bad("invalid_current_password", 401);

  const hashed = await hashPassword(newPassword);
  const { error } = await supabaseAdmin
    .from("users").update({ password: hashed }).eq("id", r.user.sub);
  if (error) return bad("server_error", 500);
  await audit(req, r.user, "password_change", "users", r.user.sub);
  return ok({ ok: true });
}
