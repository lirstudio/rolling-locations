import { MapPin, BookOpen, Users, Inbox } from "lucide-react"

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { mockBookingRequests, mockLocations, mockUsers } from "@/mocks"

export function SectionCards() {
  const publishedLocations = mockLocations.filter((l) => l.status === "published").length
  const pendingRequests = mockBookingRequests.filter((b) => b.status === "requested").length
  const approvedRequests = mockBookingRequests.filter((b) => b.status === "approved").length
  const totalCreators = mockUsers.filter((u) => u.role === "creator").length

  const stats = [
    {
      label: "לוקיישנים פעילים",
      value: publishedLocations,
      icon: MapPin,
    },
    {
      label: "בקשות ממתינות",
      value: pendingRequests,
      icon: Inbox,
    },
    {
      label: "הזמנות מאושרות",
      value: approvedRequests,
      icon: BookOpen,
    },
    {
      label: "יוצרים רשומים",
      value: totalCreators,
      icon: Users,
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="@container/card">
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <div className="flex flex-col gap-1">
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle className="text-3xl font-semibold tabular-nums">
                {stat.value}
              </CardTitle>
            </div>
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <stat.icon className="size-5" />
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  )
}
