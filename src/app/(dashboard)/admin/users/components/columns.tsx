"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
  admin: "border-primary/30 bg-surface-hover text-primary",
  host: "border-border bg-muted text-foreground",
  creator: "border-border bg-accent text-accent-foreground",
  guest: "bg-muted text-muted-foreground",
}

/** next-intl `useTranslations("admin.users")` */
type AdminUsersT = (key: string) => string

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "?"
}

interface ColumnActions {
  onChangeRole: (id: string, role: UserRole) => void
  onDelete: (id: string) => void
}

export function getUserColumns(
  actions: ColumnActions,
  t: AdminUsersT,
  menuAlign: "start" | "end",
  dateLocale: string
): ColumnDef<User>[] {
  const roleLabel = (r: UserRole) => t(`role.${r}`)

  return [
    {
      id: "user",
      accessorFn: (row) => row.name,
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="cursor-pointer -ms-3 font-medium text-muted-foreground uppercase tracking-wider"
        >
          {t("user")}
          <ArrowUpDown className="ms-2 size-3.5" />
        </Button>
      ),
      cell: ({ row }) => {
        const u = row.original
        return (
          <div className="flex items-center gap-3">
            <Avatar className="size-10 bg-muted">
              {u.avatarUrl ? (
                <AvatarImage src={u.avatarUrl} alt="" />
              ) : null}
              <AvatarFallback className="bg-surface-hover font-semibold text-primary">
                {getInitials(u.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="font-medium text-foreground">{u.name}</p>
              <p className="truncate text-sm text-muted-foreground" dir="ltr">
                {u.email}
              </p>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "phone",
      header: () => (
        <span className="font-medium text-muted-foreground uppercase tracking-wider">
          {t("phone")}
        </span>
      ),
      cell: ({ row }) => (
        <span className="text-sm" dir="ltr">
          {row.original.phone ?? "—"}
        </span>
      ),
    },
    {
      accessorKey: "role",
      header: () => (
        <span className="font-medium text-muted-foreground uppercase tracking-wider">
          {t("role.label")}
        </span>
      ),
      cell: ({ row }) => {
        const role = row.original.role
        return (
          <Badge variant="outline" className={roleBadgeClass[role]}>
            {roleLabel(role)}
          </Badge>
        )
      },
      filterFn: (row, _columnId, value: string) =>
        row.original.role === value,
    },
    {
      accessorKey: "lastLoginAt",
      header: () => (
        <span className="font-medium text-nowrap text-muted-foreground uppercase tracking-wider">
          {t("lastLogin")}
        </span>
      ),
      cell: ({ row }) => {
        const v = row.original.lastLoginAt
        return (
          <span className="text-sm font-medium text-foreground text-nowrap">
            {v
              ? new Date(v).toLocaleString(dateLocale, {
                  dateStyle: "short",
                  timeStyle: "short",
                })
              : "—"}
          </span>
        )
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="cursor-pointer -ms-3 font-medium text-muted-foreground uppercase tracking-wider"
        >
          {t("createdAt")}
          <ArrowUpDown className="ms-2 size-3.5" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="text-nowrap text-sm text-muted-foreground">
          {new Date(row.original.createdAt).toLocaleDateString(dateLocale)}
        </span>
      ),
    },
    {
      id: "actions",
      header: () => (
        <span className="font-medium text-muted-foreground uppercase tracking-wider">
          {t("actions")}
        </span>
      ),
      cell: ({ row }) => {
        const user = row.original
        const roles: UserRole[] = ["admin", "host", "creator", "guest"]
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="cursor-pointer gap-1">
                {t("actionsMenu")}
                <ChevronDown className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={menuAlign}>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="cursor-pointer">
                  {t("changeRole")}
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {roles.map((r) => (
                    <DropdownMenuItem
                      key={r}
                      className="cursor-pointer"
                      disabled={r === user.role}
                      onClick={() => actions.onChangeRole(user.id, r)}
                    >
                      {roleLabel(r)}
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
                {t("deleteUser")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}
