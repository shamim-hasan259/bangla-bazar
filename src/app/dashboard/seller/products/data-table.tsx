"use client";

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
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  ChevronDown,
  SlidersHorizontal,
  MoreVertical,
} from "lucide-react";
import { toast } from "sonner";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function ProductDataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: 10,
      },
    },
  });

  const handleTypeFilter = (val: string) => {
    setSelectedType(val);
    if (val === "all") {
      table.getColumn("salesType")?.setFilterValue(undefined);
    } else {
      table.getColumn("salesType")?.setFilterValue(val);
    }
  };

  const handleBulkActivate = () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    if (selectedRows.length === 0) {
      toast.warning("No rows selected");
      return;
    }
    toast.success(`Activated ${selectedRows.length} items`);
    table.resetRowSelection();
  };

  const handleBulkDeactivate = () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    if (selectedRows.length === 0) {
      toast.warning("No rows selected");
      return;
    }
    toast.success(`Deactivated ${selectedRows.length} items`);
    table.resetRowSelection();
  };

  const handleBulkDelete = () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    if (selectedRows.length === 0) {
      toast.warning("No rows selected");
      return;
    }
    toast.success(`Deleted ${selectedRows.length} items`);
    table.resetRowSelection();
  };

  return (
    <div className="w-full space-y-4">
      {/* Search and Filters Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          {/* Search Bar */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search items..."
              value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
              onChange={(event) =>
                table.getColumn("name")?.setFilterValue(event.target.value)
              }
              className="pl-9 h-9 text-xs border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 w-full focus-visible:ring-1 focus-visible:ring-slate-400"
            />
          </div>

          {/* Type Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-3 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-355 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-850"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 opacity-80" />
                <span className="capitalize">
                  {selectedType === "all" ? "All Types" : selectedType}
                </span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-40 z-50">
              <DropdownMenuItem onClick={() => handleTypeFilter("all")} className="text-xs cursor-pointer">
                All Types
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleTypeFilter("standard")} className="text-xs cursor-pointer">
                Standard
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleTypeFilter("combo")} className="text-xs cursor-pointer">
                Combo
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleTypeFilter("offer")} className="text-xs cursor-pointer">
                Offer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Bulk Actions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-3 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-355 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-850"
              >
                <MoreVertical className="w-3.5 h-3.5 opacity-80" />
                <span>Bulk Actions</span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48 z-50">
              <DropdownMenuItem onClick={handleBulkActivate} className="text-xs cursor-pointer">
                Mark as Active
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleBulkDeactivate} className="text-xs cursor-pointer">
                Mark as Inactive
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleBulkDelete}
                className="text-xs cursor-pointer text-red-655 focus:text-red-655 focus:bg-red-50 dark:focus:bg-red-950/20"
              >
                Delete Selected
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table Section */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden shadow-xs">
        <Table>
          <TableHeader className="bg-slate-50/50 dark:bg-slate-900/40">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-b border-slate-200 dark:border-slate-800">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="h-10 text-slate-500 dark:text-slate-400">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
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
                  className="border-b border-slate-100 dark:border-slate-900 hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-2.5">
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
                  colSpan={columns.length}
                  className="h-32 text-center text-xs text-slate-400 font-medium"
                >
                  No items found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between py-2 mt-2">
        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Showing {table.getRowModel().rows.length} of {table.getFilteredRowModel().rows.length} items
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="h-8 text-xs px-3 rounded-lg border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
          >
            Prev
          </Button>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium px-2">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="h-8 text-xs px-3 rounded-lg border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
