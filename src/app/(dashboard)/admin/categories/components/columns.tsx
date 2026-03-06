"use client"

import type { ColumnDef } from "@tanstack/react-table"
import {
  ArrowUp,
  ArrowDown,
  EllipsisVertical,
  Eye,
  EyeOff,
  Pencil,
  Trash2,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Category } from "@/types"

interface ColumnActions {
  onToggleVisibility: (id: string) => void
  onReorder: (id: string, direction: "up" | "down") => void
  onEdit: (category: Category) => void
  onDelete: (id: string) => void
}

export function getCategoryColumns(actions: ColumnActions): ColumnDef<Category>[] {
  return [
    {
      accessorKey: "order",
      header: "סדר",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <span className="w-6 text-center font-mono text-sm">
            {row.original.order}
          </span>
          <div className="flex flex-col">
            <Button
              variant="ghost"
              size="icon"
              className="size-6 cursor-pointer"
              onClick={() => actions.onReorder(row.original.id, "up")}
            >
              <ArrowUp className="size-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-6 cursor-pointer"
              onClick={() => actions.onReorder(row.original.id, "down")}
            >
              <ArrowDown className="size-3" />
            </Button>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "name",
      header: "שם",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name}</span>
      ),
    },
    {
      accessorKey: "slug",
      header: "Slug",
      cell: ({ row }) => (
        <code className="rounded bg-muted px-1.5 py-0.5 text-xs" dir="ltr">
          {row.original.slug}
        </code>
      ),
    },
    {
      accessorKey: "visible",
      header: "גלוי",
      cell: ({ row }) =>
        row.original.visible ? (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            גלוי
          </Badge>
        ) : (
          <Badge variant="outline" className="bg-muted text-muted-foreground">
            מוסתר
          </Badge>
        ),
    },
    {
      id: "actions",
      header: "פעולות",
      cell: ({ row }) => {
        const cat = row.original
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
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => actions.onEdit(cat)}
              >
                <Pencil className="me-2 size-4" />
                עריכה
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => actions.onToggleVisibility(cat.id)}
              >
                {cat.visible ? (
                  <>
                    <EyeOff className="me-2 size-4" />
                    הסתר
                  </>
                ) : (
                  <>
                    <Eye className="me-2 size-4" />
                    הצג
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                className="cursor-pointer"
                onClick={() => actions.onDelete(cat.id)}
              >
                <Trash2 className="me-2 size-4" />
                מחק
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}
