import { NextRequest, NextResponse } from "next/server";
import { getUnavailableDates } from "@/lib/check-availability";
import { syncIfStale } from "@/app/actions/google-calendar";

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

  await syncIfStale(locationId);

  const dates = await getUnavailableDates(locationId, start, end);
  return NextResponse.json({ dates });
}
