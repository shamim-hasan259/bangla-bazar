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
import { Edit, MoreHorizontal, Trash2 } from "lucide-react";
import { handleDelete, UpdateCustomerStatus } from "./_action";
import EditCustomerSheet from "./editCustomerSheet";
import { Toaster } from "sonner";
import StatusUpdatePop from "@/components/StatusUpdatePop";

export type Customer = {
  id: string;
  customerId: string;
  name: string;
  phone: string;
  status: "Active" | "Inactive";
  email: string;
  attend: boolean;
  address?: any;
};

export const columns: ColumnDef<Customer>[] = [
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
    accessorKey: "customerId",
    header: "Customer ID",
    cell: ({ row }) => (
      <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-600 dark:text-slate-400">
        #{row.getValue("customerId")}
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
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => (
      <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-100 dark:border-slate-800">
        {row.getValue("type") || "Wholesale"}
      </span>
    ),
  },
  {
    accessorKey: "address",
    header: "Address",
    id: "address",
    cell: ({ row }) => {
      const addresses = row.getValue("address") as any;
      if (Array.isArray(addresses) && addresses.length > 0) {
        const first = addresses[0];
        const display = `${first.streetAddress || ""}, ${first.city || ""}`.trim().replace(/^,|,$/g, "");
        return (
          <span className="truncate max-w-[150px] block font-normal text-slate-500" title={display}>
            {display || "No details"}
          </span>
        );
      }
      return <span className="text-slate-400 dark:text-slate-600 italic">No Address</span>;
    },
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
      const customer = row.original;
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
        const updateStatus = await UpdateCustomerStatus(customer.id, status);
        //@ts-ignore
        if (updateStatus) {
          // tosst successfully updated
          ("success");
        } else {
          // toast successfully failed
          ("failed");
        }
      };

      const isActive = customer.status === "Active";

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
              <DropdownMenuItem onClick={() => handleEdit()} className="cursor-pointer flex items-center gap-2">
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
          <EditCustomerSheet entry={customer} open={open} setOpen={setOpen} />
          <Toaster />
          <StatusUpdatePop
            alertOpen={alertOpen}
            setAlertOpen={setAlertOpen}
            updateStatus={updateStatus}
            model="Customer"
            operation={status}
          />
        </div>
      );
    },
  },
];
