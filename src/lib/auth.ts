import type { UserRole } from "@/types";

export function roleRedirectPath(role: UserRole): string {
  switch (role) {
    case "admin":
      return "/dashboard";
    case "host":
      return "/host/overview";
    case "creator":
      return "/creator/overview";
    case "guest":
      return "/onboarding";
    default:
      return "/sign-in";
  }
}

export function isOnboardingComplete(role: UserRole): boolean {
  return role !== "guest";
}
