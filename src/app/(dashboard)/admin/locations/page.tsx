"use client"

import { useMemo } from "react"
import { DataTable } from "@/components/admin/data-table"
import type { DataTableFilter } from "@/components/admin/data-table"
import { useAdminStore } from "@/stores/admin-store"
import { getLocationColumns } from "./components/columns"

export default function AdminLocationsPage() {
  const locations = useAdminStore((s) => s.locations)
  const setLocationStatus = useAdminStore((s) => s.setLocationStatus)
  const getUserById = useAdminStore((s) => s.getUserById)

  const columns = useMemo(
    () =>
      getLocationColumns({
        onPause: (id) => setLocationStatus(id, "paused"),
        onUnpause: (id) => setLocationStatus(id, "published"),
        getUserById,
      }),
    [setLocationStatus, getUserById]
  )

  const filters: DataTableFilter[] = [
    {
      columnId: "status",
      label: "סטטוס",
      options: [
        { label: "פורסם", value: "published" },
        { label: "טיוטה", value: "draft" },
        { label: "מושהה", value: "paused" },
      ],
    },
  ]

  return (
    <div className="flex flex-col gap-6 px-4 lg:px-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          מודרציית לוקיישנים
        </h1>
        <p className="text-muted-foreground">
          סקירה והשהיית לוקיישנים בפלטפורמה
        </p>
      </div>
      <DataTable
        columns={columns}
        data={locations}
        searchKey="title"
        searchPlaceholder="חיפוש לוקיישנים…"
        filters={filters}
      />
    </div>
  )
}
