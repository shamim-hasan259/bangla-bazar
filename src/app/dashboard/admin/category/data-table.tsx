"use client"

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import React from "react"
import { Input } from "@/components/ui/input"
import { Search, ChevronLeft, ChevronRight } from "lucide-react"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export function UserDataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  })

  return (
    <div className="space-y-4">
      {/* Search Filter Bar */}
      <div className="flex items-center justify-between py-2 gap-4">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
          <Input
            placeholder="Search categories..."
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("name")?.setFilterValue(event.target.value)
            }
            className="pl-10 pr-4 bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800/80 rounded-xl focus-visible:ring-indigo-500 focus-visible:border-indigo-500 transition-all duration-300 shadow-sm"
          />
        </div>
      </div>
    
      {/* Premium Table Container */}
      <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent border-b border-slate-200/60 dark:border-slate-800/60">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="h-12 text-slate-600 dark:text-slate-400 font-semibold text-xs uppercase tracking-wider">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors border-b border-slate-100 dark:border-slate-800/50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3 px-4 align-middle">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-slate-500 dark:text-slate-400 font-medium">
                  No categories found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Premium Pagination Section */}
      <div className="flex items-center justify-between py-4 px-2">
        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Showing <span className="font-semibold text-slate-800 dark:text-slate-200">{table.getRowModel().rows.length}</span> of <span className="font-semibold text-slate-800 dark:text-slate-200">{data.length}</span> categories
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="rounded-xl border-slate-200/80 dark:border-slate-800/80 h-9 w-9 p-0 flex items-center justify-center transition-all bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 shadow-sm disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          </Button>
          <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 font-mono">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="rounded-xl border-slate-200/80 dark:border-slate-800/80 h-9 w-9 p-0 flex items-center justify-center transition-all bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 shadow-sm disabled:opacity-50"
          >
            <ChevronRight className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          </Button>
        </div>
      </div>
    </div>
  )
}
