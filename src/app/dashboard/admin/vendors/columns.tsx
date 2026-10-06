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
import { UpdateVendorStatus, handleDelete } from "./_action";
import { useState } from "react";
import EditVendorSheet from "./editVendorSheet";
import { Toaster } from "@/components/ui/toaster";
import StatusUpdatePop from "@/components/StatusUpdatePop";
export type Vendor = {
  id: string;
  name: string;
  phone: string;
  email: number;
  address: string;
  country: string;
  district: string;
  division: string;
  commissionRate: number;
  status: "Active" | "Inactive";
};

const handleDeleteTigger = async (id: string) => {
  const del = await handleDelete(id);
  if (del) {
    `Vendor Delete Successful!`;
    toast.success(`Deleted successful!`);
  } else {
    `Deleted Faild!`;
  }
};

export const columns: ColumnDef<Vendor>[] = [
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
    accessorKey: "commissionRate",
    header: "Commission (%)",
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
      const seller = row.original;
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
        const updateStatus = await UpdateVendorStatus(seller.id, status);
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

              {seller.status === "Active" ? (
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
          <EditVendorSheet open={open} entry={seller} setOpen={setOpen} />
          <Toaster />
          <StatusUpdatePop
            alertOpen={alertOpen}
            setAlertOpen={setAlertOpen}
            updateStatus={updateStatus}
            model="Vendor"
            operation={status}
          />
        </>
      );
    },
  },
];
