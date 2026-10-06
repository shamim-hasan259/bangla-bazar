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
import { UpdateWarehouseStatus, handleDelete } from "./_action";
import { useState } from "react";
import EditUnitSheet from "./editUnitSheet";
import { Toaster } from "@/components/ui/sonner";
import StatusUpdatePop from "@/components/StatusUpdatePop";

export type Offer = {
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

export const columns: ColumnDef<Offer>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "company",
    header: "Company",
  },
  {
    accessorKey: "code",
    header: "Code",
  },

  {
    accessorKey: "address",
    header: "Address",
  },
  {
    accessorKey: "type",
    header: "Type",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "phone",
    header: "Phone",
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
        const updateStatus = await UpdateWarehouseStatus(unit.id, status);
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
              <DropdownMenuItem onClick={() => handleEdit()}>
                Edit
              </DropdownMenuItem>
              {unit.status === "Active" ? (
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
          <EditUnitSheet entry={unit} open={open} setOpen={setOpen} />
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
