import { createAdminClient } from "@/lib/supabase/admin";

export type UnavailableReason =
  | "outside_operating_hours"
  | "manual_block"
  | "google_calendar_block"
  | "existing_booking";

export interface AvailabilityCheckResult {
  available: boolean;
  reason?: UnavailableReason;
  detail?: string;
}

/**
 * Checks whether a location is available for the given date range.
 * Evaluates all 4 layers:
 *  1. Operating hours (recurring weekly)
 *  2. Manual availability blocks
 *  3. Google Calendar synced blocks
 *  4. Approved bookings
 */
export async function checkAvailability(
  locationId: string,
  requestedStart: string, // ISO date or datetime
  requestedEnd: string
): Promise<AvailabilityCheckResult> {
  const db = createAdminClient();
  const start = new Date(requestedStart);
  const end = new Date(requestedEnd);

  // ── 1. Operating hours ─────────────────────────────────────────────────────

  const { data: hoursRows } = await db
    .from("location_operating_hours")
    .select("day_of_week, is_open, open_time, close_time")
    .eq("location_id", locationId);

  if (hoursRows && hoursRows.length > 0) {
    const hoursMap = new Map(
      hoursRows.map((r) => [r.day_of_week, r])
    );

    // Check each day in the range
    const cursor = new Date(start);
    cursor.setHours(0, 0, 0, 0);
    const endDay = new Date(end);
    endDay.setHours(0, 0, 0, 0);

    while (cursor <= endDay) {
      const dow = cursor.getDay();
      const entry = hoursMap.get(dow);
      if (entry && !entry.is_open) {
        return {
          available: false,
          reason: "outside_operating_hours",
          detail: `Closed on day ${dow}`,
        };
      }
      cursor.setDate(cursor.getDate() + 1);
    }
  }

  // ── 2 + 3. Availability blocks (manual + google) ──────────────────────────

  const { data: blocks } = await db
    .from("availability_blocks")
    .select("source, start_at, end_at, note")
    .eq("location_id", locationId)
    .eq("is_blocked", true)
    .lte("start_at", requestedEnd)
    .gte("end_at", requestedStart);

  if (blocks && blocks.length > 0) {
    const first = blocks[0];
    const reason: UnavailableReason =
      first.source === "google_calendar"
        ? "google_calendar_block"
        : "manual_block";
    return {
      available: false,
      reason,
      detail: first.note ?? undefined,
    };
  }

  // ── 4. Approved bookings ───────────────────────────────────────────────────

  const startDate = requestedStart.slice(0, 10);
  const endDate = requestedEnd.slice(0, 10);

  const { data: bookings } = await db
    .from("booking_requests")
    .select("id, start_date, end_date")
    .eq("location_id", locationId)
    .eq("status", "approved")
    .lte("start_date", endDate)
    .gte("end_date", startDate);

  if (bookings && bookings.length > 0) {
    return {
      available: false,
      reason: "existing_booking",
      detail: `Conflicts with booking ${bookings[0].id}`,
    };
  }

  return { available: true };
}

/**
 * Returns all unavailable dates for a location within a date range.
 * Useful for calendar UI — marks which dates are blocked.
 */
export async function getUnavailableDates(
  locationId: string,
  rangeStart: string,
  rangeEnd: string
): Promise<{ date: string; reason: UnavailableReason }[]> {
  const db = createAdminClient();
  const results: { date: string; reason: UnavailableReason }[] = [];

  // Operating hours → closed days
  const { data: hoursRows } = await db
    .from("location_operating_hours")
    .select("day_of_week, is_open")
    .eq("location_id", locationId);

  const closedDays = new Set(
    (hoursRows ?? []).filter((r) => !r.is_open).map((r) => r.day_of_week)
  );

  // Blocks
  const { data: blocks } = await db
    .from("availability_blocks")
    .select("start_at, end_at, source")
    .eq("location_id", locationId)
    .eq("is_blocked", true)
    .lte("start_at", rangeEnd)
    .gte("end_at", rangeStart);

  const blockDateSet = new Map<string, UnavailableReason>();
  for (const b of blocks ?? []) {
    const bStart = new Date(b.start_at);
    const bEnd = new Date(b.end_at);
    const cursor = new Date(bStart);
    cursor.setHours(0, 0, 0, 0);
    while (cursor <= bEnd) {
      const key = cursor.toISOString().slice(0, 10);
      blockDateSet.set(
        key,
        b.source === "google_calendar"
          ? "google_calendar_block"
          : "manual_block"
      );
      cursor.setDate(cursor.getDate() + 1);
    }
  }

  // Approved bookings
  const { data: bookings } = await db
    .from("booking_requests")
    .select("start_date, end_date")
    .eq("location_id", locationId)
    .eq("status", "approved")
    .lte("start_date", rangeEnd.slice(0, 10))
    .gte("end_date", rangeStart.slice(0, 10));

  const bookingDateSet = new Set<string>();
  for (const b of bookings ?? []) {
    const bStart = new Date(b.start_date);
    const bEnd = new Date(b.end_date);
    const cursor = new Date(bStart);
    while (cursor <= bEnd) {
      bookingDateSet.add(cursor.toISOString().slice(0, 10));
      cursor.setDate(cursor.getDate() + 1);
    }
  }

  // Walk the full range
  const cursor = new Date(rangeStart);
  cursor.setHours(0, 0, 0, 0);
  const end = new Date(rangeEnd);
  end.setHours(0, 0, 0, 0);

  while (cursor <= end) {
    const dateStr = cursor.toISOString().slice(0, 10);
    const dow = cursor.getDay();

    if (closedDays.has(dow)) {
      results.push({ date: dateStr, reason: "outside_operating_hours" });
    } else if (blockDateSet.has(dateStr)) {
      results.push({ date: dateStr, reason: blockDateSet.get(dateStr)! });
    } else if (bookingDateSet.has(dateStr)) {
      results.push({ date: dateStr, reason: "existing_booking" });
    }

    cursor.setDate(cursor.getDate() + 1);
  }

  return results;
}
