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

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Link from "next/link";
import axios from "axios";
import { format } from "date-fns";
// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type User = {
  id: string;
  name: string;
  username: string;
  phone: string;
  status: "AActive" | "Deactive";
  email: string;
  type: string;
};

// const handleDeleteTigger = async (id: string) => {
//   const del = await handleDelete(id);
//   if (del) {
//      (`Offer Delete Successful!`);
//     // toast.success(`${del.name} deleted successful!`);
//   } else {
//      (`Deleted Faild!`);
//   }
// };

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "user.name",
    header: "User",
  },
  {
    accessorKey: "otInvoice",
    header: "Order Invoice ID",
  },
  {
    accessorKey: "module",
    header: "Module",
  },
  {
    accessorKey: "otType",
    header: "Operation Type",
  },
  {
    accessorKey: "createdAt",
    header: "Date",
  },
];
