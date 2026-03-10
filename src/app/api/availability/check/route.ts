import { NextRequest, NextResponse } from "next/server";
import { checkAvailability } from "@/lib/check-availability";

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

  const result = await checkAvailability(locationId, start, end);
  return NextResponse.json(result);
}
