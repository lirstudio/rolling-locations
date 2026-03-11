#!/usr/bin/env node
/**
 * Add SEND_EMAIL_HOOK_SECRET to Vercel project env via API.
 * Requires: VERCEL_TOKEN (from https://vercel.com/account/tokens), .env.local with SEND_EMAIL_HOOK_SECRET.
 * Optional: VERCEL_PROJECT_NAME (default: rollin-locations), VERCEL_TEAM_ID (for team projects).
 * Run: node --env-file=.env.local scripts/add-vercel-env.mjs
 *      or: VERCEL_TOKEN=xxx node --env-file=.env.local scripts/add-vercel-env.mjs
 */

const token = process.env.VERCEL_TOKEN;
const secret = process.env.SEND_EMAIL_HOOK_SECRET;
const project = process.env.VERCEL_PROJECT_NAME || "rollin-locations";
const teamId = process.env.VERCEL_TEAM_ID;

if (!token) {
  console.error("Missing VERCEL_TOKEN. Create one at https://vercel.com/account/tokens and set it in .env.local or env.");
  process.exit(1);
}
if (!secret) {
  console.error("Missing SEND_EMAIL_HOOK_SECRET in .env.local");
  process.exit(1);
}

const url = new URL(`https://api.vercel.com/v10/projects/${encodeURIComponent(project)}/env`);
if (teamId) url.searchParams.set("teamId", teamId);

const res = await fetch(url.toString(), {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    key: "SEND_EMAIL_HOOK_SECRET",
    value: secret,
    type: "sensitive",
    target: ["production", "preview", "development"],
    upsert: "true",
  }),
});

if (!res.ok) {
  const t = await res.text();
  console.error("Vercel API error:", res.status, t);
  process.exit(1);
}

console.log("SEND_EMAIL_HOOK_SECRET added to Vercel project:", project);
console.log("Redeploy the project for the variable to take effect.");
