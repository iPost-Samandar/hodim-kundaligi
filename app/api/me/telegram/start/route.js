import { supabaseAdmin } from "../../../../lib/server-supabase.js";
import { requireUser, ok, bad } from "../../../../lib/api-helpers.js";
import { generateLinkToken, buildStartLink, tgEnabled, botUsername } from "../../../../lib/telegram.js";

const TTL_MIN = 15;

export async function POST() {
  if (!tgEnabled() || !botUsername()) return bad("telegram_not_configured", 503);
  const r = await requireUser();
  if (r.error) return r.error;

  const token = generateLinkToken();
  const expiresAt = new Date(Date.now() + TTL_MIN * 60_000).toISOString();
  const { error } = await supabaseAdmin
    .from("users")
    .update({ telegram_link_token: token, telegram_link_expires_at: expiresAt })
    .eq("id", r.user.sub);
  if (error) return bad("server_error", 500);

  return ok({
    url: buildStartLink(token),
    bot: botUsername(),
    expiresAt,
    ttlMin: TTL_MIN,
  });
}
