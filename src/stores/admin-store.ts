import { create } from "zustand";
import type {
  User,
  Category,
  Location,
  BookingRequest,
  BookingStatus,
  LocationStatus,
  UserRole,
} from "@/types";
import { mockUsers } from "@/mocks/users";
import { mockCategories } from "@/mocks/categories";
import { mockLocations } from "@/mocks/locations";
import { mockBookingRequests } from "@/mocks/bookings";

interface AdminStore {
  users: User[];
  categories: Category[];
  locations: Location[];
  bookingRequests: BookingRequest[];

  // Users
  updateUserRole: (id: string, role: UserRole) => void;
  deleteUser: (id: string) => void;

  // Categories
  addCategory: (category: Category) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  toggleCategoryVisibility: (id: string) => void;
  reorderCategory: (id: string, direction: "up" | "down") => void;

  // Locations (moderation)
  setLocationStatus: (id: string, status: LocationStatus) => void;

  // Bookings (read-only overview, but admin can cancel)
  updateBookingStatus: (id: string, status: BookingStatus) => void;

  // Selectors
  getUserById: (id: string) => User | undefined;
  getLocationById: (id: string) => Location | undefined;
}

export const useAdminStore = create<AdminStore>((set, get) => ({
  users: mockUsers,
  categories: mockCategories,
  locations: mockLocations,
  bookingRequests: mockBookingRequests,

  updateUserRole: (id, role) =>
    set((s) => ({
      users: s.users.map((u) => (u.id === id ? { ...u, role } : u)),
    })),

  deleteUser: (id) =>
    set((s) => ({ users: s.users.filter((u) => u.id !== id) })),

  addCategory: (category) =>
    set((s) => ({ categories: [...s.categories, category] })),

  updateCategory: (id, updates) =>
    set((s) => ({
      categories: s.categories.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    })),

  deleteCategory: (id) =>
    set((s) => ({ categories: s.categories.filter((c) => c.id !== id) })),

  toggleCategoryVisibility: (id) =>
    set((s) => ({
      categories: s.categories.map((c) =>
        c.id === id ? { ...c, visible: !c.visible } : c
      ),
    })),

  reorderCategory: (id, direction) =>
    set((s) => {
      const cats = [...s.categories].sort((a, b) => a.order - b.order);
      const idx = cats.findIndex((c) => c.id === id);
      if (idx < 0) return s;
      const swapIdx = direction === "up" ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= cats.length) return s;
      const tempOrder = cats[idx].order;
      cats[idx] = { ...cats[idx], order: cats[swapIdx].order };
      cats[swapIdx] = { ...cats[swapIdx], order: tempOrder };
      return { categories: cats };
    }),

  setLocationStatus: (id, status) =>
    set((s) => ({
      locations: s.locations.map((l) =>
        l.id === id ? { ...l, status } : l
      ),
    })),

  updateBookingStatus: (id, status) =>
    set((s) => ({
      bookingRequests: s.bookingRequests.map((b) =>
        b.id === id
          ? { ...b, status, updatedAt: new Date().toISOString() }
          : b
      ),
    })),

  getUserById: (id) => get().users.find((u) => u.id === id),
  getLocationById: (id) => get().locations.find((l) => l.id === id),
}));
