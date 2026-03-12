import { getUnavailableDates } from "./check-availability";

export interface DateSuggestion {
  start: string;
  end: string;
  durationDays: number;
}

/**
 * Finds up to `maxResults` alternative date ranges of `durationDays` length
 * near the requested window.  Scans forward and backward from the request.
 */
export async function suggestAlternativeDates(
  locationId: string,
  requestedStart: string,
  requestedEnd: string,
  durationDays: number,
  maxResults = 3
): Promise<DateSuggestion[]> {
  const scanDays = 60;
  const scanStart = new Date(requestedStart);
  scanStart.setDate(scanStart.getDate() - scanDays);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (scanStart < today) scanStart.setTime(today.getTime());

  const scanEnd = new Date(requestedEnd);
  scanEnd.setDate(scanEnd.getDate() + scanDays);

  const unavailable = await getUnavailableDates(
    locationId,
    scanStart.toISOString(),
    scanEnd.toISOString()
  );

  const unavailableSet = new Set(unavailable.map((u) => u.date));
  const requestedStartDate = new Date(requestedStart);
  requestedStartDate.setHours(0, 0, 0, 0);

  const suggestions: DateSuggestion[] = [];
  const cursor = new Date(scanStart);

  while (cursor <= scanEnd && suggestions.length < maxResults) {
    let consecutive = 0;
    const windowStart = new Date(cursor);

    for (let i = 0; i < durationDays; i++) {
      const check = new Date(windowStart);
      check.setDate(check.getDate() + i);
      const dateStr = check.toISOString().slice(0, 10);

      if (check < today || unavailableSet.has(dateStr)) {
        consecutive = 0;
        break;
      }
      consecutive++;
    }

    if (consecutive === durationDays) {
      const windowEnd = new Date(windowStart);
      windowEnd.setDate(windowEnd.getDate() + durationDays - 1);

      const startStr = windowStart.toISOString().slice(0, 10);
      const endStr = windowEnd.toISOString().slice(0, 10);

      const overlapsRequest =
        startStr === requestedStart.slice(0, 10) &&
        endStr === requestedEnd.slice(0, 10);

      if (!overlapsRequest) {
        suggestions.push({
          start: startStr,
          end: endStr,
          durationDays,
        });
      }
    }

    cursor.setDate(cursor.getDate() + 1);
  }

  // Sort by proximity to the original requested start
  suggestions.sort((a, b) => {
    const distA = Math.abs(
      new Date(a.start).getTime() - requestedStartDate.getTime()
    );
    const distB = Math.abs(
      new Date(b.start).getTime() - requestedStartDate.getTime()
    );
    return distA - distB;
  });

  return suggestions.slice(0, maxResults);
}
