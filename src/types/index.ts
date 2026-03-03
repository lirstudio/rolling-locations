// ─── Roles ───────────────────────────────────────────────────────────────────

export type UserRole = "guest" | "creator" | "host" | "admin";

// ─── Statuses ─────────────────────────────────────────────────────────────────

export type LocationStatus = "draft" | "published" | "paused";

export type BookingStatus =
  | "requested"
  | "approved"
  | "rejected"
  | "cancelled";

// ─── Users ────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  createdAt: string;
}

// ─── Categories ───────────────────────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  slug: string;
  coverUrl?: string;
  iconUrl?: string;
  order: number;
  visible: boolean;
}

// ─── Locations ────────────────────────────────────────────────────────────────

export type LocationType =
  | "studio"
  | "rooftop"
  | "apartment"
  | "office"
  | "outdoor"
  | "industrial"
  | "other";

export interface LocationPricing {
  hourlyRate: number;
  dailyRate?: number;
  minimumHours?: number;
}

export interface LocationAddress {
  street: string;
  city: string;
  country: string;
  lat?: number;
  lng?: number;
}

export interface MediaItem {
  id: string;
  url: string;
  type: "image" | "video";
  isFeatured?: boolean;
}

export interface Location {
  id: string;
  title: string;
  description: string;
  type: LocationType;
  address: LocationAddress;
  mediaGallery: MediaItem[];
  hostId: string;
  categoryIds: string[];
  pricing: LocationPricing;
  rules?: string;
  amenities?: string[];
  status: LocationStatus;
  createdAt: string;
}

// ─── Availability ─────────────────────────────────────────────────────────────

export interface AvailabilityBlock {
  id: string;
  locationId: string;
  start: string;
  end: string;
  isBlocked: boolean;
  note?: string;
}

// ─── Booking Requests ─────────────────────────────────────────────────────────

export interface BookingRequest {
  id: string;
  locationId: string;
  creatorId: string;
  start: string;
  end: string;
  durationHours: number;
  priceEstimate: number;
  status: BookingStatus;
  notes?: string;
  hostNote?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── View Models (client-facing, denormalized) ────────────────────────────────

export interface LocationCardVM {
  id: string;
  title: string;
  type: LocationType;
  city: string;
  coverUrl: string;
  hourlyRate: number;
  dailyRate?: number;
  status: LocationStatus;
}

export interface BookingRequestVM extends BookingRequest {
  locationTitle: string;
  locationCoverUrl: string;
  creatorName: string;
}
