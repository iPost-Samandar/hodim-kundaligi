import { supabaseAdmin } from "../../lib/server-supabase.js";
import { requireUser, requireAdmin, ok, bad } from "../../lib/api-helpers.js";

export async function GET() {
  const r = await requireUser();
  if (r.error) return r.error;
  const { data, error } = await supabaseAdmin
    .from("kpi_rules").select("*").eq("id", 1).single();
  if (error) return bad("server_error", 500);
  return ok({
    kpi: {
      lateFine: Number(data?.late_fine ?? 1000),
      taskRate: Number(data?.task_rate ?? 5000),
      qualityCoef: Number(data?.quality_coef ?? 1),
    },
  });
}

export async function PATCH(req) {
  const r = await requireAdmin();
  if (r.error) return r.error;
  let body;
  try { body = await req.json(); } catch { return bad("invalid JSON"); }
  const lateFine = Number(body?.lateFine);
  const taskRate = Number(body?.taskRate);
  const qualityCoef = Number(body?.qualityCoef);
  if (!Number.isFinite(lateFine) || !Number.isFinite(taskRate) || !Number.isFinite(qualityCoef)) {
    return bad("invalid_numbers");
  }
  const { error } = await supabaseAdmin.from("kpi_rules").upsert({
    id: 1, late_fine: lateFine, task_rate: taskRate, quality_coef: qualityCoef,
    updated_at: new Date().toISOString(),
  });
  if (error) return bad("server_error", 500);
  return ok({ ok: true });
}
