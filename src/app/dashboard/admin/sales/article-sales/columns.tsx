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
  Check,
  Eye,
  MoreHorizontal,
  Pencil,
  Printer,
  Trash,
  Undo2,
  X,
} from "lucide-react";
import { useState } from "react";
import { SalePrintLog } from "@/components/ui/sell-print-pop";
import { TaxInvoicePrint } from "@/components/ui/govt-format-invoice-sale";

import StatusUpdatePop from "@/components/StatusUpdatePop";
import { useDispatch } from "react-redux";
import { setSalesForUpdate } from "@/app/redux-store/Slice/SalesSlice";
import { useRouter } from "next/navigation";
import Link from "next/link";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Order = {
  id: string;
  customerID: string;
  status: "Complete" | "Ordered" | "Delete";
  userID: string;
  offerID: string;
  Offer: string;
  Customer: string;
  Phone: string;
  amount: number;
  date: string;
};

export const columns: ColumnDef<Order>[] = [
  {
    accessorKey: "no",
    header: "#",
    cell: ({ row }: { row: any }) => {
      const sl = row.index + 1; // row.index gives the zero-based index, add 1 to make it 1-based

      return `${sl}.`;
    },
  },
  // {
  //   accessorKey: "invoiceId",
  //   header: "Invoice ID",
  // },
  {
    accessorKey: "articleCode",
    header: "Article Code",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "price",
    header: "Price",
  },
  
  {
    accessorKey: "tp",
    header: "TP",
  },

  {
    accessorKey: "totalQty",
    header: "Total Quantity",
  },
  {
    accessorKey: "total",
    header: "Total",
  },
  // {
  //   accessorKey: "total",
  //   header: "Total",
  //   cell: ({ row }) => {
  //     const total = row.original?.total;
  //     return total.toFixed(2);
  //   },
  // },
];
