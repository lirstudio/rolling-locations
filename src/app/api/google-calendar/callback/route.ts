import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  saveGoogleConnection,
  syncGoogleCalendarForHost,
} from "@/app/actions/google-calendar";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const hostId = searchParams.get("state");

  if (!code || !hostId) {
    return NextResponse.redirect(
      new URL("/host/availability?error=missing_params", request.url)
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.id !== hostId) {
    return NextResponse.redirect(
      new URL("/auth/sign-in?next=/host/availability", request.url)
    );
  }

  const { error } = await saveGoogleConnection({
    hostId,
    code,
  });

  if (error) {
    console.error("[google-calendar/callback] error:", error);
    return NextResponse.redirect(
      new URL("/host/availability?error=oauth_failed", request.url)
    );
  }

  await syncGoogleCalendarForHost(hostId);

  return NextResponse.redirect(
    new URL("/host/availability?google=connected", request.url)
  );
}
