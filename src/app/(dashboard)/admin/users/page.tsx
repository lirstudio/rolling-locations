"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { DataTable } from "@/components/admin/data-table"
import type { DataTableFilter } from "@/components/admin/data-table"
import { getUserColumns } from "./components/columns"
import type { User, UserRole } from "@/types"
import { Loader2, Users } from "lucide-react"

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/admin/users")
      if (!res.ok) {
        if (res.status === 403) throw new Error("אין הרשאה")
        throw new Error(await res.text())
      }
      const data: User[] = await res.json()
      setUsers(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : "שגיאה בטעינת משתמשים")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const updateUserRole = useCallback(
    async (id: string, role: UserRole) => {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      })
      if (!res.ok) return
      await fetchUsers()
    },
    [fetchUsers]
  )

  const deleteUser = useCallback(
    async (id: string) => {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" })
      if (!res.ok) return
      await fetchUsers()
    },
    [fetchUsers]
  )

  const columns = useMemo(
    () =>
      getUserColumns({
        onChangeRole: updateUserRole,
        onDelete: deleteUser,
      }),
    [updateUserRole, deleteUser]
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
          {error}
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
