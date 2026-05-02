import "server-only";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { COOKIE_NAME, verifySession } from "./auth.js";

export async function getSession() {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySession(token);
}

export async function requireUser() {
  const s = await getSession();
  if (!s) return { error: NextResponse.json({ error: "unauthorized" }, { status: 401 }) };
  return { user: s };
}

export async function requireAdmin() {
  const r = await requireUser();
  if (r.error) return r;
  if (r.user.role !== "admin") return { error: NextResponse.json({ error: "forbidden" }, { status: 403 }) };
  return r;
}

export function ok(data, init) {
  return NextResponse.json(data, init);
}

export function bad(message, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

const buckets = new Map();
const WINDOW_MS = 15 * 60 * 1000;

export function checkLoginRateLimit(key, limit = 5) {
  const now = Date.now();
  const b = buckets.get(key) || { count: 0, resetAt: now + WINDOW_MS, lockedUntil: 0 };
  if (b.lockedUntil > now) {
    return { allowed: false, retryAfterSec: Math.ceil((b.lockedUntil - now) / 1000) };
  }
  if (now > b.resetAt) {
    b.count = 0;
    b.resetAt = now + WINDOW_MS;
  }
  b.count += 1;
  if (b.count > limit) {
    b.lockedUntil = now + WINDOW_MS;
    buckets.set(key, b);
    return { allowed: false, retryAfterSec: Math.ceil((b.lockedUntil - now) / 1000) };
  }
  buckets.set(key, b);
  return { allowed: true };
}

export function resetLoginRateLimit(key) {
  buckets.delete(key);
}

export function clientKey(req, login) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  return `${ip}|${(login || "").toLowerCase()}`;
}
