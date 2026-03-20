"use client"

import { useMemo, useState } from "react"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type FilterFn,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { useLocale, useTranslations } from "next-intl"
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
  Search,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

export interface DataTableFilterOption {
  label: string
  value: string
}

export interface DataTableFilter {
  columnId: string
  label: string
  options: DataTableFilterOption[]
}

export interface DataTableCsvExportConfig<TData> {
  filename: string
  headers: string[]
  getRowValues: (row: TData) => string[]
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchKey?: string
  searchPlaceholder?: string
  filters?: DataTableFilter[]
  toolbar?: React.ReactNode
  headerActions?: React.ReactNode
  selectable?: boolean
  pageSize?: number
  /** Card shell with header toolbar (Rollin / shadcn-style admin table). */
  cardLayout?: boolean
  globalFilterFn?: FilterFn<TData>
  csvExport?: DataTableCsvExportConfig<TData>
}

function escapeCsvCell(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

function downloadCsv(filename: string, headers: string[], rows: string[][]): void {
  const lines = [
    headers.map(escapeCsvCell).join(","),
    ...rows.map((r) => r.map(escapeCsvCell).join(",")),
  ]
  const blob = new Blob(["\ufeff", lines.join("\n")], {
    type: "text/csv;charset=utf-8;",
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function visiblePageIndices(
  pageIndex: number,
  pageCount: number,
  maxVisible: number
): number[] {
  if (pageCount <= maxVisible) {
    return Array.from({ length: pageCount }, (_, i) => i)
  }
  const half = Math.floor(maxVisible / 2)
  let start = pageIndex - half
  if (start < 0) start = 0
  if (start > pageCount - maxVisible) start = pageCount - maxVisible
  return Array.from({ length: maxVisible }, (_, i) => start + i)
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder = "Search...",
  filters = [],
  toolbar,
  headerActions,
  selectable = false,
  pageSize = 10,
  cardLayout = false,
  globalFilterFn,
  csvExport,
}: DataTableProps<TData, TValue>) {
  const t = useTranslations("admin.dataTable")
  const locale = useLocale()
  const menuAlign = locale === "he" ? "start" : "end"

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState("")

  const allColumns: ColumnDef<TData, TValue>[] = selectable
    ? [
        {
          id: "select",
          header: ({ table }) => (
            <div className="flex items-center justify-center px-2">
              <Checkbox
                checked={
                  table.getIsAllPageRowsSelected() ||
                  (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) =>
                  table.toggleAllPageRowsSelected(!!value)
                }
                aria-label={t("selectAllAria")}
              />
            </div>
          ),
          cell: ({ row }) => (
            <div className="flex items-center justify-center px-2">
              <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label={t("selectRowAria")}
              />
            </div>
          ),
          enableSorting: false,
          enableHiding: false,
          size: 50,
        } as ColumnDef<TData, TValue>,
        ...columns,
      ]
    : columns

  const table = useReactTable({
    data,
    columns: allColumns,
    initialState: { pagination: { pageSize } },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    ...(globalFilterFn ? { globalFilterFn } : {}),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  })

  const pageIndex = table.getState().pagination.pageIndex
  const pageCount = table.getPageCount()

  const pageIndices = useMemo(
    () => visiblePageIndices(pageIndex, pageCount, 7),
    [pageIndex, pageCount]
  )

  const filteredRows = table.getFilteredRowModel().rows
  const totalFiltered = filteredRows.length
  const pageSizeState = table.getState().pagination.pageSize
  const fromEntry =
    totalFiltered === 0 ? 0 : pageIndex * pageSizeState + 1
  const toEntry = Math.min((pageIndex + 1) * pageSizeState, totalFiltered)

  const handleExportCsv = () => {
    if (!csvExport) return
    const rows = filteredRows.map((r) =>
      csvExport.getRowValues(r.original as TData)
    )
    downloadCsv(csvExport.filename, csvExport.headers, rows)
  }

  const filterBlock = filters.length > 0 && (
    <div className="grid gap-2 sm:grid-cols-4 sm:gap-4">
      {filters.map((f) => {
        const filterValue = table
          .getColumn(f.columnId)
          ?.getFilterValue() as string
        return (
          <div key={f.columnId} className="space-y-2">
            <Label className="text-sm font-medium">{f.label}</Label>
            <Select
              value={filterValue || ""}
              onValueChange={(v) =>
                table
                  .getColumn(f.columnId)
                  ?.setFilterValue(v === "all" ? "" : v)
              }
            >
              <SelectTrigger className="cursor-pointer w-full">
                <SelectValue placeholder={f.label} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{f.label}</SelectItem>
                {f.options.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )
      })}
      <div className="space-y-2">
        <Label className="text-sm font-medium">{t("columns")}</Label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="cursor-pointer w-full">
              {t("columns")}{" "}
              <ChevronDown className="ms-2 size-4 shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={menuAlign}>
            {table
              .getAllColumns()
              .filter((col) => col.getCanHide())
              .map((col) => (
                <DropdownMenuCheckboxItem
                  key={col.id}
                  className="capitalize"
                  checked={col.getIsVisible()}
                  onCheckedChange={(v) => col.toggleVisibility(!!v)}
                >
                  {col.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )

  const searchBlock =
    searchKey !== undefined ? (
      <div className="relative w-full max-w-sm flex-1">
        <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={searchPlaceholder}
          value={globalFilter ?? ""}
          onChange={(e) => setGlobalFilter(String(e.target.value))}
          className="ps-9"
        />
      </div>
    ) : null

  const exportBlock =
    csvExport !== undefined ? (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="cursor-pointer">
            <Download className="size-4 shrink-0" />
            <span className="ms-2">{t("export")}</span>
            <ChevronDown className="ms-2 size-4 shrink-0" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align={menuAlign}>
          <DropdownMenuItem className="cursor-pointer" onClick={handleExportCsv}>
            {t("exportCsv")}
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer" disabled>
            {t("exportExcel")}
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer" disabled>
            {t("exportPdf")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ) : null

  const headerToolbar = (
    <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end">
      {exportBlock}
      {headerActions}
      {toolbar}
    </div>
  )

  const tableSection = (
    <div
      className={cn(
        "overflow-x-auto",
        !cardLayout && "rounded-xl border",
        "[&_[data-slot=table-head]]:text-start [&_[data-slot=table-cell]]:text-start"
      )}
    >
      <Table>
        <TableHeader className={cn(cardLayout && "bg-muted/50")}>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="border-border">
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className="p-4">
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className="border-border transition-colors hover:bg-muted/30"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="p-4">
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={allColumns.length}
                className="h-24 text-center text-muted-foreground"
              >
                {t("noResults")}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )

  const paginationSection = (
    <div
      className={cn(
        "flex flex-col gap-4 border-border sm:flex-row sm:items-center sm:justify-between",
        cardLayout ? "border-t p-4" : "py-4"
      )}
    >
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Label className="text-sm font-medium whitespace-nowrap">
            {t("show")}
          </Label>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(v) => table.setPageSize(Number(v))}
          >
            <SelectTrigger className="w-20 cursor-pointer">
              <SelectValue />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 50].map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <p className="text-sm text-muted-foreground">
          {t("showingEntries", {
            from: fromEntry,
            to: toEntry,
            total: totalFiltered,
          })}
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end">
        {selectable && (
          <span className="text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} / {totalFiltered}
          </span>
        )}
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="size-9 cursor-pointer"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            aria-label={t("firstPageAria")}
          >
            <ChevronsLeft className="size-4 rtl:rotate-180" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-9 cursor-pointer"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            aria-label={t("previous")}
          >
            <ChevronLeft className="size-4 rtl:rotate-180" />
          </Button>
          {pageIndices.map((idx) => (
            <Button
              key={idx}
              variant={pageIndex === idx ? "default" : "outline"}
              size="icon"
              className={cn(
                "size-9 cursor-pointer",
                pageIndex === idx && "bg-primary text-primary-foreground"
              )}
              onClick={() => table.setPageIndex(idx)}
            >
              {idx + 1}
            </Button>
          ))}
          <Button
            variant="outline"
            size="icon"
            className="size-9 cursor-pointer"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            aria-label={t("next")}
          >
            <ChevronRight className="size-4 rtl:rotate-180" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-9 cursor-pointer"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            aria-label={t("lastPageAria")}
          >
            <ChevronsRight className="size-4 rtl:rotate-180" />
          </Button>
        </div>
        <span className="text-sm font-medium text-muted-foreground">
          {t("pageSummary", {
            current: pageIndex + 1,
            total: Math.max(1, table.getPageCount()),
          })}
        </span>
      </div>
    </div>
  )

  if (cardLayout) {
    return (
      <Card className="mx-auto w-full max-w-6xl gap-0 pb-0">
        <CardHeader className="gap-4 space-y-4 border-b border-border">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            {searchBlock}
            <div className="flex w-full flex-1 flex-wrap items-center justify-center gap-2 sm:ms-auto sm:justify-end">
              {headerToolbar}
            </div>
          </div>
          {filterBlock}
        </CardHeader>
        <CardContent className="p-0">{tableSection}</CardContent>
        {paginationSection}
      </Card>
    )
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {searchBlock && (
          <div className="flex flex-1 items-center gap-2">{searchBlock}</div>
        )}
        {(headerActions || toolbar || exportBlock) && headerToolbar}
      </div>

      {filterBlock}

      {tableSection}

      {paginationSection}
    </div>
  )
}
