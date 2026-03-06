"use client"

import Link from "next/link"
import {
  Users,
  Tags,
  MapPin,
  BookOpen,
  ArrowUpRight,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAdminStore } from "@/stores/admin-store"

export default function AdminDashboardPage() {
  const users = useAdminStore((s) => s.users)
  const categories = useAdminStore((s) => s.categories)
  const locations = useAdminStore((s) => s.locations)
  const bookings = useAdminStore((s) => s.bookingRequests)

  const stats = [
    {
      title: "סה״כ משתמשים",
      value: users.length,
      icon: Users,
      href: "/admin/users",
    },
    {
      title: "קטגוריות פעילות",
      value: categories.filter((c) => c.visible).length,
      icon: Tags,
      href: "/admin/categories",
    },
    {
      title: "סה״כ לוקיישנים",
      value: locations.length,
      icon: MapPin,
      href: "/admin/locations",
    },
    {
      title: "סה״כ הזמנות",
      value: bookings.length,
      icon: BookOpen,
      href: "/admin/bookings",
    },
  ]

  return (
    <div className="flex flex-col gap-6 px-4 lg:px-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">לוח בקרה – ניהול</h1>
        <p className="text-muted-foreground">
          סקירה כללית של פעילות הפלטפורמה
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.href} className="rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold">{stat.value}</span>
                <Button variant="ghost" size="sm" asChild className="cursor-pointer">
                  <Link href={stat.href}>
                    <ArrowUpRight className="size-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle className="text-base">הזמנות אחרונות</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {bookings.slice(0, 5).map((b) => {
              const loc = locations.find((l) => l.id === b.locationId)
              const creator = users.find((u) => u.id === b.creatorId)
              return (
                <div
                  key={b.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {loc?.title ?? b.locationId}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {creator?.name ?? b.creatorId}
                    </p>
                  </div>
                  <StatusBadge status={b.status} />
                </div>
              )
            })}
          </CardContent>
        </Card>

        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle className="text-base">לוקיישנים לפי סטטוס</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(["published", "draft", "paused"] as const).map((status) => {
              const count = locations.filter((l) => l.status === status).length
              return (
                <div
                  key={status}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <StatusBadge status={status} />
                  <span className="text-lg font-semibold">{count}</span>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    requested: {
      label: "ממתין",
      className: "bg-yellow-50 text-yellow-700 border-yellow-200",
    },
    approved: {
      label: "אושר",
      className: "bg-green-50 text-green-700 border-green-200",
    },
    rejected: {
      label: "נדחה",
      className: "bg-red-50 text-red-700 border-red-200",
    },
    cancelled: {
      label: "בוטל",
      className: "bg-muted text-muted-foreground",
    },
    published: {
      label: "פורסם",
      className: "bg-green-50 text-green-700 border-green-200",
    },
    draft: {
      label: "טיוטה",
      className: "bg-muted text-muted-foreground",
    },
    paused: {
      label: "מושהה",
      className: "bg-yellow-50 text-yellow-700 border-yellow-200",
    },
  }
  const { label, className } = map[status] ?? {
    label: status,
    className: "bg-muted text-muted-foreground",
  }
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${className}`}
    >
      {label}
    </span>
  )
}
