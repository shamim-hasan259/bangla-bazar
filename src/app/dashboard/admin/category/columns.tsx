"use client";
import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import EditCategorySheet from "./editCategorySheet";
import { handleDelete } from "./_action";
import { Toaster } from "@/components/ui/sonner";

export type Category = {
  id: string;
  name: string;
  photo: string;
  status: "Active" | "Inactive";
  code: string;
  parent: string;
  description: string;
};

const handleDeleteTigger = async (id: string) => {
  const del = await handleDelete(id);
  if (del) {
    toast.success("Category deleted successfully!");
  } else {
    toast.error("Failed to delete category.");
  }
};

export const columns: ColumnDef<Category>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-slate-100 dark:hover:bg-slate-800 -ml-4 font-semibold text-slate-700 dark:text-slate-300"
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const category = row.original;
      const firstLetter = category.name ? category.name.charAt(0).toUpperCase() : "C";
      return (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center flex-shrink-0 shadow-sm transition-all duration-300 hover:scale-105">
            {category.photo ? (
              <img
                src={category.photo}
                alt={category.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-sm font-bold text-slate-500 dark:text-slate-400">{firstLetter}</span>
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-slate-800 dark:text-slate-200">{category.name}</span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">ID: {category.id.slice(-6)}</span>
          </div>
        </div>
      );
    },
  },

  {
    accessorKey: "parent",
    header: "Parent",
    cell: ({ row }) => {
      const category = row.original;
      //@ts-ignore
      const parentName = category.parent?.name;
      const isSelf = category.name === parentName || (category as any).parentId === category.id;

      return parentName && !isSelf ? (
        <span className="text-xs bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2.5 py-0.5 rounded-full font-medium border border-blue-500/20">
          {parentName}
        </span>
      ) : (
        <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
          Main Category
        </span>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      return status === "Active" ? (
        <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full text-xs font-semibold shadow-[0_0_8px_rgba(16,185,129,0.05)]">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Active
        </span>
      ) : (
        <span className="inline-flex items-center gap-1.5 bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20 px-2.5 py-0.5 rounded-full text-xs font-semibold">
          <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
          Inactive
        </span>
      );
    },
  },
  {
    accessorKey: "action",
    header: () => <div className="text-right pr-4 font-semibold text-slate-700 dark:text-slate-300">Actions</div>,
    id: "actions",
    cell: ({ row }) => {
      const category = row.original;
      const [open, setOpen] = useState(false);
      const handleEdit = () => setOpen(true);

      return (
        <div className="text-right pr-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4 text-slate-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl border-slate-200/80 dark:border-slate-800/80 shadow-md">
              <DropdownMenuLabel className="text-slate-500 font-semibold text-[10px] uppercase tracking-wider px-3 py-1.5">Category Actions</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
              <DropdownMenuItem onClick={() => handleEdit()} className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <Edit className="h-4 w-4 text-slate-500" />
                <span className="text-slate-700 dark:text-slate-300 font-medium">Edit details</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDeleteTigger(category.id)} className="flex items-center gap-2 text-rose-600 focus:text-rose-600 cursor-pointer px-3 py-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors">
                <Trash2 className="h-4 w-4" />
                <span className="font-medium">Delete category</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <EditCategorySheet entry={category} open={open} setOpen={setOpen} />
          <Toaster />
        </div>
      );
    },
  },
];
