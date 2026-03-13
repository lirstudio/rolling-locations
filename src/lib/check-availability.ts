import { createAdminClient } from "@/lib/supabase/admin";

export type UnavailableReason =
  | "google_calendar_block"
  | "existing_booking";

export interface AvailabilityCheckResult {
  available: boolean;
  reason?: UnavailableReason;
  detail?: string;
}

/**
 * Checks whether a location is available for the given date range.
 * Two layers:
 *  1. Google Calendar synced blocks
 *  2. Approved bookings
 */
export async function checkAvailability(
  locationId: string,
  requestedStart: string,
  requestedEnd: string
): Promise<AvailabilityCheckResult> {
  const db = createAdminClient();

  // ── 1. Google Calendar blocks ───────────────────────────────────────────────

  const { data: blocks } = await db
    .from("availability_blocks")
    .select("source, start_at, end_at, note")
    .eq("location_id", locationId)
    .eq("is_blocked", true)
    .eq("source", "google_calendar")
    .lte("start_at", requestedEnd)
    .gte("end_at", requestedStart);

  if (blocks && blocks.length > 0) {
    return {
      available: false,
      reason: "google_calendar_block",
      detail: blocks[0].note ?? undefined,
    };
  }

  // ── 2. Approved bookings ────────────────────────────────────────────────────

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
 * Used by the guest calendar UI to disable blocked dates.
 */
export async function getUnavailableDates(
  locationId: string,
  rangeStart: string,
  rangeEnd: string
): Promise<{ date: string; reason: UnavailableReason }[]> {
  const db = createAdminClient();
  const results: { date: string; reason: UnavailableReason }[] = [];

  // Google Calendar blocks
  const { data: blocks } = await db
    .from("availability_blocks")
    .select("start_at, end_at, source")
    .eq("location_id", locationId)
    .eq("is_blocked", true)
    .eq("source", "google_calendar")
    .lte("start_at", rangeEnd)
    .gte("end_at", rangeStart);

  const blockDateSet = new Set<string>();
  for (const b of blocks ?? []) {
    const bStart = new Date(b.start_at);
    const bEnd = new Date(b.end_at);
    const cursor = new Date(bStart);
    cursor.setUTCHours(0, 0, 0, 0);
    while (cursor <= bEnd) {
      blockDateSet.add(cursor.toISOString().slice(0, 10));
      cursor.setUTCDate(cursor.getUTCDate() + 1);
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
    cursor.setUTCHours(0, 0, 0, 0);
    while (cursor <= bEnd) {
      bookingDateSet.add(cursor.toISOString().slice(0, 10));
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
  }

  // Walk the full range
  const cursor = new Date(rangeStart);
  cursor.setUTCHours(0, 0, 0, 0);
  const end = new Date(rangeEnd);
  end.setUTCHours(0, 0, 0, 0);

  while (cursor <= end) {
    const dateStr = cursor.toISOString().slice(0, 10);

    if (blockDateSet.has(dateStr)) {
      results.push({ date: dateStr, reason: "google_calendar_block" });
    } else if (bookingDateSet.has(dateStr)) {
      results.push({ date: dateStr, reason: "existing_booking" });
    }

    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return results;
}
