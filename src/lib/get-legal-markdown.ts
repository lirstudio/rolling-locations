import fs from "node:fs/promises";
import path from "node:path";

export type LegalDocSlug = "privacy" | "terms";

const LEGAL_DIR = path.join(process.cwd(), "src", "content", "legal");

/**
 * Loads raw markdown for legal pages. Server-only — call from Server Components or Route Handlers.
 */
export async function getLegalMarkdown(slug: LegalDocSlug): Promise<string> {
  const filePath = path.join(LEGAL_DIR, `${slug}.md`);
  return fs.readFile(filePath, "utf-8");
}
