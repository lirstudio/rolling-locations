import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getGoogleOAuthClient,
  GOOGLE_SCOPES,
} from "@/lib/google-calendar";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(
        new URL("/auth/sign-in?next=/host/availability", request.url)
      );
    }

    const origin = new URL(request.url).origin;
    const redirectUri = `${origin}/api/google-calendar/callback`;
    const oauth2 = getGoogleOAuthClient(redirectUri);
    const authUrl = oauth2.generateAuthUrl({
      access_type: "offline",
      scope: GOOGLE_SCOPES,
      prompt: "consent",
      state: user.id,
    });

    return NextResponse.redirect(authUrl);
  } catch (err) {
    console.error("[google-calendar/auth] error:", err);
    const isConfig =
      err instanceof Error &&
      (err.message.includes("Missing Google OAuth") ||
        err.message.includes("ENCRYPTION_KEY"));
    return NextResponse.redirect(
      new URL(
        `/host/availability?error=${isConfig ? "config" : "oauth_start_failed"}`,
        request.url
      )
    );
  }
}
