import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "sonner";
import type {
  Location,
  AvailabilityBlock,
  BookingRequest,
  BookingStatus,
  LocationStatus,
} from "@/types";
import { mockBookingRequests } from "@/mocks/bookings";
import { mockAvailability } from "@/mocks/availability";
import {
  saveLocation,
  deleteLocationAction,
  fetchAllLocations,
  backfillLocationHostId,
} from "@/app/actions/locations";
import { generateSlug } from "@/utils/slug";

const HOST_ID = "user-host-1";
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface HostStore {
  locations: Location[];
  bookingRequests: BookingRequest[];
  availabilityBlocks: AvailabilityBlock[];
  isSyncing: boolean;

  // Location CRUD – all persist to Supabase
  addLocation: (location: Location) => Promise<void>;
  updateLocation: (id: string, updates: Partial<Location>) => Promise<void>;
  deleteLocation: (id: string) => Promise<void>;
  setLocationStatus: (id: string, status: LocationStatus) => Promise<void>;

  // Sync / migration
  syncFromDb: (hostId?: string) => Promise<void>;

  // Availability
  addBlock: (block: AvailabilityBlock) => void;
  removeBlock: (id: string) => void;

  // Booking requests
  updateRequestStatus: (id: string, status: BookingStatus, hostNote?: string) => void;

  // Selectors
  getHostLocations: () => Location[];
  getLocationById: (id: string) => Location | undefined;
  getLocationBySlug: (slug: string) => Location | undefined;
  getPublishedLocations: () => Location[];
  getRequestsForHost: () => BookingRequest[];
  getBlocksForLocation: (locationId: string) => AvailabilityBlock[];
}

