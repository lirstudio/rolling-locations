"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, roleRedirectPath } from "@/stores/auth-store";

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && user) {
      router.replace(roleRedirectPath(user.role));
    } else {
      router.replace("/sign-in");
    }
  }, [isAuthenticated, user, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );
}
