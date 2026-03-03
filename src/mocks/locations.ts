import type { Location, LocationCardVM } from "@/types";

export const mockLocations: Location[] = [
  {
    id: "loc-1",
    title: "סטודיו לבן נקי – תל אביב",
    description: "סטודיו מרווח עם אור טבעי ורקעים החלפים. מתאים לצילומי מוצר, פורטרט ותוכן.",
    type: "studio",
    address: {
      street: "רחוב דיזנגוף 50",
      city: "תל אביב",
      country: "IL",
      lat: 32.077,
      lng: 34.774,
    },
    mediaGallery: [
      { id: "m-1", url: "https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=800", type: "image", isFeatured: true },
    ],
    hostId: "user-host-1",
    categoryIds: ["cat-1"],
    pricing: { hourlyRate: 250, dailyRate: 1500, minimumHours: 2 },
    amenities: ["WiFi", "חניה", "מזגן", "שירותים"],
    rules: "אין לעשן בתוך הנכס. יש להשאיר את המקום נקי.",
    status: "published",
    createdAt: "2025-03-01T10:00:00Z",
  },
  {
    id: "loc-2",
    title: "גג פנורמי – ירושלים",
    description: "גג עם נוף 360° לעיר העתיקה. מושלם לצילומי אופנה ווידאו.",
    type: "rooftop",
    address: {
      street: "רחוב יפו 10",
      city: "ירושלים",
      country: "IL",
      lat: 31.779,
      lng: 35.225,
    },
    mediaGallery: [
      { id: "m-2", url: "https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=800", type: "image", isFeatured: true },
    ],
    hostId: "user-host-2",
    categoryIds: ["cat-2"],
    pricing: { hourlyRate: 180, minimumHours: 3 },
    amenities: ["נוף עיר", "גישה קלה"],
    status: "published",
    createdAt: "2025-03-05T09:00:00Z",
  },
  {
    id: "loc-3",
    title: "דירת לוקיישן מעוצבת – חיפה",
    description: "דירת 4 חדרים מעוצבת בסגנון מודרני, עם גינה פרטית.",
    type: "apartment",
    address: {
      street: "שדרות בן גוריון 15",
      city: "חיפה",
      country: "IL",
      lat: 32.815,
      lng: 34.989,
    },
    mediaGallery: [
      { id: "m-3", url: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800", type: "image", isFeatured: true },
    ],
    hostId: "user-host-1",
    categoryIds: ["cat-3"],
    pricing: { hourlyRate: 200, dailyRate: 1200 },
    amenities: ["גינה", "חניה", "WiFi", "מטבח מאובזר"],
    status: "draft",
    createdAt: "2025-03-10T11:00:00Z",
  },
];

export const mockLocationCards: LocationCardVM[] = mockLocations.map((l) => ({
  id: l.id,
  title: l.title,
  type: l.type,
  city: l.address.city,
  coverUrl: l.mediaGallery.find((m) => m.isFeatured)?.url ?? l.mediaGallery[0]?.url ?? "",
  hourlyRate: l.pricing.hourlyRate,
  dailyRate: l.pricing.dailyRate,
  status: l.status,
}));
