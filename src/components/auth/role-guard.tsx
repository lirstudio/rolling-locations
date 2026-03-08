"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { roleRedirectPath } from "@/lib/auth";
import type { UserRole } from "@/types";

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const role = user?.role ?? "guest";

  useEffect(() => {
    if (!user) return;
    if (!allowedRoles.includes(role)) {
      router.replace(roleRedirectPath(role));
    }
  }, [user, role, allowedRoles, router]);

  if (!user || !allowedRoles.includes(role)) {
    return null;
  }

  return <>{children}</>;
}
