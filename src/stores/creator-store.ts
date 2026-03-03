import { create } from "zustand";
import type { BookingRequest, BookingStatus, Location } from "@/types";
import { mockLocations } from "@/mocks/locations";
import { mockBookingRequests } from "@/mocks/bookings";

const CREATOR_ID = "user-creator-1";

interface CreatorStore {
  bookingRequests: BookingRequest[];
  locations: Location[];

  cancelBooking: (id: string) => void;

  getCreatorBookings: () => BookingRequest[];
  getBookingById: (id: string) => BookingRequest | undefined;
  getLocationById: (id: string) => Location | undefined;
}

export const useCreatorStore = create<CreatorStore>((set, get) => ({
  bookingRequests: mockBookingRequests,
  locations: mockLocations,

  cancelBooking: (id) =>
    set((state) => ({
      bookingRequests: state.bookingRequests.map((r) =>
        r.id === id && (r.status === "requested" || r.status === "approved")
          ? { ...r, status: "cancelled" as BookingStatus, updatedAt: new Date().toISOString() }
          : r
      ),
    })),

  getCreatorBookings: () =>
    get().bookingRequests.filter((r) => r.creatorId === CREATOR_ID),

  getBookingById: (id) =>
    get().bookingRequests.find((r) => r.id === id),

  getLocationById: (id) =>
    get().locations.find((l) => l.id === id),
}));
