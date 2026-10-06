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
import { ArrowUpDown, Barcode, MoreHorizontal, X } from "lucide-react";
import Link from "next/link";
import { UpdateAdjustStatus, handleDelete } from "./_action";
import { toast } from "sonner";
import { Toast } from "@/components/ui/toast";
// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useDispatch, useSelector } from "react-redux";
import {
  setIssueAdjustmentQty,
  setProducts,
  setRcvAdjustmentQty,
  setRcvAdjustmentTotal,
} from "@/app/redux-store/Slice/AdjustSlice";
import { useState } from "react";
import { RootState } from "@/app/redux-store/store";
import StatusUpdatePop from "@/components/StatusUpdatePop";
export type Product = {
  id: string;
  name: string;
  photo: string;
  status: "Active" | "Inactive";
  mrp: number;
  // articleCode: string;
  stock: number;
};

const handleDeleteTigger = async (id: string) => {
  const del = await handleDelete(id);
  if (del) {
    `Offer Delete Successful!`;
    // toast.success(`${del.name} deleted successful!`);
  } else {
  }
};

export const columns: ColumnDef<Product>[] = [
  {
    accessorKey: "no",
    header: "#",
    cell: ({ row }: { row: any }) => {
      const sl = row.index + 1; // row.index gives the zero-based index, add 1 to make it 1-based

      return `${sl}.`;
    },
  },
  {
    accessorKey: "adjustMentNo",
    header: "Adjustment No",
  },
  //   {
  //     accessorKey: "adjustRcvQty",
  //     header: "Adjust Recieve Quantity",
  //   },
  // {
  //   accessorKey: "qty",
  //   header: "Quantity",
  // },
  // {
  //   accessorKey: "mrp",
  //   header: "MRP",
  // },
  {
    accessorKey: "totalItem",
    header: "Total Item",
  },
  {
    accessorKey: "total",
    header: "Total",
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
      const product = row.original;

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
        const updateStatus = await UpdateAdjustStatus(product.id, status);
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
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(product.id)}
              >
                View Details
              </DropdownMenuItem>
              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={() => handleUpdate("Delete")}>
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <StatusUpdatePop
            alertOpen={alertOpen}
            setAlertOpen={setAlertOpen}
            updateStatus={updateStatus}
            model="Adjust"
            operation={status}
          />
        </>
      );
    },
  },
];
