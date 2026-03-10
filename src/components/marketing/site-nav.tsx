"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Menu, User, LogOut, CircleUser, Settings, LayoutDashboard, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuthStore } from "@/stores/auth-store";
import { roleRedirectPath } from "@/lib/auth";

const SHOOT_OPTIONS = [
  {
    labelKey: "shootCommercial" as const,
    categorySlug: "commercial",
    image: "https://images.unsplash.com/photo-1574717025058-2f8737d2e2b7?w=600&h=400&fit=crop&q=80",
  },
  {
    labelKey: "shootConference" as const,
    categorySlug: "conference",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=400&fit=crop&q=80",
  },
  {
    labelKey: "shootPodcast" as const,
    categorySlug: "podcast",
    image: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=600&h=400&fit=crop&q=80",
  },
];

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function NavAvatar() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("auth");
  const tSettings = useTranslations("settings");
  const tNav = useTranslations("marketing.nav");
  const { user, isAuthenticated, signOut } = useAuthStore();

  const direction = typeof document === "undefined" ? "rtl" : document.documentElement.dir;
  const dropdownSide = direction === "rtl" ? "left" : "right";

  const initials = user ? getInitials(user.name) : null;

  async function handleSignOut() {
    await signOut();
    router.push("/");
  }

  if (!isAuthenticated || !user) {
    return (
      <Button variant="ghost" size="icon" className="rounded-full" asChild>
        <Link href="/auth/sign-up" aria-label={tNav("signUp")}>
          <Avatar className="h-8 w-8 rounded-full">
            <AvatarFallback className="rounded-full bg-muted">
              <User className="size-4 text-muted-foreground" />
            </AvatarFallback>
          </Avatar>
        </Link>
      </Button>
    );
  }

  const dashboardHref = roleRedirectPath(user.role);

  return (
    <div className="flex items-center gap-0.5">
      <Button variant="ghost" size="icon" className="rounded-full" aria-label={tNav("dashboard")} asChild>
        <Link href={dashboardHref}>
          <Avatar className="h-8 w-8 rounded-full">
            <AvatarFallback className="rounded-full text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Link>
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full size-8" aria-label={tNav("accountMenu")}>
            <ChevronDown className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
        className="min-w-56 rounded-lg"
        side={dropdownSide}
        align="end"
        sideOffset={4}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-start text-sm">
            <Avatar className="h-8 w-8 shrink-0 rounded-full">
              <AvatarFallback className="rounded-full text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 min-w-0 text-start text-sm leading-tight">
              <span className="truncate font-medium">{user.name}</span>
              <span className="truncate text-xs text-muted-foreground">{user.email}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild className="cursor-pointer">
            <Link href={dashboardHref}>
              <LayoutDashboard />
              {tNav("dashboard")}
            </Link>
          </DropdownMenuItem>
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
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
          <LogOut />
          {t("signOut")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    </div>
  );
}

export function SiteNav() {
  const t = useTranslations("marketing.nav");
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [shootMenuOpen, setShootMenuOpen] = useState(false);
  const sheetSide = locale === "he" ? "right" : "left";

  const navLinks = [
    { href: "/locations", label: t("discover") },
    { href: "/#how-it-works", label: t("howItWorks") },
    { href: "/for-hosts", label: t("forHosts") },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)} aria-label="Rollin Locations">
          <span className="font-bold text-foreground">Rollin Locations</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(({ href, label }) => (
            <Button key={href} variant="ghost" asChild className="ms-1 me-1">
              <Link href={href}>{label}</Link>
            </Button>
          ))}

          <NavigationMenu dir={locale === "he" ? "rtl" : "ltr"}>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent hover:bg-accent/50 focus:bg-accent/50 data-[state=open]:bg-accent/50 h-9 px-4 py-2 text-sm font-medium cursor-pointer">
                  {t("whatToShoot")}
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid w-[640px] grid-cols-3 gap-3 p-4">
                    {SHOOT_OPTIONS.map((opt) => (
                      <Link
                        key={opt.categorySlug}
                        href={`/locations?category=${opt.categorySlug}`}
                        className="group relative block aspect-[4/3] overflow-hidden rounded-xl focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                      >
                        <Image
                          src={opt.image}
                          alt={t(opt.labelKey)}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="200px"
                          unoptimized
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        <span className="absolute inset-x-0 bottom-0 p-3 text-center text-base font-semibold text-white">
                          {t(opt.labelKey)}
                        </span>
                      </Link>
                    ))}
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        <div className="hidden md:flex items-center gap-2">
          <NavAvatar />
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side={sheetSide} className="w-[280px] sm:w-[320px] flex flex-col p-0">
            <SheetHeader className="border-b border-border p-4">
              <SheetTitle className="flex items-center gap-2">
                Rollin Locations
              </SheetTitle>
            </SheetHeader>
            <nav className="flex flex-1 flex-col gap-1 p-4">
              {navLinks.map(({ href, label }) => (
                <Button key={href} variant="ghost" className="justify-start" asChild>
                  <Link href={href} onClick={() => setOpen(false)}>
                    {label}
                  </Link>
                </Button>
              ))}

              <button
                type="button"
                onClick={() => setShootMenuOpen((v) => !v)}
                className="flex w-full items-center justify-between rounded-md px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
              >
                {t("whatToShoot")}
                <ChevronDown className={`size-4 transition-transform ${shootMenuOpen ? "rotate-180" : ""}`} />
              </button>
              {shootMenuOpen && (
                <div className="grid grid-cols-1 gap-2 px-2 pb-2">
                  {SHOOT_OPTIONS.map((opt) => (
                    <Link
                      key={opt.categorySlug}
                      href={`/locations?category=${opt.categorySlug}`}
                      onClick={() => setOpen(false)}
                      className="group relative block aspect-video overflow-hidden rounded-lg"
                    >
                      <Image
                        src={opt.image}
                        alt={t(opt.labelKey)}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="280px"
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      <span className="absolute inset-x-0 bottom-0 p-2 text-center text-sm font-semibold text-white">
                        {t(opt.labelKey)}
                      </span>
                    </Link>
                  ))}
                </div>
              )}

              <div className="mt-4 border-t border-border pt-4 flex items-center justify-end">
                <NavAvatar />
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
