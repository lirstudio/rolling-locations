import { NextRequest, NextResponse } from "next/server";
import { saveGoogleConnection, syncGoogleCalendar } from "@/app/actions/google-calendar";

const HOST_ID = "user-host-1"; // v1: hardcoded until real auth

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const locationId = searchParams.get("state");

  if (!code || !locationId) {
    return NextResponse.redirect(
      new URL("/host/availability?error=missing_params", request.url)
    );
  }

  const { error } = await saveGoogleConnection({
    hostId: HOST_ID,
    locationId,
    code,
  });

  if (error) {
    console.error("[google-calendar/callback] error:", error);
    return NextResponse.redirect(
      new URL("/host/availability?error=oauth_failed", request.url)
    );
  }

  // Trigger initial sync
  await syncGoogleCalendar(locationId);

  return NextResponse.redirect(
    new URL("/host/availability?google=connected", request.url)
  );
}