export const useHostStore = create<HostStore>()(
  persist(
    (set, get) => ({
      locations: [],
      bookingRequests: mockBookingRequests,
      availabilityBlocks: mockAvailability,
      isSyncing: false,

      addLocation: async (location) => {
        set((s) => ({ locations: [...s.locations, location] }));
        const { error } = await saveLocation(location);
        if (error) {
          console.error("[host-store] addLocation DB error:", error);
          set((s) => ({ locations: s.locations.filter((l) => l.id !== location.id) }));
          toast.error("שגיאה בשמירת הלוקיישן — נסו שוב");
        }
      },

      updateLocation: async (id, updates) => {
        const previous = get().locations.find((l) => l.id === id);
        set((s) => ({
          locations: s.locations.map((l) =>
            l.id === id ? { ...l, ...updates } : l
          ),
        }));
        const updated = get().locations.find((l) => l.id === id);
        if (updated) {
          const { error } = await saveLocation(updated);
          if (error) {
            console.error("[host-store] updateLocation DB error:", error);
            if (previous) {
              set((s) => ({
                locations: s.locations.map((l) =>
                  l.id === id ? previous : l
                ),
              }));
            }
            toast.error("שגיאה בעדכון הלוקיישן — נסו שוב");
          }
        }
      },

      deleteLocation: async (id) => {
        const previous = get().locations.find((l) => l.id === id);
        set((s) => ({ locations: s.locations.filter((l) => l.id !== id) }));
        const { error } = await deleteLocationAction(id);
        if (error) {
          console.error("[host-store] deleteLocation DB error:", error);
          if (previous) {
            set((s) => ({ locations: [...s.locations, previous] }));
          }
          toast.error("שגיאה במחיקת הלוקיישן — נסו שוב");
        }
      },

      setLocationStatus: async (id, status) => {
        if (status === "published") {
          const loc = get().locations.find((l) => l.id === id);
          if (loc) {
            const { hasGoogleCalendarConnection } = await import(
              "@/app/actions/google-calendar"
            );
            const connected = await hasGoogleCalendarConnection(loc.hostId);
            if (!connected) {
              toast.error(
                "יש לחבר יומן גוגל לפני פרסום. עברו לניהול זמינות."
              );
              return;
            }
          }
        }

        const previous = get().locations.find((l) => l.id === id);
        set((s) => ({
          locations: s.locations.map((l) =>
            l.id === id ? { ...l, status } : l
          ),
        }));
        const updated = get().locations.find((l) => l.id === id);
        if (updated) {
          const { error } = await saveLocation(updated);
          if (error) {
            console.error("[host-store] setLocationStatus DB error:", error);
            if (previous) {
              set((s) => ({
                locations: s.locations.map((l) =>
                  l.id === id ? previous : l
                ),
              }));
            }
            toast.error("שגיאה בעדכון סטטוס — נסו שוב");
          }
        }
      },

      syncFromDb: async (hostId?: string) => {
        if (get().isSyncing) return;
        set({ isSyncing: true });

        try {
          // Backfill host_id for locations that were saved before auth was wired up
          if (hostId) {
            await backfillLocationHostId(hostId);
          }

          const dbLocations = await fetchAllLocations();
          const localLocs = get().locations;

          if (dbLocations.length > 0) {
            // DB is the single source of truth — always prefer DB data.
            const merged: Location[] = dbLocations.map((loc) => ({
              ...loc,
              // Preserve local hostId if DB row still has null (shouldn't happen after backfill)
              hostId: loc.hostId === "user-host-1" && hostId ? hostId : loc.hostId,
            }));

            // Migrate any local-only locations (not yet in DB) from legacy localStorage
            const dbIds = new Set(dbLocations.map((l) => l.id));
            const localOnly = localLocs.filter((l) => !dbIds.has(l.id));
            for (const loc of localOnly) {
              const isUuid = UUID_RE.test(loc.id);
              const newId = isUuid ? loc.id : crypto.randomUUID();
              const newSlug = isUuid
                ? loc.slug
                : `${generateSlug(loc.title)}-${newId.slice(0, 8)}`;
              const migratedLoc: Location = {
                ...loc,
                id: newId,
                slug: newSlug,
                hostId: hostId ?? loc.hostId,
              };
              const { error } = await saveLocation(migratedLoc);
              if (error) console.error("[host-store] migration save error:", error);
              merged.push(migratedLoc);
            }

            set({ locations: merged });
            return;
          }

          // DB is empty – migrate all local locations
          if (localLocs.length === 0) return;

          const migrated = await Promise.all(
            localLocs.map(async (loc) => {
              const isUuid = UUID_RE.test(loc.id);
              const newId = isUuid ? loc.id : crypto.randomUUID();
              const newSlug = isUuid
                ? loc.slug
                : `${generateSlug(loc.title)}-${newId.slice(0, 8)}`;
              const migratedLoc: Location = {
                ...loc,
                id: newId,
                slug: newSlug,
                hostId: hostId ?? loc.hostId,
              };
              const { error } = await saveLocation(migratedLoc);
              if (error)
                console.error("[host-store] migration save error:", error);
              return migratedLoc;
            })
          );

          set({ locations: migrated });
        } finally {
          set({ isSyncing: false });
        }
      },

      addBlock: (block) =>
        set((s) => ({
          availabilityBlocks: [...s.availabilityBlocks, block],
        })),

      removeBlock: (id) =>
        set((s) => ({
          availabilityBlocks: s.availabilityBlocks.filter((b) => b.id !== id),
        })),

      updateRequestStatus: (id, status, hostNote) =>
        set((s) => ({
          bookingRequests: s.bookingRequests.map((r) =>
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

      getLocationBySlug: (slug) => get().locations.find((l) => l.slug === slug),

      getPublishedLocations: () =>
        get().locations.filter((l) => l.status === "published"),

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
    }),
    {
      name: "rollin-host-store",
      version: 5,
      partialize: (state) => ({
        locations: state.locations,
        bookingRequests: state.bookingRequests,
        availabilityBlocks: state.availabilityBlocks,
      }),
      migrate: (persisted: unknown, version: number) => {
        const state = persisted as Record<string, unknown>;
        if (version < 5) {
          // Ensure existing locations have showcaseVideos field
          const locations = state.locations as Array<Record<string, unknown>> | undefined;
          return {
            ...state,
            locations: (locations ?? []).map((l) => ({
              ...l,
              showcaseVideos: l.showcaseVideos ?? [],
            })),
          };
        }
        return persisted;
      },
    }
  )
);
