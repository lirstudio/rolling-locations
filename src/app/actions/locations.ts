"use server";

import { unstable_cache, revalidateTag } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { CACHE_TAGS } from "@/lib/cache-tags";
import type { Location } from "@/types";

// ── DB row shapes ─────────────────────────────────────────────────────────────

type MediaRow = {
  id: string;
  location_id: string;
  url: string;
  type: string;
  is_featured: boolean;
  sort_order: number;
};

type LocationRow = {
  id: string;
  slug: string;
  title: string;
  description: string;
  address_street: string;
  address_neighborhood: string | null;
  address_city: string;
  address_country: string;
  address_lat: number | null;
  address_lng: number | null;
  daily_rate: number;
  rules: string | null;
  amenities: string[];
  category_ids: string[];
  status: string;
  host_id: string | null;
  created_at: string;
  showcase_videos: string[] | null;
  view_count: number | null;
  location_media?: MediaRow[];
};

// ── Mappers ───────────────────────────────────────────────────────────────────

function toDbRow(loc: Location): Omit<LocationRow, "created_at" | "location_media"> {
  return {
    id: loc.id,
    slug: loc.slug,
    title: loc.title,
    description: loc.description,
    address_street: loc.address.street,
    address_neighborhood: loc.address.neighborhood ?? null,
    address_city: loc.address.city,
    address_country: loc.address.country,
    address_lat: loc.address.lat ?? null,
    address_lng: loc.address.lng ?? null,
    daily_rate: loc.pricing.dailyRate,
    rules: loc.rules ?? null,
    amenities: loc.amenities ?? [],
    category_ids: loc.categoryIds,
    status: loc.status,
    host_id: loc.hostId ?? null,
    showcase_videos: loc.showcaseVideos ?? [],
  };
}

function getMediaFromRow(row: LocationRow): MediaRow[] {
  const raw = row.location_media ?? (row as Record<string, unknown>).location_media;
  if (!Array.isArray(raw)) return [];
  return raw;
}

function fromDbRow(row: LocationRow): Location {
  const mediaRows = getMediaFromRow(row);
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    address: {
      street: row.address_street,
      neighborhood: row.address_neighborhood ?? undefined,
      city: row.address_city,
      country: row.address_country,
      lat: row.address_lat ?? undefined,
      lng: row.address_lng ?? undefined,
    },
    mediaGallery: mediaRows
      .sort((a, b) => {
        // Featured image always first
        if (a.is_featured && !b.is_featured) return -1;
        if (!a.is_featured && b.is_featured) return 1;
        // Then sort by sort_order
        return (a.sort_order ?? 0) - (b.sort_order ?? 0);
      })
      .map((m) => ({
        id: m.id,
        url: m.url,
        type: m.type as "image" | "video",
        isFeatured: m.is_featured,
      })),
    hostId: row.host_id ?? "user-host-1",
    categoryIds: row.category_ids,
    pricing: { dailyRate: row.daily_rate },
    rules: row.rules ?? undefined,
    amenities: row.amenities,
    showcaseVideos: row.showcase_videos ?? [],
    status: row.status as "draft" | "published" | "paused",
    createdAt: row.created_at,
    viewCount: row.view_count ?? undefined,
  };
}

// ── Server Actions ────────────────────────────────────────────────────────────

/**
 * Upsert a location (and replace its media) in the DB.
 * Safe to call for both create and update.
 */
export async function saveLocation(location: Location): Promise<{ error?: string }> {
  const db = createAdminClient();

  const { error: locationError } = await db
    .from("locations")
    .upsert(toDbRow(location), { onConflict: "id" });

  if (locationError) {
    console.error("[saveLocation] upsert error:", locationError.message);
    return { error: locationError.message };
  }

  // Replace media: delete existing, then insert new
  const { error: deleteError } = await db
    .from("location_media")
    .delete()
    .eq("location_id", location.id);

  if (deleteError) {
    console.error("[saveLocation] media delete error:", deleteError.message);
    return { error: `media delete: ${deleteError.message}` };
  }

  if (location.mediaGallery.length > 0) {
    // Featured image should always be first (sort_order: 0)
    const rows = location.mediaGallery.map((m, i) => ({
      id: m.id,
      location_id: location.id,
      url: m.url,
      type: m.type ?? "image",
      is_featured: m.isFeatured ?? i === 0,
      sort_order: i, // Already sorted in form - featured first
    }));

    const { error: mediaError } = await db.from("location_media").insert(rows);

    if (mediaError) {
      console.error("[saveLocation] media insert error:", mediaError.message, "rows:", JSON.stringify(rows));
      return { error: mediaError.message };
    }
  }

  revalidateTag(CACHE_TAGS.publishedLocations, "max");
  revalidateTag(CACHE_TAGS.locationSlug(location.slug), "max");
  return {};
}

