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
import { handleDelete } from "../_action";
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
    accessorKey: "articleCode",
    header: "Article Code",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  // {
  //   accessorKey: "qty",
  //   header: "Quantity",
  // },
  // {
  //   accessorKey: "mrp",
  //   header: "MRP",
  // },
  {
    accessorKey: "tp",
    header: "Price",
  },
  {
    accessorKey: "qty",
    header: "Quantity",
    cell: ({ row, table }) => {
      const product = row.original;
      const dispatch = useDispatch();
      const adjustData = useSelector((state: RootState) => state.adjust);
      const handleQtyChange = (e: number) => {
        const exist = adjustData.products.find(
          (adjustProduct: any) => adjustProduct.id === product.id
        );
        const rest = adjustData.products.filter(
          (adjustProduct: any) => adjustProduct.id !== product.id
        );
        let newProduct;
        if (exist) {
          // inrease qty

          newProduct = {
            ...exist,
            //@ts-ignore
            qty: e.target.value,
            //@ts-ignore
            total: parseInt(e.target.value) * exist.tp,
          };
          dispatch(setProducts(rest));
          localStorage.setItem(
            "purchase_cart",
            JSON.stringify([...rest, newProduct])
          );
          dispatch(setProducts([...rest, newProduct]));
        } else {
        }
      };

      return (
        <input
          type="number"
          //@ts-ignore
          value={product?.qty}
          //@ts-ignore
          onChange={handleQtyChange}
          className="w-full border rounded p-1"
        />
      );
    },
  },
  {
    accessorKey: "total",
    header: "Total",
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const product = row.original;
      const dispatch = useDispatch();
      const adjustData = useSelector((state: RootState) => state.adjust);
      const handleSelectChange = (value: string) => {
        const exist = adjustData.products.find(
          (adjustProduct: any) => adjustProduct.id === product.id
        );
        const rest = adjustData.products.filter(
          (adjustProduct: any) => adjustProduct.id !== product.id
        );
        let newProduct;
        if (exist) {
          newProduct = {
            ...exist,
            type: value,
          };
        } else {
          newProduct = {
            ...product,
            type: value,
          };
        }
        const updatedProducts = [...rest, newProduct];
        localStorage.setItem("purchase_cart", JSON.stringify(updatedProducts));
        dispatch(setProducts(updatedProducts));
      };
      return (
        <Select onValueChange={handleSelectChange}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="in">In</SelectItem>
              <SelectItem value="out">Out</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      );
    },
  },
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
    header: () => <div className="">Note</div>,
    id: "actions",
    cell: ({ row }) => {
      const product = row.original;

      return (
        <div className="h-10 overflow-hidden">
          <Textarea className="h-8 mt-[-4]" />{" "}
          {/* Adjust height and margin using Tailwind CSS classes */}
        </div>
      );
    },
  },
  {
    accessorKey: "action",
    header: () => <div className="">Action</div>,
    id: "actions",
    cell: ({ row }) => {
      const product = row.original;

      return <X className="mr-2 h-4 w-4" />;
    },
  },
];
