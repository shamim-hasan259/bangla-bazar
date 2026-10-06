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
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { UpdatePayoutStatus } from "./_action";
import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import StatusUpdatePop from "@/components/StatusUpdatePop";

export type Payout = {
  id: string;
  amount: number;
  paymentMethod: string;
  accountDetails: string;
  status: "Pending" | "Processing" | "Completed" | "Rejected";
  seller: {
    name: string;
    phone: string;
  };
};

export const columns: ColumnDef<Payout>[] = [
  {
    accessorKey: "seller.name",
    header: "Vendor Name",
  },
  {
    accessorKey: "amount",
    header: "Amount (৳)",
  },
  {
    accessorKey: "paymentMethod",
    header: "Method",
  },
  {
    accessorKey: "accountDetails",
    header: "Account Details",
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
      const payout = row.original;
      const [alertOpen, setAlertOpen] = useState(false);
      const [status, setStatus] = useState("");

      const handleUpdate = (operation: string) => {
        setStatus(operation);
        setAlertOpen(true);
      };

      const updateStatus = async () => {
        setAlertOpen(false);
        const update = await UpdatePayoutStatus(payout.id, status, payout.seller.id, payout.amount);
        if (update) {
          toast.success(`Status updated to ${status}`);
        } else {
          toast.error("Status update failed");
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
              <DropdownMenuItem onClick={() => handleUpdate("Processing")}>Mark Processing</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleUpdate("Completed")}>Mark Completed</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleUpdate("Rejected")}>Mark Rejected</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Toaster />
          <StatusUpdatePop
            alertOpen={alertOpen}
            setAlertOpen={setAlertOpen}
            updateStatus={updateStatus}
            model="Payout"
            operation={status}
          />
        </>
      );
    },
  },
];
