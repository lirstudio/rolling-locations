import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  if (!code) {
    return NextResponse.redirect(new URL("/sign-in?error=missing_code", request.url));
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(new URL("/sign-in?error=auth_failed", request.url));
  }

  if (next) {
    return NextResponse.redirect(new URL(next, request.url));
  }

  const role = data.session?.user?.user_metadata?.role;

  if (!role || !["creator", "host", "admin"].includes(role)) {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  const dashboardPath =
    role === "admin" ? "/dashboard" :
    role === "host" ? "/host/overview" :
    "/creator/overview";

  return NextResponse.redirect(new URL(dashboardPath, request.url));
}
