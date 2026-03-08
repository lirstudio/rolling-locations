"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";

const SIGN_IN_PATH = "/sign-in";
const ONBOARDING_PATH = "/onboarding";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const role = useAuthStore((s) => s.user?.role);

  const isGuest = role === "guest";
  const isOnOnboarding = pathname?.startsWith(ONBOARDING_PATH);

  useEffect(() => {
    if (!isInitialized) return;
    if (!isAuthenticated) {
      router.replace(SIGN_IN_PATH);
      return;
    }
    if (isGuest && !isOnOnboarding) {
      router.replace(ONBOARDING_PATH);
    }
  }, [isInitialized, isAuthenticated, isGuest, isOnOnboarding, router]);

  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"
          aria-hidden
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (isGuest && !isOnOnboarding) {
    return null;
  }

  return <>{children}</>;
}
