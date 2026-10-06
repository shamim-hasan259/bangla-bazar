"use client";

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
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { handleDelete } from "./_action";
import { useState } from "react";
import EditUnitSheet from "./editUnitSheet";
import { Toaster } from "@/components/ui/sonner";
import React from "react";

export type Unit = {
  id: string;
  name: string;
  status: "Active" | "Inactive";
  code: string;
  description: string;
  symbol: string;
};

const handleDeleteTigger = async (id: string) => {
  const del = await handleDelete(id);
  if (del) {
    `Unit Delete Successful!`;
    toast.success(`Unit Deleted successful!`);
  } else {
    `Deleted Faild!`;
    toast.success(`Unit Deleted Field!`);
  }
};

export const columns: ColumnDef<Unit>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "symbol",
    header: "Symbol",
  },
  {
    accessorKey: "code",
    header: "Code",
  },

  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "action",
    header: () => <div className="">Action</div>,
    id: "actions",
    cell: ({ row }) => {
      const unit = row.original;
      const [open, setOpen] = useState(false);
      const handleEdit = () => setOpen(true);

      return (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleEdit()}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDeleteTigger(unit.id)}>
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <EditUnitSheet entry={unit} open={open} setOpen={setOpen} />
          <Toaster />
        </>
      );
    },
  },
];
