import { supabaseAdmin } from "../../../lib/server-supabase.js";
import { ok, bad } from "../../../lib/api-helpers.js";
import { audit } from "../../../lib/audit.js";

/**
 * Avtomatik davomat sinxronizatsiyasi (Vercel Cron yoki manual trigger).
 *
 * Sheets: https://docs.google.com/spreadsheets/d/{ATT_SHEET_ID}/export?format=csv&gid={ATT_SHEET_GID}
 *   Sheet "Publish to web" qilingan bo'lishi kerak (avtomatik CSV uchun).
 *
 * Auth (qo'lda chaqirsa):
 *   - Header `x-cron-secret: <CRON_SECRET>` yoki
 *   - Authorization: Bearer (admin JWT) — kelajakda
 *   - Vercel Cron avtomatik tarzda chaqiradi (vercel.json'dagi schedule).
 *
 * Logika:
 *   - CSV'dan May 2026 (yoki ko'rsatilgan oy) yozuvlarini yuklab oladi
 *   - Operator nomini DB'dagi users bilan moslab topadi (x↔h variant ham)
 *   - Har (operator, kun) uchun: arrived_at, left_at, late_minutes ni upsert qiladi
 *   - tasks_completed va quality_score'ni TEKSHIRMAYDI (boshqa joydan keladi)
 *
 * Query params:
 *   ?from=YYYY-MM-DD  (default: oy boshi)
 *   ?to=YYYY-MM-DD    (default: bugun)
 *   ?dryRun=1         (faqat hisoblash, yozmaslik)
 */

const SHEET_CSV_URL = process.env.ATT_SHEET_CSV_URL ||
  // Fallback: standart export URL (sheet public bo'lishi kerak)
  (process.env.ATT_SHEET_ID && process.env.ATT_SHEET_GID
    ? `https://docs.google.com/spreadsheets/d/${process.env.ATT_SHEET_ID}/export?format=csv&gid=${process.env.ATT_SHEET_GID}`
    : null);

function norm(s) {
  if (!s) return "";
  return String(s).trim().toLowerCase()
    .replace(/['`’ʼʻ]/g, "")
    .split(/\s+/).sort().join(" ");
}

function nameVariants(n) {
  return [n, n.replaceAll("x", "h"), n.replaceAll("h", "x"), n.replaceAll("kh", "h")];
}

// Minimal CSV parser (handles quoted fields with commas/newlines)
function parseCsv(text) {
  const rows = [];
  let row = [], cell = "", inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { cell += '"'; i++; }
        else inQuotes = false;
      } else cell += c;
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ",") { row.push(cell); cell = ""; }
      else if (c === "\n") { row.push(cell); rows.push(row); row = []; cell = ""; }
      else if (c === "\r") { /* skip */ }
      else cell += c;
    }
  }
  if (cell.length > 0 || row.length > 0) { row.push(cell); rows.push(row); }
  return rows;
}