export async function deleteLocationAction(locationId: string): Promise<{ error?: string }> {
  const db = createAdminClient();
  const { error } = await db.from("locations").delete().eq("id", locationId);
  if (error) return { error: error.message };
  revalidateTag(CACHE_TAGS.publishedLocations, "max");
  return {};
}

/**
 * Backfills host_id = hostId for all locations that currently have host_id = null.
 * Call once per host after they authenticate.
 */
export async function backfillLocationHostId(
  hostId: string
): Promise<{ updated: number; error?: string }> {
  const db = createAdminClient();
  const { data, error } = await db
    .from("locations")
    .update({ host_id: hostId })
    .is("host_id", null)
    .select("id");
  if (error) return { updated: 0, error: error.message };
  return { updated: data?.length ?? 0 };
}

export async function fetchAllLocations(): Promise<Location[]> {
  const db = createAdminClient();
  const { data, error } = await db
    .from("locations")
    .select("*, location_media(*)")
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return (data as LocationRow[]).map(fromDbRow);
}

async function _fetchPublishedLocations(): Promise<Location[]> {
  const db = createAdminClient();
  const { data, error } = await db
    .from("locations")
    .select("*, location_media(*)")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return (data as LocationRow[]).map(fromDbRow);
}

const cachedPublishedLocations = unstable_cache(
  _fetchPublishedLocations,
  ["published-locations"],
  { tags: [CACHE_TAGS.publishedLocations], revalidate: 300 }
);

export async function fetchPublishedLocations(): Promise<Location[]> {
  return cachedPublishedLocations();
}

async function _fetchLocationBySlug(slug: string): Promise<Location | null> {
  const db = createAdminClient();
  const { data, error } = await db
    .from("locations")
    .select("*, location_media(*)")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error || !data) return null;
  return fromDbRow(data as LocationRow);
}

export async function fetchLocationBySlug(slug: string): Promise<Location | null> {
  return unstable_cache(
    () => _fetchLocationBySlug(slug),
    [`location-slug-${slug}`],
    { tags: [CACHE_TAGS.locationSlug(slug)], revalidate: 300 }
  )();
}

export async function getPublishedLocationCount(): Promise<number> {
  const db = createAdminClient();
  const { count } = await db
    .from("locations")
    .select("*", { count: "exact", head: true })
    .eq("status", "published");
  return count ?? 0;
}

/**
 * Increment view count for a location.
 * Fire and forget - doesn't await to avoid blocking page load.
 */
export async function incrementLocationViewCount(locationId: string): Promise<void> {
  const db = createAdminClient();
  
  // Fetch current value and increment
  const { data: current } = await db
    .from("locations")
    .select("view_count")
    .eq("id", locationId)
    .single();
  
  if (current) {
    await db
      .from("locations")
      .update({ view_count: (current.view_count ?? 0) + 1 })
      .eq("id", locationId);
  }
  
  // Don't revalidate cache - view counts are not critical for freshness
}

/**
 * Fetch popularity stats (view count, booking count, favorite count) for multiple locations.
 */
export async function fetchLocationPopularityStats(
  locationIds: string[]
): Promise<
  Array<{
    locationId: string;
    viewCount: number;
    bookingCount: number;
    favoriteCount: number;
  }>
> {
  if (locationIds.length === 0) return [];

  const db = createAdminClient();

  // Fetch view counts from locations table
  const { data: locationsData, error: locationsError } = await db
    .from("locations")
    .select("id, view_count")
    .in("id", locationIds);

  if (locationsError) {
    console.error("[fetchLocationPopularityStats] locations error:", locationsError.message);
    return [];
  }

  // Fetch booking request counts (all statuses count)
  const { data: bookingsData, error: bookingsError } = await db
    .from("booking_requests")
    .select("location_id")
    .in("location_id", locationIds);

  if (bookingsError) {
    console.error("[fetchLocationPopularityStats] bookings error:", bookingsError.message);
  }

  // Fetch favorite counts
  const { data: favoritesData, error: favoritesError } = await db
    .from("user_favorites")
    .select("location_id")
    .in("location_id", locationIds);

  if (favoritesError) {
    console.error("[fetchLocationPopularityStats] favorites error:", favoritesError.message);
  }

  // Aggregate counts
  const bookingCounts = new Map<string, number>();
  (bookingsData || []).forEach((b) => {
    bookingCounts.set(b.location_id, (bookingCounts.get(b.location_id) || 0) + 1);
  });

  const favoriteCounts = new Map<string, number>();
  (favoritesData || []).forEach((f) => {
    favoriteCounts.set(f.location_id, (favoriteCounts.get(f.location_id) || 0) + 1);
  });

  // Build result array
  return (locationsData || []).map((loc) => ({
    locationId: loc.id,
    viewCount: loc.view_count ?? 0,
    bookingCount: bookingCounts.get(loc.id) ?? 0,
    favoriteCount: favoriteCounts.get(loc.id) ?? 0,
  }));
}