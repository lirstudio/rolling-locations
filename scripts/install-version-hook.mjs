#!/usr/bin/env node
/** Installs pre-commit hook to regenerate version.ts before each commit. */
import { writeFileSync, chmodSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const hookPath = join(root, ".git", "hooks", "pre-commit");
const content = `#!/bin/sh
node scripts/generate-version.mjs
git add src/generated/version.ts
`;
try {
  writeFileSync(hookPath, content);
  chmodSync(hookPath, 0o755);
} catch {
  /* .git may not exist (npm pack, etc.) */
}