function hmsToHm(s) {
  if (!s) return null;
  const parts = String(s).trim().split(":");
  if (parts.length < 2) return null;
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export async function GET(req) {
  return run(req);
}
export async function POST(req) {
  return run(req);
}

async function run(req) {
  // Auth: Vercel Cron (x-vercel-cron header) yoki x-cron-secret
  const url = new URL(req.url);
  const auth = req.headers.get("authorization") || "";
  const cronHeader = req.headers.get("x-vercel-cron");
  const secretHeader = req.headers.get("x-cron-secret");
  const secretEnv = process.env.CRON_SECRET;

  const isVercelCron = !!cronHeader;
  const isOurSecret = secretEnv && secretHeader === secretEnv;
  const isBearer = secretEnv && auth === `Bearer ${secretEnv}`;
  if (!isVercelCron && !isOurSecret && !isBearer) {
    return bad("forbidden", 403);
  }

  if (!SHEET_CSV_URL) {
    return bad("att_sheet_url_not_configured", 503);
  }

  const today = new Date();
  const fromStr = url.searchParams.get("from") || `${today.getUTCFullYear()}-${String(today.getUTCMonth() + 1).padStart(2, "0")}-01`;
  const toStr = url.searchParams.get("to") || today.toISOString().slice(0, 10);
  const dryRun = url.searchParams.get("dryRun") === "1";
  const fromDate = new Date(fromStr + "T00:00:00Z");
  const toDate = new Date(toStr + "T23:59:59Z");

  // 1) CSV
  let csvText;
  try {
    const r = await fetch(SHEET_CSV_URL, { redirect: "follow", cache: "no-store" });
    if (!r.ok) return bad(`sheet_fetch_failed_${r.status}`, 502);
    csvText = await r.text();
  } catch (e) {
    return bad(`sheet_fetch_error: ${String(e?.message || e)}`, 502);
  }

  const rows = parseCsv(csvText);
  if (!rows.length) return bad("empty_csv", 502);
  const header = rows[0].map(h => h.trim());
  const idx = (n) => header.findIndex(h => h.toLowerCase() === n.toLowerCase());
  const iSana = idx("Sana");
  const iFio = idx("F.I.O");
  const iKel = idx("Kelish");
  const iKet = idx("Ketish");
  const iKech = idx("Kechikish(min)");
  if (iSana < 0 || iFio < 0 || iKel < 0) {
    return bad("required_columns_missing", 400);
  }

  // 2) Aggregate per (FIO, date)
  const agg = new Map();
  let parsed = 0;
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if (!row || row.length < header.length - 1) continue;
    const sana = (row[iSana] || "").trim();
    const fio = (row[iFio] || "").trim();
    const kel = (row[iKel] || "").trim();
    const ket = (row[iKet] || "").trim();
    const kech = parseInt((row[iKech] || "0").trim(), 10) || 0;
    if (!sana || !fio) continue;
    const d = new Date(sana + "T00:00:00Z");
    if (Number.isNaN(d.getTime())) continue;
    if (d < fromDate || d > toDate) continue;
    parsed++;
    const key = `${norm(fio)}|${sana}`;
    const cur = agg.get(key) || { sana, fio, fioNorm: norm(fio), kel: null, ket: null, kech: 0 };
    if (kel && (!cur.kel || kel < cur.kel)) cur.kel = kel;
    if (ket && (!cur.ket || ket > cur.ket)) cur.ket = ket;
    if (cur.kech === 0) cur.kech = kech;
    agg.set(key, cur);
  }

  // 3) Operators from DB
  const { data: users } = await supabaseAdmin
    .from("users").select("id, full_name, is_active")
    .eq("role", "operator").eq("is_active", true);
  const byNorm = new Map();
  for (const u of users || []) byNorm.set(norm(u.full_name), u);

  // 4) Match + upsert
  const ops = { matched: 0, unmatched: new Set(), inserted: 0, updated: 0, errors: [] };
  // Build existing reports lookup once
  const { data: existing } = await supabaseAdmin
    .from("reports").select("id, user_id, date")
    .gte("date", fromStr).lte("date", toStr);
  const existingMap = new Map();
  for (const r of existing || []) existingMap.set(`${r.user_id}|${r.date}`, r.id);

  const lateFine = 1000; // fallback; tier hisobi calcDailyAmount'da qilinadi
  const tasks = [];
  for (const it of agg.values()) {
    let user = byNorm.get(it.fioNorm);
    if (!user) {
      for (const v of nameVariants(it.fioNorm)) {
        const u = byNorm.get(v);
        if (u) { user = u; break; }
      }
    }
    if (!user) {
      ops.unmatched.add(it.fio);
      continue;
    }
    ops.matched++;
    const arrived_at = hmsToHm(it.kel) || "00:00";
    const left_at = hmsToHm(it.ket);
    const payload = {
      user_id: user.id,
      date: it.sana,
      arrived_at,
      late_minutes: it.kech,
    };
    if (left_at) payload.left_at = left_at;
    tasks.push(payload);
  }

  if (dryRun) {
    return ok({
      dryRun: true, parsed, matched: ops.matched,
      unmatched: Array.from(ops.unmatched).slice(0, 30),
      tasksCount: tasks.length,
    });
  }

  // Execute upserts
  for (const p of tasks) {
    const key = `${p.user_id}|${p.date}`;
    const id = existingMap.get(key);
    if (id) {
      const { error } = await supabaseAdmin
        .from("reports")
        .update({ arrived_at: p.arrived_at, left_at: p.left_at ?? null, late_minutes: p.late_minutes })
        .eq("id", id);
      if (error) ops.errors.push(error.message);
      else ops.updated++;
    } else {
      const newId = `r_${p.user_id.slice(0, 6)}_${p.date}_${Math.random().toString(36).slice(2, 8)}`;
      const { error } = await supabaseAdmin.from("reports").insert({
        ...p,
        id: newId,
        tasks_completed: 0,
        quality_score: 90,
        notes: "",
        daily_amount: -p.late_minutes * lateFine, // tier asosida frontend qayta hisoblaydi
      });
      if (error) ops.errors.push(error.message);
      else ops.inserted++;
    }
  }

  await audit(req, { sub: "system", login: "cron", role: "system" }, "sync_attendance", "reports", null, {
    from: fromStr, to: toStr, parsed, matched: ops.matched,
    inserted: ops.inserted, updated: ops.updated,
    unmatchedCount: ops.unmatched.size,
  });

  return ok({
    parsed, matched: ops.matched,
    inserted: ops.inserted, updated: ops.updated,
    unmatched: Array.from(ops.unmatched).slice(0, 30),
    errors: ops.errors.slice(0, 5),
  });
}
