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
import Link from "next/link";
import axios from "axios";
import { toast } from "sonner";
import { Toast } from "@/components/ui/toast";
// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import Image from "next/image";
export type Offer = {
  id: string;
  name: string;
  photo: string;
  status: "active" | "deactive";
  price: number;
  code: string;
  description: string;
};

const handleDeleteTigger = async (id: string) => {
  // const del = await handleDelete(id);
  // if (del) {
  //    (`Offer Delete Successful!`);
  //   // toast.success(`${del.name} deleted successful!`);
  // } else {
  //    (`Deleted Faild!`);
  // }
};

export const columns: ColumnDef<Offer>[] = [
  {
    accessorKey: "photo",
    header: "Photo",
    cell: ({ row }) => {
      const offer = row.original;

      return (
        <>
          <div className="w-1/2 ">
            <AspectRatio ratio={16 / 9}>
              {/* <>{offer.photo}</> */}
              <Image
                src={
                  offer.photo !== ""
                    ? `/img/${offer.photo}`
                    : "/img/offer-photo.png"
                }
                width="300"
                height="150"
                alt="Image"
                className="rounded-md object-cover"
              />
            </AspectRatio>
          </div>
          {/* <Avatar>
          <AvatarImage src={offer.photo !== "" ? `/img/${offer.photo}` : "https://github.com/shadcn.png"} />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar> */}
        </>
      );
    },
  },
  {
    accessorKey: "code",
    header: "Code",
  },
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
      const offer = row.original;

      return (
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
            <DropdownMenuItem>
              <Link href={`/dashboard/offers/${offer.id}`}>Edit</Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDeleteTigger(offer.id)}>
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
