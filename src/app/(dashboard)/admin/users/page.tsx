"use client"

import { useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { DataTable } from "@/components/admin/data-table"
import type { DataTableFilter } from "@/components/admin/data-table"
import { getUserColumns } from "./components/columns"
import type { User, UserRole } from "@/types"
import { Loader2, Users } from "lucide-react"
import { queryKeys } from "@/lib/query-keys"

async function fetchUsers(): Promise<User[]> {
  const res = await fetch("/api/admin/users")
  if (!res.ok) {
    if (res.status === 403) throw new Error("אין הרשאה")
    throw new Error(await res.text())
  }
  return res.json()
}

export default function AdminUsersPage() {
  const queryClient = useQueryClient()

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

  const columns = useMemo(
    () =>
      getUserColumns({
        onChangeRole: (id, role) => updateRoleMutation.mutate({ id, role }),
        onDelete: (id) => deleteMutation.mutate(id),
      }),
    [updateRoleMutation, deleteMutation]
  )

  const filters: DataTableFilter[] = [
    {
      columnId: "role",
      label: "תפקיד",
      options: [
        { label: "מנהל", value: "admin" },
        { label: "מארח", value: "host" },
        { label: "יוצר", value: "creator" },
        { label: "אורח", value: "guest" },
      ],
    },
  ]

  if (loading) {
    return (
      <div className="flex flex-col gap-6 px-4 lg:px-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">משתמשים</h1>
          <p className="text-muted-foreground">ניהול משתמשי הפלטפורמה</p>
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
          <h1 className="text-2xl font-bold tracking-tight">משתמשים</h1>
          <p className="text-muted-foreground">ניהול משתמשי הפלטפורמה</p>
        </div>
        <div className="rounded-xl border border-border bg-muted/50 px-4 py-6 text-center text-muted-foreground">
          {error.message}
        </div>
      </div>
    )
  }

  if (users.length === 0) {
    return (
      <div className="flex flex-col gap-6 px-4 lg:px-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">משתמשים</h1>
          <p className="text-muted-foreground">ניהול משתמשי הפלטפורמה</p>
        </div>
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-muted/50 py-16">
          <Users className="size-10 text-muted-foreground" />
          <p className="text-muted-foreground">אין משתמשים במערכת</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 px-4 lg:px-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">משתמשים</h1>
        <p className="text-muted-foreground">ניהול משתמשי הפלטפורמה</p>
      </div>
      <DataTable
        columns={columns}
        data={users}
        searchKey="name"
        searchPlaceholder="חיפוש משתמשים…"
        filters={filters}
        selectable
      />
    </div>
  )
}
