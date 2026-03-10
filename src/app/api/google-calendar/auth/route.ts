import { NextRequest, NextResponse } from "next/server";
import {
  getGoogleOAuthClient,
  GOOGLE_SCOPES,
} from "@/lib/google-calendar";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const locationId = searchParams.get("locationId");

  if (!locationId) {
    return NextResponse.json(
      { error: "locationId is required" },
      { status: 400 }
    );
  }

  const oauth2 = getGoogleOAuthClient();
  const authUrl = oauth2.generateAuthUrl({
    access_type: "offline",
    scope: GOOGLE_SCOPES,
    prompt: "consent",
    state: locationId,
  });

  return NextResponse.redirect(authUrl);
}
