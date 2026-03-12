import { useEffect, useState, useCallback } from "react";

interface UnavailableDateEntry {
  date: string;
  reason: string;
}

export function useUnavailableDates(locationId: string | undefined) {
  const [unavailableDates, setUnavailableDates] = useState<Date[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchDates = useCallback(async () => {
    if (!locationId) return;

    setIsLoading(true);
    const now = new Date();
    const end = new Date(now);
    end.setDate(end.getDate() + 90);

    try {
      const startStr = now.toISOString().slice(0, 10);
      const endStr = end.toISOString().slice(0, 10);
      const res = await fetch(
        `/api/availability/dates?locationId=${locationId}&start=${startStr}T00:00:00Z&end=${endStr}T23:59:59Z`
      );
      const data = await res.json();
      const dates: Date[] = (data.dates ?? []).map(
        (d: UnavailableDateEntry) => new Date(d.date + "T12:00:00")
      );
      setUnavailableDates(dates);
    } catch {
      setUnavailableDates([]);
    } finally {
      setIsLoading(false);
    }
  }, [locationId]);

  useEffect(() => {
    fetchDates();
  }, [fetchDates]);

  return { unavailableDates, isLoading };
}
