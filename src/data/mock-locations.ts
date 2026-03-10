/**
 * Static marketing category definitions (used for category filter UI).
 * Location data now lives in Supabase – see src/app/actions/locations.ts.
 */

export interface MockCategory {
  id: string;
  nameKey: string;
  slug: string;
  count?: number;
}

export interface MockShowcaseVideo {
  id: string;
  url: string;
  thumbnailUrl?: string;
  captionKey?: string;
}

export interface MockLocation {
  id: string;
  slug: string;
  titleKey: string;
  cityKey: string;
  categorySlug: string;
  priceDaily: number;
  imagePlaceholder: string;
  available?: boolean;
  descriptionKey: string;
  amenitiesKeys: string[];
  rulesKeys: string[];
  hostNameKey: string;
  showcaseVideos?: MockShowcaseVideo[];
}

export const MOCK_CATEGORIES: MockCategory[] = [
  { id: "1", nameKey: "categories.studio", slug: "studio" },
  { id: "2", nameKey: "categories.podcast", slug: "podcast" },
  { id: "3", nameKey: "categories.outdoor-photography", slug: "outdoor-photography" },
  { id: "4", nameKey: "categories.event-hall", slug: "event-hall" },
  { id: "5", nameKey: "categories.offices", slug: "offices" },
];

// All demo locations removed – real data lives in Supabase.
export const MOCK_LOCATIONS: MockLocation[] = [];

export function getLocationBySlug(_slug: string): MockLocation | undefined {
  return undefined;
}

export function getSimilarLocations(_location: MockLocation, _limit = 4): MockLocation[] {
  return [];
}
