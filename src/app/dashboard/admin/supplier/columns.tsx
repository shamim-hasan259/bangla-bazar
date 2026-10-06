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
import Link from "next/link";
import { toast } from "sonner";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import Image from "next/image";
import { UpdateSupplierStatus, handleDelete } from "./_action";
import { useState } from "react";
import EditSupplierSheet from "./editSupplierSheet";
import { Toaster } from "@/components/ui/toaster";
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
  },
  {
    accessorKey: "action",
    header: () => <div className="">Action</div>,
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
              <DropdownMenuItem onClick={handleEdit}>Edit</DropdownMenuItem>

              {supplier.status === "Active" ? (
                <DropdownMenuItem onClick={() => handleUpdate("Inactive")}>
                  Inactive
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => handleUpdate("Active")}>
                  Active
                </DropdownMenuItem>
              )}
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
        </>
      );
    },
  },
];
