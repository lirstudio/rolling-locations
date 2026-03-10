import { useState, useEffect } from "react";
import { fetchPublishedLocations } from "@/app/actions/locations";
import type { Location } from "@/types";

/**
 * Fetches published locations from Supabase for public marketing pages.
 * Separate from the host store – marketing pages should never depend on
 * a specific host's local state.
 */
export function usePublishedLocations() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublishedLocations()
      .then(setLocations)
      .finally(() => setLoading(false));
  }, []);

  return { locations, loading };
}
