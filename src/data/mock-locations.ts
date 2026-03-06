/**
 * Mock location and category data for marketing pages. No backend.
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
  priceHourly: number;
  priceDaily?: number;
  imagePlaceholder: string;
  available?: boolean;
  descriptionKey: string;
  amenitiesKeys: string[];
  rulesKeys: string[];
  hostNameKey: string;
  showcaseVideos?: MockShowcaseVideo[];
}

export const MOCK_CATEGORIES: MockCategory[] = [
  { id: "1", nameKey: "categories.studio", slug: "studio", count: 12 },
  { id: "2", nameKey: "categories.office", slug: "office", count: 8 },
  { id: "3", nameKey: "categories.loft", slug: "loft", count: 5 },
  { id: "4", nameKey: "categories.outdoor", slug: "outdoor", count: 4 },
];

export const MOCK_LOCATIONS: MockLocation[] = [
  {
    id: "1",
    slug: "studio-tel-aviv-north",
    titleKey: "locations.studioNorth",
    cityKey: "cities.telAviv",
    categorySlug: "studio",
    priceHourly: 180,
    priceDaily: 1200,
    imagePlaceholder: "studio",
    available: true,
    descriptionKey: "desc.studioNorth",
    amenitiesKeys: ["amenities.wifi", "amenities.ac", "amenities.parking", "amenities.backdrop"],
    rulesKeys: ["rules.noSmoking", "rules.quietHours"],
    hostNameKey: "hosts.mika",
    showcaseVideos: [
      {
        id: "sv-1-1",
        url: "https://www.youtube.com/watch?v=wBu0BUNGIPc",
        thumbnailUrl: "https://img.youtube.com/vi/wBu0BUNGIPc/sddefault.jpg",
        captionKey: "showcaseVideos.studioReel",
      },
      {
        id: "sv-1-2",
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        captionKey: "showcaseVideos.behindTheScenes",
      },
    ],
  },
  {
    id: "2",
    slug: "modern-office-ramat-gan",
    titleKey: "locations.officeRamatGan",
    cityKey: "cities.ramatGan",
    categorySlug: "office",
    priceHourly: 150,
    priceDaily: 900,
    imagePlaceholder: "office",
    available: true,
    descriptionKey: "desc.officeRamatGan",
    amenitiesKeys: ["amenities.wifi", "amenities.ac", "amenities.whiteboard"],
    rulesKeys: ["rules.noSmoking"],
    hostNameKey: "hosts.david",
    showcaseVideos: [
      {
        id: "sv-2-1",
        url: "https://www.youtube.com/watch?v=wBu0BUNGIPc",
        thumbnailUrl: "https://img.youtube.com/vi/wBu0BUNGIPc/sddefault.jpg",
        captionKey: "showcaseVideos.officeShoot",
      },
    ],
  },
  {
    id: "3",
    slug: "loft-jaffa",
    titleKey: "locations.loftJaffa",
    cityKey: "cities.jaffa",
    categorySlug: "loft",
    priceHourly: 220,
    priceDaily: 1500,
    imagePlaceholder: "loft",
    available: true,
    descriptionKey: "desc.loftJaffa",
    amenitiesKeys: ["amenities.wifi", "amenities.naturalLight", "amenities.parking"],
    rulesKeys: ["rules.noSmoking", "rules.noPets"],
    hostNameKey: "hosts.yael",
    showcaseVideos: [
      {
        id: "sv-3-1",
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
        captionKey: "showcaseVideos.loftCampaign",
      },
    ],
  },
  {
    id: "4",
    slug: "rooftop-studio-tlv",
    titleKey: "locations.rooftopTlv",
    cityKey: "cities.telAviv",
    categorySlug: "studio",
    priceHourly: 250,
    imagePlaceholder: "studio",
    available: false,
    descriptionKey: "desc.rooftopTlv",
    amenitiesKeys: ["amenities.wifi", "amenities.naturalLight", "amenities.rooftop"],
    rulesKeys: ["rules.noSmoking", "rules.quietHours"],
    hostNameKey: "hosts.ron",
  },
  {
    id: "5",
    slug: "minimal-office-hertzliya",
    titleKey: "locations.officeHertzliya",
    cityKey: "cities.hertzliya",
    categorySlug: "office",
    priceHourly: 120,
    priceDaily: 700,
    imagePlaceholder: "office",
    available: true,
    descriptionKey: "desc.officeHertzliya",
    amenitiesKeys: ["amenities.wifi", "amenities.ac"],
    rulesKeys: ["rules.noSmoking"],
    hostNameKey: "hosts.david",
  },
  {
    id: "6",
    slug: "garden-studio-kfar-saba",
    titleKey: "locations.gardenStudio",
    cityKey: "cities.kfarSaba",
    categorySlug: "outdoor",
    priceHourly: 200,
    priceDaily: 1100,
    imagePlaceholder: "outdoor",
    available: true,
    descriptionKey: "desc.gardenStudio",
    amenitiesKeys: ["amenities.wifi", "amenities.naturalLight", "amenities.parking", "amenities.garden"],
    rulesKeys: ["rules.noSmoking", "rules.quietHours"],
    hostNameKey: "hosts.mika",
  },
];

export function getLocationBySlug(slug: string): MockLocation | undefined {
  return MOCK_LOCATIONS.find((l) => l.slug === slug);
}

export function getSimilarLocations(location: MockLocation, limit = 4): MockLocation[] {
  return MOCK_LOCATIONS.filter(
    (l) => l.id !== location.id && (l.categorySlug === location.categorySlug || l.cityKey === location.cityKey)
  ).slice(0, limit);
}
