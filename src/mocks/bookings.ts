import type { BookingRequest, BookingRequestVM } from "@/types";
import { mockLocations } from "./locations";
import { mockUsers } from "./users";

export const mockBookingRequests: BookingRequest[] = [
  {
    id: "booking-1",
    locationId: "loc-1",
    creatorId: "user-creator-1",
    start: "2026-03-10T09:00:00Z",
    end: "2026-03-10T13:00:00Z",
    durationHours: 4,
    priceEstimate: 1000,
    status: "requested",
    notes: "צילום מוצר לקמפיין אביב",
    createdAt: "2026-03-01T08:00:00Z",
    updatedAt: "2026-03-01T08:00:00Z",
  },
  {
    id: "booking-2",
    locationId: "loc-2",
    creatorId: "user-creator-2",
    start: "2026-03-12T14:00:00Z",
    end: "2026-03-12T18:00:00Z",
    durationHours: 4,
    priceEstimate: 720,
    status: "approved",
    notes: "לוק בוק אופנה",
    hostNote: "אנא הגיעו 15 דק' לפני",
    createdAt: "2026-03-02T10:00:00Z",
    updatedAt: "2026-03-03T09:00:00Z",
  },
  {
    id: "booking-3",
    locationId: "loc-1",
    creatorId: "user-creator-1",
    start: "2026-02-20T10:00:00Z",
    end: "2026-02-20T14:00:00Z",
    durationHours: 4,
    priceEstimate: 1000,
    status: "cancelled",
    notes: "סרט קצר",
    createdAt: "2026-02-10T08:00:00Z",
    updatedAt: "2026-02-15T09:00:00Z",
  },
];

export const mockBookingRequestVMs: BookingRequestVM[] = mockBookingRequests.map((b) => {
  const location = mockLocations.find((l) => l.id === b.locationId);
  const creator = mockUsers.find((u) => u.id === b.creatorId);
  return {
    ...b,
    locationTitle: location?.title ?? "—",
    locationCoverUrl:
      location?.mediaGallery.find((m) => m.isFeatured)?.url ??
      location?.mediaGallery[0]?.url ??
      "",
    creatorName: creator?.name ?? "—",
  };
});
