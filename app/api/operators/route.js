import { supabaseAdmin } from "../../lib/server-supabase.js";
import { requireAdmin, ok, bad } from "../../lib/api-helpers.js";
import { hashPassword } from "../../lib/auth.js";

const SAFE_COLS = "id, login, full_name, phone, emoji, role, is_active, lang, theme, created_at";

export async function GET() {
  const r = await requireAdmin();
  if (r.error) return r.error;
  const { data, error } = await supabaseAdmin
    .from("users")
    .select(SAFE_COLS)
    .eq("role", "operator")
    .order("created_at", { ascending: true });
  if (error) return bad("server_error", 500);
  return ok({ operators: data || [] });
}

export async function POST(req) {
  const r = await requireAdmin();
  if (r.error) return r.error;
  let body;
  try { body = await req.json(); } catch { return bad("invalid JSON"); }
  const { login, password, full_name, phone, emoji } = body || {};
  if (!login || !password || !full_name) return bad("login, password, full_name required");

  const id = (globalThis.crypto?.randomUUID?.() || `op_${Date.now()}`).toString();
  const hashed = await hashPassword(String(password));
  const { error } = await supabaseAdmin.from("users").insert({
    id, login: String(login).trim(), password: hashed,
    full_name: String(full_name).trim(),
    phone: String(phone || "").trim(),
    emoji: String(emoji || "👩‍💼"),
    role: "operator", is_active: true,
  });
  if (error) {
    if (String(error.message || "").includes("duplicate")) return bad("login_taken", 409);
    return bad("server_error", 500);
  }
  const { data } = await supabaseAdmin.from("users").select(SAFE_COLS).eq("id", id).single();
  return ok({ operator: data });
}
