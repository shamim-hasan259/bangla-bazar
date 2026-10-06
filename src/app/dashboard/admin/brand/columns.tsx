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
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import axios from "axios";
import { toast } from "sonner";
import { Toast } from "@/components/ui/toast";
// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import Image from "next/image";
import { handleDelete } from "./_action";
import EditBrandSheet from "./editBrandSheet";
export type Brand = {
  id: string;
  name: string;
  logo: string;
  status: "active" | "deactive";
  code: number;
  description: string;
};

const handleDeleteTigger = async (id: string) => {
  const del = await handleDelete(id);
  if (del) {
    `Brand Delete Successful!`;
    toast.success(`Deleted successful!`);
  } else {
    `Deleted Faild!`;
  }
};

export const columns: ColumnDef<Brand>[] = [
  {
    accessorKey: "logo",
    header: "Logo",
    cell: ({ row }) => {
      const brand = row.original;

      return (
        <>
          <div className="w-1/2 ">
            <AspectRatio ratio={16 / 9}>
              {/* <>{brand.photo}</> */}
              <Image
                src={
                  brand.logo !== ""
                    ? `/img/${brand.logo}`
                    : "/img/offer-photo.png"
                }
                width="300"
                height="150"
                alt="Image"
                className="rounded-md object-cover"
              />
            </AspectRatio>
          </div>
        </>
      );
    },
  },
  // {
  //   accessorKey: "code",
  //   header: "Code",
  // },

  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "description",
    header: "Description",
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
      const brand = row.original;
      const [open, setOpen] = useState(false);
      const handleEdit = () => setOpen(true);
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
              onClick={() => navigator.clipboard.writeText(brand.id)}
            >
              View Details
            </DropdownMenuItem> */}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleEdit()}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDeleteTigger(brand.id)}>
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <EditBrandSheet open={open} setOpen={setOpen} entry={brand as any} />
        </>
      );
    },
  },
];
