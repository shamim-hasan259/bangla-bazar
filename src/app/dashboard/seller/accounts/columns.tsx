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
import { ArrowUpDown, MoreHorizontal, Printer } from "lucide-react";
import Link from "next/link";
import { handleDelete } from "./_action";
import { toast } from "sonner";
import { Toast } from "@/components/ui/toast";
// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import Image from "next/image";
import { format } from "date-fns";
import { useState } from "react";
import { TransactionPrint } from "@/components/ui/transaction-print-pop";
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
  const del = await handleDelete(id);
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
    accessorKey: "transactionId",
    header: "Transaction ID",
  },
  {
    accessorKey: "name",
    header: "Responsible Person",
  },
  {
    accessorKey: "amount",
    header: "Amount",
  },
  {
    accessorKey: "type",
    header: "Tranasaction Type",
  },
  {
    accessorKey: "date",
    header: "Payment Date",
    cell: ({row})=>{
      const accounts = row.original;
      return format(accounts?.date, "dd/MM/yyyy")
      
    }
  },
  {
    accessorKey: "action",
    header: () => <div className="">Action</div>,
    id: "actions",
    cell: ({ row }) => {
      const transacation = row.original;
      const [activate, setActive] = useState(false);
      
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
                className="cursor-pointer"
                onClick={() => setActive(true)}
              >
                <Printer size={16} className="mr-2" /> Invoice
              </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(transacation.id)}
            >
              View Details
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {/* <DropdownMenuItem>
              <Link href={`/dashboard/offers/${offer.id}`}>Edit</Link>
            </DropdownMenuItem> */}
            <DropdownMenuItem onClick={() => handleDeleteTigger(transacation.id)}>
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <TransactionPrint open={activate} setOpen={setActive} entry={transacation} />
        </>
      );
    },
  },
];
