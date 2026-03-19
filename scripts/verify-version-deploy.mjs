#!/usr/bin/env node
/**
 * Ensures hosted builds do not overwrite committed version.ts.
 * Run: npm run verify:version
 */
import { readFileSync } from "fs";
import { spawnSync } from "child_process";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const versionPath = join(root, "src", "generated", "version.ts");

function assertSkip(envPatch, label) {
  const before = readFileSync(versionPath, "utf8");
  const r = spawnSync("node", ["scripts/generate-version.mjs"], {
    cwd: root,
    env: { ...process.env, ...envPatch },
    encoding: "utf8",
  });
  if (r.status !== 0) {
    console.error(`generate-version.mjs failed under ${label}:`, r.stderr);
    process.exit(1);
  }
  const after = readFileSync(versionPath, "utf8");
  if (before !== after) {
    console.error(`FAIL: version.ts changed under ${label} — should use committed file.`);
    process.exit(1);
  }
  console.log(`OK: ${label} leaves version.ts unchanged.`);
}

assertSkip({ VERCEL: "1" }, "VERCEL=1");
assertSkip({ NETLIFY: "true" }, "NETLIFY=true");
console.log("OK: hosted-env skips verified.");
const committed = readFileSync(versionPath, "utf8");
console.log("Committed APP_VERSION:", committed.match(/APP_VERSION = "([^"]+)"/)?.[1] ?? "?");
console.log("");
console.log("Live site checklist (if footer still looks wrong):");
console.log("  • Vercel → Deployments → confirm latest Production uses current Git commit");
console.log("  • Open the production domain (not an old Preview URL)");
console.log("  • Try private window or hard refresh (CDN/browser cache)");
