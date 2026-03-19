/** `site_settings.key` for JSON array of amenity label strings (admin-defined). */
export const LOCATION_AMENITY_CATALOG_KEY = "location_amenity_catalog";

export function parseAmenityCatalog(raw: string | null | undefined): string[] {
  if (!raw?.trim()) return [];
  try {
    const v = JSON.parse(raw) as unknown;
    if (!Array.isArray(v)) return [];
    return v
      .filter((x): x is string => typeof x === "string")
      .map((s) => s.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

export function serializeAmenityCatalog(tags: string[]): string {
  return JSON.stringify(
    tags.map((s) => s.trim()).filter(Boolean)
  );
}
