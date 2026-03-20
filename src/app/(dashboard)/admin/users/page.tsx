"use client"

import { useCallback, useMemo } from "react"
import type { FilterFn } from "@tanstack/react-table"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useLocale, useTranslations } from "next-intl"
import { toast } from "sonner"
import { DataTable } from "@/components/admin/data-table"
import type { DataTableFilter } from "@/components/admin/data-table"
import { getUserColumns } from "./components/columns"
import { AdminUserFormDialog } from "./components/user-form-dialog"
import type { User, UserRole } from "@/types"
import { Loader2 } from "lucide-react"
import { queryKeys } from "@/lib/query-keys"

const usersGlobalFilter: FilterFn<User> = (row, _columnId, filterValue) => {
  const q = String(filterValue).toLowerCase().trim()
  if (!q) return true
  const u = row.original
  return (
    u.name.toLowerCase().includes(q) ||
    u.email.toLowerCase().includes(q) ||
    (u.phone?.toLowerCase().includes(q) ?? false)
  )
}

export default function AdminUsersPage() {
  const t = useTranslations("admin.users")
  const locale = useLocale()
  const queryClient = useQueryClient()
  const menuAlign = locale === "he" ? "start" : "end"
  const dateLocale = locale === "he" ? "he-IL" : "en-US"

  const fetchUsers = useCallback(async (): Promise<User[]> => {
    const res = await fetch("/api/admin/users")
    if (!res.ok) {
      if (res.status === 403) throw new Error(t("forbidden"))
      const text = await res.text()
      throw new Error(text || t("addUserError"))
    }
    return res.json()
  }, [t])

  const {
    data: users = [],
    isLoading: loading,
    error,
  } = useQuery<User[], Error>({
    queryKey: queryKeys.admin.users(),
    queryFn: fetchUsers,
  })

  const updateRoleMutation = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: UserRole }) => {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      })
      if (!res.ok) throw new Error("Failed to update role")
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users() }),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete user")
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users() }),
  })

  const createMutation = useMutation({
    mutationFn: async (body: {
      name: string
      email: string
      phone?: string
      role: UserRole
    }) => {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: body.name.trim(),
          email: body.email.trim().toLowerCase(),
          phone: body.phone?.trim() || undefined,
          role: body.role,
        }),
      })
      const data = (await res.json().catch(() => ({}))) as {
        error?: string
        method?: "invite" | "create"
      }
      if (!res.ok) {
        throw new Error(data.error ?? t("addUserError"))
      }
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users() })
      if (data.method === "invite") {
        toast.success(t("addUserSuccessInvite"))
      } else {
        toast.success(t("addUserSuccessCreate"))
      }
    },
    onError: (e: Error) => {
      toast.error(e.message || t("addUserError"))
    },
  })

  const columns = useMemo(
    () =>
      getUserColumns(
        {
          onChangeRole: (id, role) => updateRoleMutation.mutate({ id, role }),
          onDelete: (id) => deleteMutation.mutate(id),
        },
        t,
        menuAlign,
        dateLocale
      ),
    [
      t,
      menuAlign,
      dateLocale,
      updateRoleMutation.mutate,
      deleteMutation.mutate,
    ]
  )

  const filters: DataTableFilter[] = useMemo(
    () => [
      {
        columnId: "role",
        label: t("role.label"),
        options: (["admin", "host", "creator", "guest"] as const).map(
          (r) => ({
            label: t(`role.${r}`),
            value: r,
          })
        ),
      },
    ],
    [t]
  )

  const csvExport = useMemo(
    () => ({
      filename: `rollin-users-${new Date().toISOString().slice(0, 10)}.csv`,
      headers: [
        "id",
        t("name"),
        t("email"),
        t("phone"),
        t("role.label"),
        t("createdAt"),
        t("lastLogin"),
      ],
      getRowValues: (u: User) => [
        u.id,
        u.name,
        u.email,
        u.phone ?? "",
        t(`role.${u.role}`),
        u.createdAt,
        u.lastLoginAt ?? "",
      ],
    }),
    [t]
  )

  if (loading) {
    return (
      <div className="flex flex-col gap-6 px-4 lg:px-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>
        <div className="flex flex-1 items-center justify-center py-16">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col gap-6 px-4 lg:px-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>
        <div className="rounded-xl border border-border bg-muted/50 px-4 py-6 text-center text-muted-foreground">
          {error.message}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 px-4 lg:px-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      <DataTable
        columns={columns}
        data={users}
        searchKey="name"
        searchPlaceholder={t("searchPlaceholder")}
        filters={filters}
        selectable
        cardLayout
        globalFilterFn={usersGlobalFilter}
        csvExport={csvExport}
        headerActions={
          <AdminUserFormDialog
            onSubmit={async (values) => {
              await createMutation.mutateAsync(values)
            }}
            disabled={createMutation.isPending}
          />
        }
      />
    </div>
  )
}
