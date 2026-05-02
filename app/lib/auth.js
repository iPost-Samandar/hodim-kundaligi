import "server-only";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";

const SECRET = process.env.JWT_SECRET;
if (!SECRET) throw new Error("JWT_SECRET is not set");
const KEY = new TextEncoder().encode(SECRET);

const SESSION_COOKIE = "hk_session";
const SESSION_DAYS = 7;
const BCRYPT_ROUNDS = 10;

export const COOKIE_NAME = SESSION_COOKIE;

export async function hashPassword(plain) {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

export function isBcryptHash(s) {
  return typeof s === "string" && /^\$2[aby]\$/.test(s);
}

export async function verifyPassword(plain, stored) {
  if (!stored) return false;
  if (isBcryptHash(stored)) return bcrypt.compare(plain, stored);
  return plain === stored;
}

export async function signSession(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(KEY);
}

export async function verifySession(token) {
  try {
    const { payload } = await jwtVerify(token, KEY);
    return payload;
  } catch {
    return null;
  }
}

export function sessionCookieOptions() {
  return {
    name: SESSION_COOKIE,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * SESSION_DAYS,
  };
}

export function clearSessionCookieOptions() {
  return { ...sessionCookieOptions(), maxAge: 0 };
}
