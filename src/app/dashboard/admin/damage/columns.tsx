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
import {
  ArrowUpDown,
  Barcode,
  MoreHorizontal,
  Pencil,
  Printer,
  Trash,
} from "lucide-react";
import Link from "next/link";
import { UpdateDamageStatus, handleDelete } from "./_action";
import { toast } from "sonner";
import { Toast } from "@/components/ui/toast";
// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import Image from "next/image";
import { useState } from "react";
import { DamagePrint } from "@/components/ui/damage-print-pop";
import { useDispatch } from "react-redux";
import { setStatus } from "@/app/redux-store/Slice/DamageSlice";
import StatusUpdatePop from "@/components/StatusUpdatePop";
export type Product = {
  id: string;
  name: string;
  photo: string;
  status: "Active" | "Inactive";
  mrp: number;
  articleCode: string;
  stock: number;
};

const handleDeleteTigger = async (id: string) => {
  // const del = await handleDelete(id);
  const dispatch = useDispatch();
  const del = dispatch(setStatus("Delete"));

  if (del) {
    `Offer Delete Successful!`;
    // toast.success(`${del.name} deleted successful!`);
  } else {
    `Deleted Faild!`;
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
    accessorKey: "damageNo",
    header: "Article Code",
  },
  {
    accessorKey: "warehouse.name",
    header: "Warehouse",
  },
  {
    accessorKey: "totalItem",
    header: "Total Item",
  },
  {
    accessorKey: "total",
    header: "Total",
  },
  {
    accessorKey: "grossTotal",
    header: "Gross Total",
  },
  {
    accessorKey: "status",
    header: "Status",
  },
  // {
  //   accessorKey: "total",
  //   header: "Total",
  // },

  // {
  //   accessorKey: "hsCode",
  //   header: "HS Code",
  // },
  // {
  //   accessorKey: "tax",
  //   header: "Tax",
  // },
  {
    accessorKey: "action",
    header: () => <div className="">Action</div>,
    id: "actions",
    cell: ({ row }) => {
      const damage = row.original;
      const [activate, setActive] = useState(false);
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
        const updateStatus = await UpdateDamageStatus(damage.id, status);
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
              {/* <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(offer.id)}
            >
              View Details
            </DropdownMenuItem> */}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => setActive(true)}
              >
                <>
                  <Printer size={16} className="mr-2" /> View
                </>
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => handleUpdate("Delete")}>
                <Trash size={16} className="mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DamagePrint open={activate} setOpen={setActive} entry={damage} />
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
