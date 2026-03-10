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
  parentId?: string;
}

// ─── Locations ────────────────────────────────────────────────────────────────

export interface LocationPricing {
  dailyRate: number;
}

export interface LocationAddress {
  street: string;
  neighborhood?: string;
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
  slug: string;
  title: string;
  description: string;
  address: LocationAddress;
  mediaGallery: MediaItem[];
  hostId: string;
  categoryIds: string[];
  pricing: LocationPricing;
  rules?: string;
  amenities?: string[];
  showcaseVideos?: string[];
  status: LocationStatus;
  createdAt: string;
}

// ─── Availability ─────────────────────────────────────────────────────────────

export type AvailabilitySource = "manual" | "google_calendar";

export interface AvailabilityBlock {
  id: string;
  locationId: string;
  start: string;
  end: string;
  isBlocked: boolean;
  note?: string;
  source: AvailabilitySource;
  externalEventId?: string;
  createdAt?: string;
}

export interface OperatingHoursEntry {
  id?: string;
  locationId: string;
  dayOfWeek: number; // 0=Sun … 6=Sat
  isOpen: boolean;
  openTime?: string; // "HH:mm"
  closeTime?: string; // "HH:mm"
}

export interface GoogleCalendarConnection {
  id: string;
  hostId: string;
  locationId: string;
  googleAccountEmail: string;
  calendarId: string;
  lastSyncAt?: string;
  syncEnabled: boolean;
}

// ─── Booking Requests ─────────────────────────────────────────────────────────

export interface BookingRequest {
  id: string;
  locationId: string;
  creatorId: string;
  start: string;
  end: string;
  durationDays: number;
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
  city: string;
  coverUrl: string;
  dailyRate: number;
  status: LocationStatus;
}

export interface BookingRequestVM extends BookingRequest {
  locationTitle: string;
  locationCoverUrl: string;
  creatorName: string;
}
