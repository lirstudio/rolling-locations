import { NextRequest, NextResponse } from "next/server";
import { checkAvailability } from "@/lib/check-availability";
import { checkFreeBusy } from "@/app/actions/google-calendar";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const locationId = searchParams.get("locationId");
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  if (!locationId || !start || !end) {
    return NextResponse.json(
      { error: "locationId, start, and end are required" },
      { status: 400 }
    );
  }

  // Layer 1: DB-based check (synced blocks + approved bookings)
  const dbResult = await checkAvailability(locationId, start, end);
  if (!dbResult.available) {
    return NextResponse.json(dbResult);
  }

  // Layer 2: Real-time FreeBusy check against Google Calendar
  const { busy, error } = await checkFreeBusy(locationId, start, end);
  if (!error && busy.length > 0) {
    return NextResponse.json({
      available: false,
      reason: "google_calendar_block",
      detail: "Host calendar shows busy during this period",
    });
  }

  return NextResponse.json({ available: true });
}
