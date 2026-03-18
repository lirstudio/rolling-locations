import { useQuery } from "@tanstack/react-query";
import { fetchPublishedLocations } from "@/app/actions/locations";
import { queryKeys } from "@/lib/query-keys";
import type { Location } from "@/types";

export function usePublishedLocations(initialData?: Location[]) {
  const { data: locations = [], isLoading: loading } = useQuery({
    queryKey: queryKeys.locations.published(),
    queryFn: fetchPublishedLocations,
    initialData,
  });

  return { locations, loading };
}
