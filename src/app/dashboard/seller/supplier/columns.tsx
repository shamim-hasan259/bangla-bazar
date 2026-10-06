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
import { Edit, MoreHorizontal, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import Image from "next/image";
import { UpdateSupplierStatus, handleDelete } from "./_action";
import { useState } from "react";
import EditSupplierSheet from "./editSupplierSheet";
import { Toaster } from "sonner";
import StatusUpdatePop from "@/components/StatusUpdatePop";
export type Supplier = {
  id: string;
  name: string;
  phone: string;
  email: number;
  address: string;
  company: string;
  designation: string;
  description: string;
  status: "Active" | "Inactive";
};

const handleDeleteTigger = async (id: string) => {
  const del = await handleDelete(id);
  if (del) {
    `Supplier Delete Successful!`;
    toast.success(`Deleted successful!`);
  } else {
    `Deleted Faild!`;
  }
};

export const columns: ColumnDef<Supplier>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <span className="font-semibold text-slate-900 dark:text-slate-100">
        {row.getValue("name")}
      </span>
    ),
  },
  {
    accessorKey: "phone",
    header: "Phone",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "company",
    header: "Company",
  },
  {
    accessorKey: "country",
    header: "Country",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const isActive = status === "Active";
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
            isActive
              ? "bg-green-50 text-green-700 border border-green-250 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800"
              : "bg-amber-55 text-amber-700 border border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800"
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-green-500" : "bg-amber-500"}`} />
          {status || "Inactive"}
        </span>
      );
    },
  },
  {
    header: () => <div className="text-right">Actions</div>,
    id: "actions",
    cell: ({ row }) => {
      const supplier = row.original;
      const [open, setOpen] = useState(false);
      const handleEdit = () => setOpen(true);
      const [alertOpen, setAlertOpen] = useState(false);
      const [status, setStatus] = useState("");

      // Button Function
      const handleUpdate = (operation: string) => {
        setStatus(operation);
        setAlertOpen(true);
      };

      // Alert Function
      const updateStatus = async () => {
        setAlertOpen(false);
        const updateStatus = await UpdateSupplierStatus(supplier.id, status);
        //@ts-ignore
        if (updateStatus) {
          // tosst successfully updated
          ("success");
        } else {
          // toast successfully failed
          ("failed");
        }
      };

      const isActive = supplier.status === "Active";

      return (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleEdit} className="cursor-pointer flex items-center gap-2">
                <Edit className="h-4 w-4 text-slate-500" />
                <span>Edit</span>
              </DropdownMenuItem>

              <DropdownMenuItem 
                onClick={() => handleUpdate(isActive ? "Inactive" : "Active")}
                className={`cursor-pointer flex items-center gap-2 ${isActive ? "text-amber-600 focus:text-amber-700" : "text-green-600 focus:text-green-700"}`}
              >
                <Trash2 className="h-4 w-4" />
                <span>{isActive ? "Deactivate" : "Activate"}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <EditSupplierSheet open={open} entry={supplier} setOpen={setOpen} />
          <Toaster />
          <StatusUpdatePop
            alertOpen={alertOpen}
            setAlertOpen={setAlertOpen}
            updateStatus={updateStatus}
            model="Supplier"
            operation={status}
          />
        </div>
      );
    },
  },
];
