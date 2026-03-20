const NOMINATIM_BASE = "https://nominatim.openstreetmap.org";
const USER_AGENT = "RollinLocations/1.0";
const RATE_LIMIT_MS = 1100;

let lastRequestTime = 0;

async function rateLimitedFetch(url: string): Promise<Response> {
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < RATE_LIMIT_MS) {
    await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_MS - elapsed));
  }
  lastRequestTime = Date.now();
  return fetch(url, {
    headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
  });
}

export interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    road?: string;
    house_number?: string;
    neighbourhood?: string;
    suburb?: string;
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country?: string;
    country_code?: string;
  };
}

export interface ParsedAddress {
  street: string;
  neighborhood: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  displayName: string;
}

function parseResult(r: NominatimResult): ParsedAddress {
  const addr = r.address ?? {};
  const street = [addr.road, addr.house_number].filter(Boolean).join(" ");
  const city = addr.city ?? addr.town ?? addr.village ?? "";
  const neighborhood = addr.neighbourhood ?? addr.suburb ?? "";
  const country = addr.country_code?.toUpperCase() ?? "";

  return {
    street,
    neighborhood,
    city,
    country,
    lat: parseFloat(r.lat),
    lng: parseFloat(r.lon),
    displayName: r.display_name,
  };
}

/**
 * Search addresses by free-text query. Biased toward Israel.
 */
export async function searchAddress(
  query: string,
  options?: { limit?: number; countryCode?: string }
): Promise<ParsedAddress[]> {
  if (!query.trim()) return [];

  const limit = options?.limit ?? 5;
  const cc = options?.countryCode ?? "il";
  const params = new URLSearchParams({
    q: query,
    format: "json",
    addressdetails: "1",
    limit: String(limit),
    countrycodes: cc,
  });

  const res = await rateLimitedFetch(`${NOMINATIM_BASE}/search?${params}`);
  if (!res.ok) return [];

  const data = (await res.json()) as NominatimResult[];
  return data.map(parseResult);
}

/**
 * Reverse-geocode lat/lng to address.
 */
export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<ParsedAddress | null> {
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lng),
    format: "json",
    addressdetails: "1",
  });

  const res = await rateLimitedFetch(`${NOMINATIM_BASE}/reverse?${params}`);
  if (!res.ok) return null;

  const data = (await res.json()) as NominatimResult;
  if (!data.lat) return null;
  return parseResult(data);
}
