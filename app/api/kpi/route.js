import { supabaseAdmin } from "../../lib/server-supabase.js";
import { requireUser, requireAdmin, ok, bad } from "../../lib/api-helpers.js";
import { audit } from "../../lib/audit.js";
import { DEFAULT_LATE_FINE_TIERS } from "../../lib/late-fine.js";

function normalizeTiers(input) {
  if (!Array.isArray(input)) return null;
  const cleaned = input
    .map((t) => ({
      from: Number(t.from || 0),
      to: t.to === null || t.to === undefined || t.to === "" ? null : Number(t.to),
      percent: t.percent === null || t.percent === undefined || t.percent === "" ? null : Number(t.percent),
      amount: Number(t.amount || 0),
    }))
    .filter((t) => Number.isFinite(t.from) && Number.isFinite(t.amount))
    .sort((a, b) => {
      if (a.to == null) return 1;
      if (b.to == null) return -1;
      return a.to - b.to;
    });
  return cleaned.length ? cleaned : null;
}

export async function GET() {
  const r = await requireUser();
  if (r.error) return r.error;
  const { data, error } = await supabaseAdmin
    .from("kpi_rules").select("*").eq("id", 1).single();
  if (error) return bad("server_error", 500);
  const tiers = normalizeTiers(data?.late_fine_tiers) || DEFAULT_LATE_FINE_TIERS;
  return ok({
    kpi: {
      lateFine: Number(data?.late_fine ?? 1000),
      taskRate: Number(data?.task_rate ?? 5000),
      qualityCoef: Number(data?.quality_coef ?? 1),
      lateFineTiers: tiers,
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
  const tiers = normalizeTiers(body?.lateFineTiers);

  const update = {
    id: 1, late_fine: lateFine, task_rate: taskRate, quality_coef: qualityCoef,
    updated_at: new Date().toISOString(),
  };
  if (tiers) update.late_fine_tiers = tiers;

  const { error } = await supabaseAdmin.from("kpi_rules").upsert(update);
  if (error) return bad("server_error", 500);
  await audit(req, r.user, "kpi_update", "kpi_rules", "1", {
    lateFine, taskRate, qualityCoef, tiersCount: tiers?.length || null,
  });
  return ok({ ok: true });
}
