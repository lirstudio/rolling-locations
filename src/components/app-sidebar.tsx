"use client"

import * as React from "react"
import {
  LayoutDashboard,
  MapPin,
  CalendarDays,
  Inbox,
  BookOpen,
  FileText,
  Users,
  Tags,
  ShieldCheck,
  Settings,
} from "lucide-react"
import Link from "next/link"
import { Logo } from "@/components/logo"
import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import type { LucideIcon } from "lucide-react"
import type { UserRole } from "@/types"
import { useAuthStore } from "@/stores/auth-store"

type NavItem = {
  title: string
  url: string
  icon: LucideIcon
  items?: { title: string; url: string }[]
}

type NavGroup = {
  label: string
  items: NavItem[]
}

const navByRole: Record<Exclude<UserRole, "guest">, NavGroup[]> = {
  admin: [
    {
      label: "ניהול",
      items: [
        { title: "לוח בקרה", url: "/dashboard", icon: LayoutDashboard },
        { title: "משתמשים", url: "/admin/users", icon: Users },
        { title: "קטגוריות", url: "/admin/categories", icon: Tags },
        { title: "לוקיישנים", url: "/admin/locations", icon: MapPin },
        { title: "הזמנות", url: "/admin/bookings", icon: BookOpen },
      ],
    },
    {
      label: "הגדרות",
      items: [
        {
          title: "הגדרות",
          url: "#",
          icon: Settings,
          items: [
            { title: "כללי", url: "/admin/settings" },
            { title: "עמלות", url: "/admin/settings/commission" },
          ],
        },
      ],
    },
  ],
  host: [
    {
      label: "מארח",
      items: [
        { title: "סקירה", url: "/host/overview", icon: LayoutDashboard },
        { title: "הלוקיישנים שלי", url: "/host/locations", icon: MapPin },
        { title: "זמינות", url: "/host/availability", icon: CalendarDays },
        { title: "בקשות", url: "/host/requests", icon: Inbox },
      ],
    },
    {
      label: "הגדרות",
      items: [
        { title: "הגדרות", url: "/host/settings", icon: Settings },
      ],
    },
  ],
  creator: [
    {
      label: "יוצר",
      items: [
        { title: "סקירה", url: "/creator/overview", icon: LayoutDashboard },
        { title: "ההזמנות שלי", url: "/creator/bookings", icon: BookOpen },
        { title: "חשבוניות", url: "/creator/invoices", icon: FileText },
      ],
    },
    {
      label: "הגדרות",
      items: [
        { title: "הגדרות", url: "/creator/settings", icon: Settings },
      ],
    },
  ],
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  role?: Exclude<UserRole, "guest">
}

export function AppSidebar({ role = "admin", ...props }: AppSidebarProps) {
  const navGroups = navByRole[role]
  const authUser = useAuthStore((s) => s.user)

  const user = {
    name: authUser?.name ?? "",
    email: authUser?.email ?? "",
    avatar: "",
  }

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="flex aspect-square size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Logo size={24} className="text-current" />
                </div>
                <div className="grid flex-1 text-start text-sm leading-tight">
                  <span className="truncate font-medium">Rollin Locations</span>
                  <span className="truncate text-xs text-muted-foreground capitalize">{role}</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {navGroups.map((group) => (
          <NavMain key={group.label} label={group.label} items={group.items} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
