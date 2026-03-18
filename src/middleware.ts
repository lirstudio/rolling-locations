import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const PROTECTED_PREFIXES = ["/host", "/admin", "/creator", "/dashboard", "/onboarding"];
const AUTH_PAGES = ["/sign-in", "/forgot-password"];

function isProtectedRoute(pathname: string) {
  return PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

function isAuthPage(pathname: string) {
  return AUTH_PAGES.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/login" || pathname === "/register" || pathname === "/sign-up") {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  const { user, supabaseResponse } = await updateSession(request);

  if (isProtectedRoute(pathname) && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/sign-in";
    return NextResponse.redirect(url);
  }

  if (isAuthPage(pathname) && user) {
    const role = user.user_metadata?.role;
    let redirect = "/onboarding";
    if (role === "admin") redirect = "/dashboard";
    else if (role === "host") redirect = "/host/overview";
    else if (role === "creator") redirect = "/creator/overview";
    return NextResponse.redirect(new URL(redirect, request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|auth).*)",
  ],
};
