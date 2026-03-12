import { NextRequest, NextResponse } from "next/server";
import { suggestAlternativeDates } from "@/lib/suggest-dates";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const locationId = searchParams.get("locationId");
  const start = searchParams.get("start");
  const end = searchParams.get("end");
  const daysParam = searchParams.get("days");

  if (!locationId || !start || !end || !daysParam) {
    return NextResponse.json(
      { error: "locationId, start, end, and days are required" },
      { status: 400 }
    );
  }

  const days = parseInt(daysParam, 10);
  if (isNaN(days) || days < 1) {
    return NextResponse.json(
      { error: "days must be a positive integer" },
      { status: 400 }
    );
  }

  const suggestions = await suggestAlternativeDates(
    locationId,
    start,
    end,
    days
  );

  return NextResponse.json({ suggestions });
}
