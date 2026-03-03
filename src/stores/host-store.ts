import { create } from "zustand";
import type {
  Location,
  AvailabilityBlock,
  BookingRequest,
  BookingStatus,
  LocationStatus,
} from "@/types";
import { mockLocations } from "@/mocks/locations";
import { mockBookingRequests } from "@/mocks/bookings";
import { mockAvailability } from "@/mocks/availability";

const HOST_ID = "user-host-1";

interface HostStore {
  locations: Location[];
  bookingRequests: BookingRequest[];
  availabilityBlocks: AvailabilityBlock[];

  // Location CRUD
  addLocation: (location: Location) => void;
  updateLocation: (id: string, updates: Partial<Location>) => void;
  deleteLocation: (id: string) => void;
  setLocationStatus: (id: string, status: LocationStatus) => void;

  // Availability
  addBlock: (block: AvailabilityBlock) => void;
  removeBlock: (id: string) => void;

  // Booking requests
  updateRequestStatus: (id: string, status: BookingStatus, hostNote?: string) => void;

  // Selectors
  getHostLocations: () => Location[];
  getLocationById: (id: string) => Location | undefined;
  getRequestsForHost: () => BookingRequest[];
  getBlocksForLocation: (locationId: string) => AvailabilityBlock[];
}

export const useHostStore = create<HostStore>((set, get) => ({
  locations: mockLocations,
  bookingRequests: mockBookingRequests,
  availabilityBlocks: mockAvailability,

  addLocation: (location) =>
    set((state) => ({ locations: [...state.locations, location] })),

  updateLocation: (id, updates) =>
    set((state) => ({
      locations: state.locations.map((l) =>
        l.id === id ? { ...l, ...updates } : l
      ),
    })),

  deleteLocation: (id) =>
    set((state) => ({
      locations: state.locations.filter((l) => l.id !== id),
    })),

  setLocationStatus: (id, status) =>
    set((state) => ({
      locations: state.locations.map((l) =>
        l.id === id ? { ...l, status } : l
      ),
    })),

  addBlock: (block) =>
    set((state) => ({
      availabilityBlocks: [...state.availabilityBlocks, block],
    })),

  removeBlock: (id) =>
    set((state) => ({
      availabilityBlocks: state.availabilityBlocks.filter((b) => b.id !== id),
    })),

  updateRequestStatus: (id, status, hostNote) =>
    set((state) => ({
      bookingRequests: state.bookingRequests.map((r) =>
        r.id === id
          ? {
              ...r,
              status,
              hostNote: hostNote ?? r.hostNote,
              updatedAt: new Date().toISOString(),
            }
          : r
      ),
    })),

  getHostLocations: () =>
    get().locations.filter((l) => l.hostId === HOST_ID),

  getLocationById: (id) => get().locations.find((l) => l.id === id),

  getRequestsForHost: () => {
    const hostLocationIds = get()
      .locations.filter((l) => l.hostId === HOST_ID)
      .map((l) => l.id);
    return get().bookingRequests.filter((r) =>
      hostLocationIds.includes(r.locationId)
    );
  },

  getBlocksForLocation: (locationId) =>
    get().availabilityBlocks.filter((b) => b.locationId === locationId),
}));
