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
export type Inventory = {
  id: string;
  name: string;
  photo: string;
  status: "active" | "deactive";
  price: number;
  code: string;
  description: string;
  openingQty: number;
  grnQty: number;
  returnQty: number;
  rcvAdjustQty: number;
  availableQty: number;
  soldQty: number;
  tpnQty: number;
  damageQty: number;
  rtvQty: number;
  issueAdjustQty: number;
  closingQty: number;
};

const handleDeleteTigger = async (id: string) => {};

export const columns: ColumnDef<Inventory>[] = [
  // {
  //   accessorKey: "photo",
  //   header: "Photo",
  //   cell: ({ row }) => {
  //     const Inventory = row.original;

  //     return (
  //       <>
  //         <div className="w-1/2 ">
  //           <AspectRatio ratio={16 / 9}>
  //             {/* <>{Inventory.photo}</> */}
  //             <Image
  //               src={
  //                 Inventory.photo !== ""
  //                   ? `/img/${Inventory.photo}`
  //                   : "/img/Inventory-photo.png"
  //               }
  //               width="300"
  //               height="150"
  //               alt="Image"
  //               className="rounded-md object-cover"
  //             />
  //           </AspectRatio>
  //         </div>
  //         {/* <Avatar>
  //         <AvatarImage src={Inventory.photo !== "" ? `/img/${Inventory.photo}` : "https://github.com/shadcn.png"} />
  //         <AvatarFallback>CN</AvatarFallback>
  //       </Avatar> */}
  //       </>
  //     );
  //   },
  // },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "articleCode",
    header: "Code",
  },
  {
    accessorKey: "unit",
    header: "Unit",
  },

  {
    accessorKey: "openingQty",
    header: "Opening Quantity",
  },

  {
    accessorKey: "grnQty",
    header: "GRN",
  },
  {
    accessorKey: "returnQty",
    header: "Return",
  },
  {
    accessorKey: "rcvAdjustQty",
    header: "Receive Adjustment",
  },
  {
    accessorKey: "availableQty",
    header: "Avavaialble Quantity",
  },
  {
    accessorKey: "soldQty",
    header: "Sold",
  },
  {
    accessorKey: "tpnQty",
    header: "TPN",
  },
  {
    accessorKey: "damageQty",
    header: "Damage",
  },
  {
    accessorKey: "rtvQty",
    header: "RTV",
  },
  {
    accessorKey: "issueAdjustQty",
    header: "Issue Adjust",
  },
  {
    accessorKey: "closingQty",
    header: "Closing Quantity",
  },
  // {
  //   accessorKey: "action",
  //   header: () => <div className="">Action</div>,
  //   id: "actions",
  //   cell: ({ row }) => {
  //     const Inventory = row.original;

  //     return (
  //       <DropdownMenu>
  //         <DropdownMenuTrigger asChild>
  //           <Button variant="ghost" className="h-8 w-8 p-0">
  //             <span className="sr-only">Open menu</span>
  //             <MoreHorizontal className="h-4 w-4" />
  //           </Button>
  //         </DropdownMenuTrigger>
  //         <DropdownMenuContent align="end">
  //           <DropdownMenuLabel>Actions</DropdownMenuLabel>
  //           {/* <DropdownMenuItem
  //             onClick={() => navigator.clipboard.writeText(Inventory.id)}
  //           >
  //             View Details
  //           </DropdownMenuItem> */}
  //           <DropdownMenuSeparator />
  //           <DropdownMenuItem>
  //             <Link href={`/dashboard/Inventorys/${Inventory.id}`}>Edit</Link>
  //           </DropdownMenuItem>
  //           <DropdownMenuItem onClick={() => handleDeleteTigger(Inventory.id)}>
  //             Delete
  //           </DropdownMenuItem>
  //         </DropdownMenuContent>
  //       </DropdownMenu>
  //     );
  //   },
  // },
];
