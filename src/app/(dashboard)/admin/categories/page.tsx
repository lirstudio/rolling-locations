"use client"

import { useMemo } from "react"
import { DataTable } from "@/components/admin/data-table"
import { useAdminStore } from "@/stores/admin-store"
import { getCategoryColumns } from "./components/columns"
import { CategoryFormDialog } from "./components/category-form-dialog"
import type { Category } from "@/types"

export default function AdminCategoriesPage() {
  const categories = useAdminStore((s) => s.categories)
  const addCategory = useAdminStore((s) => s.addCategory)
  const updateCategory = useAdminStore((s) => s.updateCategory)
  const deleteCategory = useAdminStore((s) => s.deleteCategory)
  const toggleVisibility = useAdminStore((s) => s.toggleCategoryVisibility)
  const reorder = useAdminStore((s) => s.reorderCategory)

  const sorted = useMemo(
    () => [...categories].sort((a, b) => a.order - b.order),
    [categories]
  )

  const handleAdd = (values: {
    name: string
    slug: string
    visible: boolean
  }) => {
    const maxOrder = Math.max(0, ...categories.map((c) => c.order))
    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name: values.name,
      slug: values.slug,
      order: maxOrder + 1,
      visible: values.visible,
    }
    addCategory(newCat)
  }

  const handleEdit = (cat: Category) => {
    // Re-opens dialog handled via state; for MVP we update inline
  }

  const columns = useMemo(
    () =>
      getCategoryColumns({
        onToggleVisibility: toggleVisibility,
        onReorder: reorder,
        onEdit: handleEdit,
        onDelete: deleteCategory,
      }),
    [toggleVisibility, reorder, deleteCategory]
  )

  return (
    <div className="flex flex-col gap-6 px-4 lg:px-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">קטגוריות</h1>
        <p className="text-muted-foreground">
          ניהול קטגוריות הלוקיישנים, סידור וגלויות
        </p>
      </div>
      <DataTable
        columns={columns}
        data={sorted}
        searchKey="name"
        searchPlaceholder="חיפוש קטגוריות…"
        toolbar={<CategoryFormDialog onSubmit={handleAdd} />}
      />
    </div>
  )
}
