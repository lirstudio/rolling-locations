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
  const baseUrl = new URL("/host/availability", request.url);

  if (!code || !hostId) {
    return NextResponse.redirect(
      new URL("/host/availability?error=missing_params", request.url)
    );
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || user.id !== hostId) {
      return NextResponse.redirect(
        new URL("/auth/sign-in?next=/host/availability", request.url)
      );
    }

    const redirectUri = `${new URL(request.url).origin}/api/google-calendar/callback`;
    const { error } = await saveGoogleConnection({
      hostId,
      code,
      redirectUri,
    });

    if (error) {
      console.error("[google-calendar/callback] saveGoogleConnection:", error);
      baseUrl.searchParams.set("error", "oauth_failed");
      return NextResponse.redirect(baseUrl);
    }

    const syncResult = await syncGoogleCalendarForHost(hostId);
    if (syncResult.error) {
      console.error("[google-calendar/callback] syncGoogleCalendarForHost:", syncResult.error);
      // Still redirect to success; connection is saved, sync can be retried on page
    }

    baseUrl.searchParams.set("google", "connected");
    return NextResponse.redirect(baseUrl);
  } catch (err) {
    console.error("[google-calendar/callback] error:", err);
    baseUrl.searchParams.set("error", "oauth_failed");
    return NextResponse.redirect(baseUrl);
  }
}
