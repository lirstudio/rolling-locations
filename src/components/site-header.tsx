"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { CommandSearch, SearchTrigger } from "@/components/command-search"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

const BREADCRUMB_LABELS: Record<string, string> = {
  host: "מארח",
  overview: "סקירה",
  locations: "לוקיישנים",
  new: "חדש",
  edit: "עריכה",
  availability: "זמינות",
  requests: "בקשות",
  settings: "הגדרות",
  dashboard: "לוח בקרה",
  admin: "ניהול",
  creator: "יוצר",
  bookings: "הזמנות",
  invoices: "חשבוניות",
  users: "משתמשים",
  categories: "קטגוריות",
  commission: "עמלות",
}

function useBreadcrumbs() {
  const pathname = usePathname()
  if (!pathname || pathname === "/") return []

  const segments = pathname.split("/").filter(Boolean)
  return segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/")
    const isId = segment.startsWith("loc-") || segment.startsWith("booking-") || segment.startsWith("avail-")
    const label = isId ? segment : (BREADCRUMB_LABELS[segment] ?? segment)
    const isLast = index === segments.length - 1
    return { href, label, isLast }
  })
}

export function SiteHeader() {
  const [searchOpen, setSearchOpen] = React.useState(false)
  const breadcrumbs = useBreadcrumbs()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setSearchOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  return (
    <>
      <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b border-border/60 shadow-nav transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
        <div className="flex w-full items-center gap-1.5 px-4 py-3 lg:gap-2.5 lg:px-6">
          <SidebarTrigger className="-me-1" />
          <Separator
            orientation="vertical"
            className="mx-2 data-[orientation=vertical]:h-4"
          />
          {breadcrumbs.length > 1 && (
            <>
              <Breadcrumb className="hidden sm:block">
                <BreadcrumbList>
                  {breadcrumbs.map((crumb, idx) => (
                    <React.Fragment key={crumb.href}>
                      {idx > 0 && <BreadcrumbSeparator />}
                      <BreadcrumbItem>
                        {crumb.isLast ? (
                          <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink asChild>
                            <Link href={crumb.href}>{crumb.label}</Link>
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                    </React.Fragment>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
              <Separator
                orientation="vertical"
                className="mx-2 hidden data-[orientation=vertical]:h-4 sm:block"
              />
            </>
          )}
          <div className="flex-1 max-w-sm">
            <SearchTrigger onClick={() => setSearchOpen(true)} />
          </div>
          <div className="ms-auto flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
      </header>
      <CommandSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  )
}
