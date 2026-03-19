"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  EllipsisVertical,
  LogOut,
  CircleUser,
  Settings,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore } from "@/stores/auth-store";

const allowSelfAdminEmails =
  typeof process.env.NEXT_PUBLIC_ALLOW_SELF_ADMIN_EMAILS === "string"
    ? new Set(
        process.env.NEXT_PUBLIC_ALLOW_SELF_ADMIN_EMAILS.split(",").map((e) =>
          e.trim().toLowerCase()
        )
      )
    : null;

function canShowSetAsAdmin(email: string, role: string): boolean {
  if (role === "admin") return false;
  if (process.env.NODE_ENV === "development") return true;
  if (allowSelfAdminEmails?.has(email.trim().toLowerCase())) return true;
  return false;
}

export function NavUser({
  user,
}: {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
}) {
  const { isMobile } = useSidebar();
  const direction =
    typeof document === "undefined" ? "rtl" : document.documentElement.dir;
  const dropdownSide = isMobile
    ? "bottom"
    : direction === "rtl"
      ? "left"
      : "right";
  const router = useRouter();
  const t = useTranslations("auth");
  const tSettings = useTranslations("settings");
  const signOut = useAuthStore((s) => s.signOut);
  const authUser = useAuthStore((s) => s.user);
  const updateUserMetadata = useAuthStore((s) => s.updateUserMetadata);
  const showSetAsAdmin =
    authUser &&
    canShowSetAsAdmin(authUser.email, authUser.role);

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  async function handleSignOut() {
    await signOut();
    router.push("/sign-in");
  }

  async function handleSetAsAdmin() {
    await updateUserMetadata({ role: "admin" });
    router.push("/dashboard");
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer"
            >
              <Avatar className="h-8 w-8 shrink-0 rounded-lg">
                <AvatarImage src={user.avatar || undefined} alt="" />
                <AvatarFallback className="rounded-lg text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-start text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="text-muted-foreground truncate text-xs">
                  {user.email}
                </span>
              </div>
              <EllipsisVertical className="ms-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            dir={direction}
            side={dropdownSide}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-start text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar || undefined} alt="" />
                  <AvatarFallback className="rounded-lg text-xs">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-start text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="text-muted-foreground truncate text-xs">
                    {user.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href="/settings/account">
                  <CircleUser />
                  {tSettings("account.title")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href="/settings/user">
                  <Settings />
                  {tSettings("user.title")}
                </Link>
              </DropdownMenuItem>
              {showSetAsAdmin && (
                <DropdownMenuItem
                  onClick={handleSetAsAdmin}
                  className="cursor-pointer"
                >
                  <ShieldCheck />
                  {t("setAsAdmin")}
                </DropdownMenuItem>
              )}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleSignOut}
              className="cursor-pointer"
            >
              <LogOut />
              {t("signOut")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
