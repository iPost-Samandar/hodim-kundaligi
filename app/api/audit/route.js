import { supabaseAdmin } from "../../lib/server-supabase.js";
import { requireAdmin, ok, bad } from "../../lib/api-helpers.js";

export async function GET(req) {
  const r = await requireAdmin();
  if (r.error) return r.error;

  const url = new URL(req.url);
  const limit = Math.min(Number(url.searchParams.get("limit") || 100), 500);
  const action = url.searchParams.get("action");
  const actor = url.searchParams.get("actor");

  let q = supabaseAdmin
    .from("audit_log")
    .select("id, actor_id, actor_login, actor_role, action, entity, entity_id, meta, ip, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (action) q = q.eq("action", action);
  if (actor) q = q.eq("actor_id", actor);

  const { data, error } = await q;
  if (error) return bad("server_error", 500);
  return ok({ entries: data || [] });
}
