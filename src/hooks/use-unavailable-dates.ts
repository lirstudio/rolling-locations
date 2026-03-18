import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";

interface UnavailableDateEntry {
  date: string;
  reason: string;
}

async function fetchUnavailableDates(locationId: string): Promise<Date[]> {
  const now = new Date();
  const end = new Date(now);
  end.setDate(end.getDate() + 120);

  const startStr = now.toISOString().slice(0, 10);
  const endStr = end.toISOString().slice(0, 10);

  const res = await fetch(
    `/api/availability/dates?locationId=${locationId}&start=${startStr}T00:00:00Z&end=${endStr}T23:59:59Z`
  );
  const data = await res.json();
  return (data.dates ?? []).map(
    (d: UnavailableDateEntry) => new Date(d.date + "T12:00:00")
  );
}

export function useUnavailableDates(locationId: string | undefined) {
  const { data: unavailableDates = [], isLoading } = useQuery({
    queryKey: queryKeys.availability.dates(locationId ?? ""),
    queryFn: () => fetchUnavailableDates(locationId!),
    enabled: !!locationId,
    staleTime: 10 * 60 * 1000,
  });

  return { unavailableDates, isLoading };
}
