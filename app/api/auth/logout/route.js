import { cookies } from "next/headers";
import { clearSessionCookieOptions } from "../../../lib/auth.js";
import { ok } from "../../../lib/api-helpers.js";

export async function POST() {
  const opts = clearSessionCookieOptions();
  cookies().set(opts.name, "", opts);
  return ok({ ok: true });
}
