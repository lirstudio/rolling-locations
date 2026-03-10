#!/usr/bin/env node
/**
 * Configures Supabase Send Email Hook via Management API.
 * Requires: SUPABASE_ACCESS_TOKEN, NEXT_PUBLIC_SUPABASE_URL or PROJECT_REF, SEND_EMAIL_HOOK_URL
 * Run: node --env-file=.env.local scripts/setup-auth-email-hook.mjs [hook_url]
 * Or: SEND_EMAIL_HOOK_URL=https://... node --env-file=.env.local scripts/setup-auth-email-hook.mjs
 */

const projectRef =
  process.env.PROJECT_REF ||
  (process.env.NEXT_PUBLIC_SUPABASE_URL
    ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname.split(".")[0]
    : null);
const hookUrl = process.env.SEND_EMAIL_HOOK_URL || process.argv[2];
const token = process.env.SUPABASE_ACCESS_TOKEN;

if (!token) {
  console.error("Missing SUPABASE_ACCESS_TOKEN. Create one at https://supabase.com/dashboard/account/tokens");
  process.exit(1);
}
if (!projectRef) {
  console.error("Missing PROJECT_REF or NEXT_PUBLIC_SUPABASE_URL");
  process.exit(1);
}
if (!hookUrl) {
  console.error("Missing SEND_EMAIL_HOOK_URL. Pass as arg or env: node script.mjs https://your-domain.com/api/auth/send-email");
  process.exit(1);
}

const url = `https://api.supabase.com/v1/projects/${projectRef}/config/auth`;
const res = await fetch(url, {
  method: "PATCH",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    hook_send_email_enabled: true,
    hook_send_email_uri: hookUrl,
  }),
});

if (!res.ok) {
  const t = await res.text();
  console.error("PATCH failed:", res.status, t);
  process.exit(1);
}

console.log("Send Email Hook configured.");
console.log("  Enabled: true");
console.log("  URL:", hookUrl);
console.log("");
console.log("Next: In Supabase Dashboard → Authentication → Hooks → Send Email → Generate Secret.");
console.log("Add to .env.local: SEND_EMAIL_HOOK_SECRET=v1,whsec_<the_secret>");
