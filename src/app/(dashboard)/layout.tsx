"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { useSidebarConfig } from "@/hooks/use-sidebar-config";
import { AuthGuard } from "@/components/auth/auth-guard";
import { RoleGuard } from "@/components/auth/role-guard";
import { useAuthStore } from "@/stores/auth-store";
import type { UserRole } from "@/types";

function requiredRoleForPath(
  pathname: string | null,
): Exclude<UserRole, "guest"> {
  if (pathname?.startsWith("/creator")) return "creator";
  if (pathname?.startsWith("/host")) return "host";
  return "admin";
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { config } = useSidebarConfig();
  const user = useAuthStore((s) => s.user);

  const pathRole = requiredRoleForPath(pathname);
  const sidebarRole = (user?.role as Exclude<UserRole, "guest">) ?? pathRole;

  return (
    <AuthGuard>
      <RoleGuard allowedRoles={[pathRole]}>
        <SidebarProvider
          style={{
            "--sidebar-width": "16rem",
            "--sidebar-width-icon": "3rem",
            "--header-height": "calc(var(--spacing) * 14)",
          } as React.CSSProperties}
          className={config.collapsible === "none" ? "sidebar-none-mode" : ""}
        >
          <AppSidebar
            role={sidebarRole}
            variant={config.variant}
            collapsible={config.collapsible}
            side="right"
          />
          <SidebarInset className="min-w-0">
            <SiteHeader />
            <div className="flex flex-1 flex-col">
              <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                  {children}
                </div>
              </div>
            </div>
            <SiteFooter />
          </SidebarInset>
        </SidebarProvider>
      </RoleGuard>
    </AuthGuard>
  );
}
