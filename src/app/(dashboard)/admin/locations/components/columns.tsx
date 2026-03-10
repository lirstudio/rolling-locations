"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, EllipsisVertical, Pause, Play } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Location, LocationStatus, User } from "@/types"

const statusConfig: Record<
  LocationStatus,
  { label: string; className: string }
> = {
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

interface ColumnActions {
  onPause: (id: string) => void
  onUnpause: (id: string) => void
  getUserById: (id: string) => User | undefined
}

export function getLocationColumns(
  actions: ColumnActions
): ColumnDef<Location>[] {
  return [
    {
      accessorKey: "title",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="cursor-pointer -ms-3"
        >
          כותרת
          <ArrowUpDown className="ms-2 size-3.5" />
        </Button>
      ),
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.title}</p>
          <p className="text-xs text-muted-foreground">{row.original.address.city}</p>
        </div>
      ),
    },
    {
      accessorKey: "hostId",
      header: "מארח",
      cell: ({ row }) => {
        const host = actions.getUserById(row.original.hostId)
        return (
          <span className="text-sm">{host?.name ?? row.original.hostId}</span>
        )
      },
    },
    {
      id: "city",
      header: "עיר",
      accessorFn: (row) => row.address.city,
      cell: ({ row }) => (
        <span className="text-sm">{row.original.address.city}</span>
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
      accessorKey: "createdAt",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="cursor-pointer -ms-3"
        >
          נוצר
          <ArrowUpDown className="ms-2 size-3.5" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="text-sm">
          {new Date(row.original.createdAt).toLocaleDateString("he-IL")}
        </span>
      ),
    },
    {
      id: "actions",
      header: "פעולות",
      cell: ({ row }) => {
        const loc = row.original
        const isPaused = loc.status === "paused"
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
              {isPaused ? (
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => actions.onUnpause(loc.id)}
                >
                  <Play className="me-2 size-4" />
                  הפעל מחדש
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => actions.onPause(loc.id)}
                  disabled={loc.status === "draft"}
                >
                  <Pause className="me-2 size-4" />
                  השהה
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}
