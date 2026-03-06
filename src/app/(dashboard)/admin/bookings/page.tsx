"use client"

import { useMemo } from "react"
import { DataTable } from "@/components/admin/data-table"
import type { DataTableFilter } from "@/components/admin/data-table"
import { useAdminStore } from "@/stores/admin-store"
import { getBookingColumns } from "./components/columns"

export default function AdminBookingsPage() {
  const bookings = useAdminStore((s) => s.bookingRequests)
  const updateBookingStatus = useAdminStore((s) => s.updateBookingStatus)
  const getLocationById = useAdminStore((s) => s.getLocationById)
  const getUserById = useAdminStore((s) => s.getUserById)

  const columns = useMemo(
    () =>
      getBookingColumns({
        onCancel: (id) => updateBookingStatus(id, "cancelled"),
        getLocationById,
        getUserById,
      }),
    [updateBookingStatus, getLocationById, getUserById]
  )

  const filters: DataTableFilter[] = [
    {
      columnId: "status",
      label: "סטטוס",
      options: [
        { label: "ממתין", value: "requested" },
        { label: "אושר", value: "approved" },
        { label: "נדחה", value: "rejected" },
        { label: "בוטל", value: "cancelled" },
      ],
    },
  ]

  return (
    <div className="flex flex-col gap-6 px-4 lg:px-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">סקירת הזמנות</h1>
        <p className="text-muted-foreground">
          צפייה בכל ההזמנות בפלטפורמה
        </p>
      </div>
      <DataTable
        columns={columns}
        data={bookings}
        searchKey="id"
        searchPlaceholder="חיפוש הזמנות…"
        filters={filters}
      />
    </div>
  )
}
