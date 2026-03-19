"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import type { UserRole } from "@/types";
import { useAuthStore } from "@/stores/auth-store";
import { dashboardNavByRole } from "@/config/dashboard-navigation";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  role?: Exclude<UserRole, "guest">;
}

export function AppSidebar({ role = "admin", ...props }: AppSidebarProps) {
  const authUser = useAuthStore((s) => s.user);
  const t = useTranslations("commandSearch");
  const groups = dashboardNavByRole[role];

  const user = {
    name: authUser?.name ?? "",
    email: authUser?.email ?? "",
    avatar: authUser?.avatarUrl ?? "",
  };

  return (
    <Sidebar {...props}>
      <SidebarHeader className="pb-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="grid flex-1 text-start text-sm leading-tight">
                  <span className="truncate font-semibold tracking-tight">
                    Rollin Locations
                  </span>
                  <span className="truncate text-[11px] text-muted-foreground/70">
                    MVP
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {groups.map((group) => (
          <NavMain
            key={group.groupKey}
            label={t(`groups.${group.groupKey}` as never)}
            items={group.items.map((item) => ({
              title: t(`items.${item.id}` as never),
              url: item.path,
              icon: item.icon,
              items: item.subItems?.map((sub) => ({
                title: t(`items.${sub.id}` as never),
                url: sub.path,
              })),
            }))}
          />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
