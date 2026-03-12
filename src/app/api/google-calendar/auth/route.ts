import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getGoogleOAuthClient,
  GOOGLE_SCOPES,
} from "@/lib/google-calendar";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401 }
    );
  }

  const oauth2 = getGoogleOAuthClient();
  const authUrl = oauth2.generateAuthUrl({
    access_type: "offline",
    scope: GOOGLE_SCOPES,
    prompt: "consent",
    state: user.id,
  });

  return NextResponse.redirect(authUrl);
}
