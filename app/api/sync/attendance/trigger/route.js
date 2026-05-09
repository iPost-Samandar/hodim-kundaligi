import { requireAdmin, ok, bad } from "../../../../lib/api-helpers.js";

/**
 * Admin tomondan qo'lda sinxronizatsiyani ishga tushirish.
 * /api/sync/attendance ni CRON_SECRET bilan chaqiradi.
 */
export async function POST(req) {
  const r = await requireAdmin();
  if (r.error) return r.error;

  const secret = process.env.CRON_SECRET;
  if (!secret) return bad("cron_secret_not_configured", 503);

  // Build absolute URL
  const url = new URL(req.url);
  const target = `${url.origin}/api/sync/attendance${url.search}`;

  try {
    const res = await fetch(target, {
      method: "POST",
      headers: { "x-cron-secret": secret, "Content-Type": "application/json" },
    });
    const text = await res.text();
    let body;
    try { body = JSON.parse(text); } catch { body = { raw: text }; }
    return Response.json({ status: res.status, ...body }, { status: res.ok ? 200 : 502 });
  } catch (e) {
    return bad(`trigger_failed: ${String(e?.message || e)}`, 502);
  }
}
