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
  avatarUrl?: string;
  role: UserRole;
  createdAt: string;
  /** ISO timestamp from auth `last_sign_in_at` (admin list only). */
  lastLoginAt?: string | null;
  /** Whether verified MFA factors exist (admin list only). */
  twoStepEnabled?: boolean;
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
  viewCount?: number;
}

// ─── Availability ─────────────────────────────────────────────────────────────

export type AvailabilitySource = "google_calendar";

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

export interface GoogleCalendarConnection {
  id: string;
  hostId: string;
  googleAccountEmail: string;
  calendarId: string;
  lastSyncAt?: string;
  syncEnabled: boolean;
  syncToken?: string;
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

// ─── User Favorites ─────────────────────────────────────────────────────────────

export interface UserFavorite {
  id: string;
  userId: string;
  locationId: string;
  createdAt: string;
}
