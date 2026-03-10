/**
 * Generates a URL-friendly slug from a Hebrew/English title.
 * Falls back to a random suffix when the title produces no latin chars.
 */
export function generateSlug(title: string): string {
  const base = title
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9\u0590-\u05FF-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  const suffix = Date.now().toString(36);
  return base ? `${base}-${suffix}` : suffix;
}
