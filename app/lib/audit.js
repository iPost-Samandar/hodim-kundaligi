import "server-only";
import { supabaseAdmin } from "./server-supabase.js";

export async function audit(req, session, action, entity = null, entityId = null, meta = null) {
  try {
    const ip = req?.headers?.get?.("x-forwarded-for")?.split(",")[0]?.trim() || null;
    const userAgent = req?.headers?.get?.("user-agent") || null;
    await supabaseAdmin.from("audit_log").insert({
      actor_id: session?.sub || null,
      actor_login: session?.login || null,
      actor_role: session?.role || null,
      action,
      entity,
      entity_id: entityId ? String(entityId) : null,
      meta: meta || null,
      ip,
      user_agent: userAgent,
    });
  } catch (e) {
    console.warn("audit failed:", e?.message || e);
  }
}
