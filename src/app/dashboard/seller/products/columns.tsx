"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  Barcode,
  BarcodeIcon,
  Eye,
  Pencil,
  Trash2,
  ShoppingCart,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";
import { UpdateProductStatus, handleDelete } from "./_action";
import { toast } from "sonner";
import Image from "next/image";
import { useState } from "react";
import { BarCodeAlertDialog } from "@/components/ui/barcode-print-pop";
import StatusUpdatePop from "@/components/StatusUpdatePop";
import { ProductDetailsDialog } from "@/components/ui/product-details";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

export type Product = {
  id: string;
  name: string;
  photo: any;
  status: "Active" | "Inactive" | "Deleted";
  price: number;
  tp?: number;
  mrp?: number;
  articleCode?: string;
  ean?: string;
  stock: number;
  closingQty?: number;
  availableQty?: number;
  salesType?: string;
  website?: string;
  category?: {
    name: string;
  } | null;
  unit?: {
    name: string;
    symbol: string;
  } | null;
};

const handleDeleteTrigger = async (id: string) => {
  const del = await handleDelete(id);
  if (del) {
    toast.success("Product deleted successfully!");
  } else {
    toast.error("Deletion failed!");
  }
};

export const columns: ColumnDef<Product>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px] rounded border-slate-350 dark:border-slate-700"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px] rounded border-slate-350 dark:border-slate-700"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "barCode",
    header: () => {
      return (
        <div className="flex items-center gap-1 text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">
          <Barcode className="h-3.5 w-3.5" /> BC
        </div>
      );
    },
    cell: ({ row }) => {
      const product = row.original;
      const [open, setOpen] = useState(false);

      return (
        <>
          <BarcodeIcon
            className="cursor-pointer text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 w-5 h-5 transition-colors"
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
    header: () => <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">Photo</span>,
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
        <div className="w-10 h-10 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden flex items-center justify-center bg-slate-50 dark:bg-slate-900 shrink-0">
          <Image
            src={getImagePath(product.photo)}
            width={40}
            height={40}
            alt={product.name || "Product"}
            className="object-cover w-full h-full"
          />
        </div>
      );
    },
  },
  {
    accessorKey: "name",
    header: () => <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">Code & Name</span>,
    cell: ({ row }) => {
      const product = row.original;
      return (
        <div className="flex flex-col max-w-[280px]">
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 hover:text-primary transition-colors block truncate">
            {product.name}
          </span>
          <span className="text-xs text-slate-400 font-medium mt-0.5 font-mono">
            {product.articleCode || "No Code"}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "salesType",
    header: () => <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">Type</span>,
    cell: ({ row }) => {
      const product = row.original;
      const type = product.salesType || "standard";
      
      let badgeStyle = "bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-300 border-blue-100 dark:border-blue-900/30";
      if (type.toLowerCase() === "combo") {
        badgeStyle = "bg-purple-50 text-purple-700 dark:bg-purple-950/20 dark:text-purple-300 border-purple-100 dark:border-purple-900/30";
      } else if (type.toLowerCase() === "offer") {
        badgeStyle = "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-300 border-amber-100 dark:border-amber-900/30";
      }

      return (
        <Badge variant="outline" className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize border ${badgeStyle}`}>
          {type.toLowerCase()}
        </Badge>
      );
    },
  },
  {
    accessorKey: "price",
    header: () => <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">Price (Cost / Sales)</span>,
    cell: ({ row }) => {
      const product = row.original;
      return (
        <div className="flex flex-col font-mono text-xs">
          <span className="text-slate-400">
            ৳{product.tp?.toFixed(2) || "0.00"}
          </span>
          <span className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">
            ৳{product.price?.toFixed(2) || "0.00"}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "closingQty",
    header: () => <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">Stock & Unit</span>,
    cell: ({ row }) => {
      const product = row.original;
      const stockVal = product.closingQty ?? product.stock ?? 0;
      const unitSymbol = product.unit?.symbol || "pcs";
      return (
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
            {stockVal}
          </span>
          <span className="text-xs text-slate-400 capitalize">{unitSymbol}</span>
          <span className="text-[10px] bg-slate-50 text-slate-500 dark:bg-slate-900/40 dark:text-slate-400 px-1 py-0.5 rounded font-semibold border border-slate-200/50 dark:border-slate-800/50">
            Tracked
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "website",
    header: () => <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">E-com</span>,
    cell: ({ row }) => {
      const product = row.original;
      const isEcom = product.website === "true";
      return (
        <div className="flex items-center justify-start pl-2">
          <ShoppingCart
            className={`w-4 h-4 transition-colors ${
              isEcom
                ? "text-emerald-500"
                : "text-slate-200 dark:text-slate-800"
            }`}
          />
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: () => <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">Status</span>,
    cell: ({ row }) => {
      const product = row.original;
      const isActive = product.status === "Active";

      return (
        <Badge
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold border transition-all ${
            isActive
              ? "bg-slate-900 text-slate-50 hover:bg-slate-900/90 border-transparent dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-100/90"
              : "bg-transparent text-slate-400 border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-500 dark:hover:bg-slate-900/50"
          }`}
        >
          {product.status}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: () => <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">Actions</span>,
    cell: ({ row }) => {
      const product = row.original;
      const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
      const [restoreAlertOpen, setRestoreAlertOpen] = useState(false);
      const [open, setOpen] = useState(false);
      const router = useRouter();

      const isDeletedStatus = product.status === "Deleted";

      const deleteProduct = async () => {
        setDeleteAlertOpen(false);
        if (isDeletedStatus) {
          // Hard Delete (permanently delete)
          const res = await handleDelete(product.id);
          if (res) {
            toast.success("Product permanently deleted!");
            router.refresh();
          } else {
            toast.error("Failed to permanently delete product.");
          }
        } else {
          // Soft Delete (move to Trash)
          const res = await UpdateProductStatus(product.id, "Deleted");
          if (res) {
            toast.success("Product moved to Trash!");
            router.refresh();
          } else {
            toast.error("Failed to move product to Trash.");
          }
        }
      };

      const restoreProduct = async () => {
        setRestoreAlertOpen(false);
        const res = await UpdateProductStatus(product.id, "Active");
        if (res) {
          toast.success("Product restored successfully!");
          router.refresh();
        } else {
          toast.error("Failed to restore product.");
        }
      };

      return (
        <>
          <div className="flex items-center gap-1">
            {isDeletedStatus ? (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setRestoreAlertOpen(true)}
                  className="h-8 w-8 text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 rounded-lg transition-colors cursor-pointer"
                  title="Restore Product"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setOpen(true)}
                  className="h-8 w-8 text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-lg transition-colors cursor-pointer"
                  title="View Details"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                  className="h-8 w-8 text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-lg transition-colors cursor-pointer"
                  title="Edit Product"
                >
                  <Link href={`/dashboard/seller/products/${product.id}`}>
                    <Pencil className="h-4 w-4" />
                  </Link>
                </Button>
              </>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDeleteAlertOpen(true)}
              className="h-8 w-8 rounded-lg transition-colors cursor-pointer text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
              title={isDeletedStatus ? "Delete Permanently" : "Move to Trash"}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <StatusUpdatePop
            alertOpen={deleteAlertOpen}
            setAlertOpen={setDeleteAlertOpen}
            updateStatus={deleteProduct}
            model="Product"
            operation={isDeletedStatus ? "Delete Permanently" : "Move to Trash"}
          />
          <StatusUpdatePop
            alertOpen={restoreAlertOpen}
            setAlertOpen={setRestoreAlertOpen}
            updateStatus={restoreProduct}
            model="Product"
            operation="Restore"
          />
          <ProductDetailsDialog
            open={open}
            setOpen={setOpen}
            id={product.id}
          />
        </>
      );
    },
  },
];
