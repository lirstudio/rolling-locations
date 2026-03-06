"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { EllipsisVertical, ArrowUpDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { User, UserRole } from "@/types"

const roleBadgeClass: Record<UserRole, string> = {
  admin: "bg-red-50 text-red-700 border-red-200",
  host: "bg-blue-50 text-blue-700 border-blue-200",
  creator: "bg-purple-50 text-purple-700 border-purple-200",
  guest: "bg-muted text-muted-foreground",
}

const roleLabel: Record<UserRole, string> = {
  admin: "מנהל",
  host: "מארח",
  creator: "יוצר",
  guest: "אורח",
}

interface ColumnActions {
  onChangeRole: (id: string, role: UserRole) => void
  onDelete: (id: string) => void
}

export function getUserColumns(actions: ColumnActions): ColumnDef<User>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="cursor-pointer -ms-3"
        >
          שם
          <ArrowUpDown className="ms-2 size-3.5" />
        </Button>
      ),
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.name}</p>
          <p className="text-sm text-muted-foreground">{row.original.email}</p>
        </div>
      ),
    },
    {
      accessorKey: "phone",
      header: "טלפון",
      cell: ({ row }) => (
        <span className="text-sm">{row.original.phone ?? "—"}</span>
      ),
    },
    {
      accessorKey: "role",
      header: "תפקיד",
      cell: ({ row }) => {
        const role = row.original.role
        return (
          <Badge
            variant="outline"
            className={roleBadgeClass[role]}
          >
            {roleLabel[role]}
          </Badge>
        )
      },
      filterFn: (row, _columnId, value: string) =>
        row.original.role === value,
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="cursor-pointer -ms-3"
        >
          הצטרף
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
        const user = row.original
        const roles: UserRole[] = ["admin", "host", "creator", "guest"]
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8 cursor-pointer">
                <EllipsisVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="cursor-pointer">
                  שנה תפקיד
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {roles.map((r) => (
                    <DropdownMenuItem
                      key={r}
                      className="cursor-pointer"
                      disabled={r === user.role}
                      onClick={() => actions.onChangeRole(user.id, r)}
                    >
                      {roleLabel[r]}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                className="cursor-pointer"
                onClick={() => actions.onDelete(user.id)}
              >
                מחק משתמש
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}
