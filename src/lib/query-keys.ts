export const queryKeys = {
  locations: {
    all: () => ["locations"] as const,
    published: () => ["locations", "published"] as const,
    allAdmin: () => ["locations", "admin", "all"] as const,
    bySlug: (slug: string) => ["locations", "slug", slug] as const,
    byHost: (hostId: string) => ["locations", "host", hostId] as const,
  },
  bookings: {
    all: () => ["bookings"] as const,
    host: () => ["bookings", "host"] as const,
  },
  availability: {
    dates: (locationId: string) =>
      ["availability", "dates", locationId] as const,
  },
  admin: {
    users: () => ["admin", "users"] as const,
    settings: () => ["admin", "settings"] as const,
  },
  site: {
    amenityCatalog: () => ["site", "amenity-catalog"] as const,
  },
  search: {
    command: (q: string) => ["search", "command", q] as const,
  },
  favorites: {
    all: () => ["favorites"] as const,
    byLocationId: (locationId: string) =>
      ["favorites", "location", locationId] as const,
  },
} as const;
