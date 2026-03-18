export const CACHE_TAGS = {
  publishedLocations: "published-locations",
  locationSlug: (slug: string) => `location-slug-${slug}`,
} as const;
