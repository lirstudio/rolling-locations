"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, EllipsisVertical, XCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { BookingRequest, BookingStatus, Location, User } from "@/types"

const statusConfig: Record<
  BookingStatus,
  { label: string; className: string }
> = {
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
}

interface ColumnActions {
  onCancel: (id: string) => void
  getLocationById: (id: string) => Location | undefined
  getUserById: (id: string) => User | undefined
}

export function getBookingColumns(
  actions: ColumnActions
): ColumnDef<BookingRequest>[] {
  return [
    {
      accessorKey: "id",
      header: "מזהה",
      cell: ({ row }) => (
        <code className="rounded bg-muted px-1.5 py-0.5 text-xs" dir="ltr">
          {row.original.id}
        </code>
      ),
    },
    {
      accessorKey: "locationId",
      header: "לוקיישן",
      cell: ({ row }) => {
        const loc = actions.getLocationById(row.original.locationId)
        return (
          <span className="text-sm font-medium">
            {loc?.title ?? row.original.locationId}
          </span>
        )
      },
    },
    {
      accessorKey: "creatorId",
      header: "יוצר",
      cell: ({ row }) => {
        const user = actions.getUserById(row.original.creatorId)
        return <span className="text-sm">{user?.name ?? row.original.creatorId}</span>
      },
    },
    {
      accessorKey: "start",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="cursor-pointer -ms-3"
        >
          תאריך
          <ArrowUpDown className="ms-2 size-3.5" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="text-sm">
          {new Date(row.original.start).toLocaleDateString("he-IL")}
        </span>
      ),
    },
    {
      accessorKey: "durationHours",
      header: "משך",
      cell: ({ row }) => (
        <span className="text-sm">{row.original.durationHours} שעות</span>
      ),
    },
    {
      accessorKey: "priceEstimate",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="cursor-pointer -ms-3"
        >
          מחיר
          <ArrowUpDown className="ms-2 size-3.5" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="text-sm font-medium">
          ₪{row.original.priceEstimate.toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "סטטוס",
      cell: ({ row }) => {
        const status = row.original.status
        const cfg = statusConfig[status]
        return (
          <Badge variant="outline" className={cfg.className}>
            {cfg.label}
          </Badge>
        )
      },
      filterFn: (row, _columnId, value: string) =>
        row.original.status === value,
    },
    {
      id: "actions",
      header: "פעולות",
      cell: ({ row }) => {
        const booking = row.original
        const canCancel =
          booking.status === "requested" || booking.status === "approved"
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 cursor-pointer"
              >
                <EllipsisVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                variant="destructive"
                className="cursor-pointer"
                disabled={!canCancel}
                onClick={() => actions.onCancel(booking.id)}
              >
                <XCircle className="me-2 size-4" />
                ביטול הזמנה
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}
