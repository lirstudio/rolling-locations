"use client"

import { useMemo } from "react"
import { DataTable } from "@/components/admin/data-table"
import type { DataTableFilter } from "@/components/admin/data-table"
import { useAdminStore } from "@/stores/admin-store"
import { getUserColumns } from "./components/columns"

export default function AdminUsersPage() {
  const users = useAdminStore((s) => s.users)
  const updateUserRole = useAdminStore((s) => s.updateUserRole)
  const deleteUser = useAdminStore((s) => s.deleteUser)

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
