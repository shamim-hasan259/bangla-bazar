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
  BarcodeIcon,
  MoreHorizontal,
  Eye,
  Edit,
} from "lucide-react";
import Link from "next/link";
import { UpdateProductStatus, handleDelete } from "./_action";
import { toast } from "sonner";
import { Toast } from "@/components/ui/toast";
// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import Image from "next/image";
import { useState } from "react";
import { BarCodeAlertDialog } from "@/components/ui/barcode-print-pop";
import StatusUpdatePop from "@/components/StatusUpdatePop";
import { ProductDetailsDialog } from "@/components/ui/product-details";
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
    accessorKey: "barCode",
    header: () => {
      return (
        <div className="flex items-center">
          <Barcode className="h-4 w-4 mr-2" /> BC
        </div>
      );
    },
    cell: ({ row }) => {
      const product = row.original;
      const [open, setOpen] = useState(false);

      return (
        <>
          <BarcodeIcon
            className="cursor-pointer"
            onClick={() => setOpen(true)}
          />
          <BarCodeAlertDialog
            open={open}
            setOpen={setOpen}
            entry={product as any}
          />
        </>
      );
    },
  },
  {
    accessorKey: "photo",
    header: "Photo",
    cell: ({ row }) => {
      const product = row.original;

      const getImagePath = (photo: any) => {
        if (!photo) return "/img/offer-photo.png";

        // Handle array if photo is stored as JSON in DB
        const photoUrl = Array.isArray(photo) ? photo[0] : photo;

        if (typeof photoUrl !== "string" || photoUrl === "") {
          return "/img/offer-photo.png";
        }

        if (
          photoUrl.startsWith("/") ||
          photoUrl.startsWith("http://") ||
          photoUrl.startsWith("https://")
        ) {
          return photoUrl;
        }

        return `/img/${photoUrl}`;
      };

      return (
        <div className="w-1/2 ">
          <AspectRatio ratio={16 / 9}>
            <Image
              src={getImagePath(product.photo)}
              width="300"
              height="150"
              alt="Image"
              className="rounded-md object-cover"
            />
          </AspectRatio>
        </div>
      );
    },
  },
  {
    accessorKey: "articleCode",
    header: "Article Code",
  },
  {
    accessorKey: "ean",
    header: "EAN",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "closingQty",
    header: "Stock",
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
    accessorKey: "mrp",
    header: "MRP",
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
      const [open, setOpen] = useState(false);
      // Button Function
      const handleUpdate = (operation: string) => {
        setStatus(operation);
        setAlertOpen(true);
      };

      // Alert Function
      const updateStatus = async () => {
        setAlertOpen(false);
        const updateStatus = await UpdateProductStatus(product.id, status);
        //@ts-ignore
        if (updateStatus) {
          // tosst successfully updated
          ("success");
          // createUserLogs(updateStatus?.userId, order?.invoiceId, "Sale", "Create");
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
                className="cursor-pointer"
                onClick={() => {
                  navigator.clipboard.writeText(product.id);
                  setOpen(true);
                }}
              >
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/admin/products/${product.id}`} className="flex items-center cursor-pointer w-full">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Link>
              </DropdownMenuItem>
              {product.status === "Active" ? (
                <DropdownMenuItem onClick={() => handleUpdate("Inactive")}>
                  Inactive
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => handleUpdate("Active")}>
                  Active
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <StatusUpdatePop
            alertOpen={alertOpen}
            setAlertOpen={setAlertOpen}
            updateStatus={updateStatus}
            model="Product"
            operation={status}
          />
          <ProductDetailsDialog
            open={open}
            setOpen={setOpen}
            id={product?.id}
          />
        </>
      );
    },
  },
];
