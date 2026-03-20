"use server";

import { createClient } from "@/lib/supabase/server";
import type { Location } from "@/types";

/**
 * Toggle favorite status for a location.
 * Returns error if user is not authenticated or location doesn't exist.
 */
export async function toggleFavorite(
  locationId: string
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Authentication required" };
  }

  // Check if already favorited
  const { data: existing } = await supabase
    .from("user_favorites")
    .select("id")
    .eq("user_id", user.id)
    .eq("location_id", locationId)
    .single();

  if (existing) {
    // Remove favorite
    const { error } = await supabase
      .from("user_favorites")
      .delete()
      .eq("user_id", user.id)
      .eq("location_id", locationId);

    if (error) {
      console.error("[toggleFavorite] delete error:", error.message);
      return { error: "Failed to remove favorite" };
    }
  } else {
    // Add favorite
    const { error } = await supabase.from("user_favorites").insert({
      user_id: user.id,
      location_id: locationId,
    });

    if (error) {
      console.error("[toggleFavorite] insert error:", error.message);
      return { error: "Failed to add favorite" };
    }
  }

  return {};
}

/**
 * Get all favorite locations for the current user.
 */
export async function getFavoriteLocations(): Promise<Location[]> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return [];
  }

  const { data: favorites, error: favoritesError } = await supabase
    .from("user_favorites")
    .select("location_id")
    .eq("user_id", user.id);

  if (favoritesError || !favorites || favorites.length === 0) {
    return [];
  }

  const locationIds = favorites.map((f) => f.location_id);

  // Fetch locations with their media
  const { data: locations, error: locationsError } = await supabase
    .from("locations")
    .select(
      `
      id,
      slug,
      title,
      description,
      address_street,
      address_neighborhood,
      address_city,
      address_country,
      address_lat,
      address_lng,
      daily_rate,
      rules,
      amenities,
      category_ids,
      status,
      host_id,
      created_at,
      showcase_videos,
      location_media (
        id,
        location_id,
        url,
        type,
        is_featured,
        sort_order
      )
    `
    )
    .in("id", locationIds)
    .eq("status", "published");

  if (locationsError || !locations) {
    console.error("[getFavoriteLocations] error:", locationsError?.message);
    return [];
  }

  // Transform to Location type
  return locations.map((row) => ({
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
    mediaGallery:
      row.location_media?.map((m) => ({
        id: m.id,
        url: m.url,
        type: m.type as "image" | "video",
        isFeatured: m.is_featured,
      })) ?? [],
    hostId: row.host_id ?? "",
    categoryIds: row.category_ids ?? [],
    pricing: {
      dailyRate: row.daily_rate,
    },
    rules: row.rules ?? undefined,
    amenities: row.amenities ?? [],
    showcaseVideos: row.showcase_videos ?? undefined,
    status: row.status as Location["status"],
    createdAt: row.created_at,
  }));
}

/**
 * Check if a location is favorited by the current user.
 */
export async function isFavorite(locationId: string): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return false;
  }

  const { data, error } = await supabase
    .from("user_favorites")
    .select("id")
    .eq("user_id", user.id)
    .eq("location_id", locationId)
    .single();

  if (error || !data) {
    return false;
  }

  return true;
}
