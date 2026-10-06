"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useState } from "react";
import StoreTrackingDialog from "./StoreTrackingDialog";
import { useRouter } from "next/navigation";
import { updateOrderTracking } from "../../../../orders/_action";
import { toast } from "sonner";

export type Order = {
  id: string;
  amount: number;
  status: string;
  email: string;
  trackingCode?: string;
  courierName?: string;
};

export const getStoreColumns = (storeId: string): ColumnDef<Order>[] => [
  {
    accessorKey: "soldProducts",
    header: "Product",
    cell: ({ row }) => {
      const soldProducts = (row.original as any).soldProducts as any[] || [];
      if (!soldProducts.length) return <span className="text-slate-400 dark:text-slate-600">-</span>;
      return (
        <div className="flex flex-col gap-1.5 max-w-[220px]">
          {soldProducts.map((p: any, idx: number) => (
            <div key={idx} className="flex items-center gap-2">
              {p.photo ? (
                <div className="relative w-8 h-8 rounded border overflow-hidden shrink-0">
                  <img src={p.photo} alt={p.name} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-[10px] text-slate-400">
                  No img
                </div>
              )}
              <div className="flex flex-col min-w-0 leading-tight">
                <span className="text-xs font-semibold truncate text-slate-800 dark:text-slate-200" title={p.name}>
                  {p.name}
                </span>
                <span className="text-[10px] text-slate-500">
                  Qty: {p.qty || p.quantity}
                </span>
              </div>
            </div>
          ))}
        </div>
      );
    }
  },
  {
    accessorKey: "grossTotal",
    header: "Total amount",
    cell: ({ row }) => {
      const grossTotal = (row.original as any).grossTotal || (row.original as any).total || 0;
      return <span className="font-semibold text-slate-900 dark:text-slate-100">৳ {grossTotal}</span>;
    }
  },
  {
    accessorKey: "deliveryAddress",
    header: "Delivery Details",
    cell: ({ row }) => {
      const address = (row.original as any).deliveryAddress as any;
      if (!address) return <span className="text-slate-400 dark:text-slate-600">-</span>;
      return (
        <div className="flex flex-col text-xs max-w-[160px] leading-tight">
          <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
            {address.name}
          </span>
          <span className="text-slate-500 truncate" title={`${address.streetAddress}, ${address.city}`}>
            {address.streetAddress ? `${address.streetAddress}, ` : ""}{address.city || ""}
          </span>
        </div>
      );
    }
  },
  {
    accessorKey: "courierName",
    header: "Courier",
    cell: ({ row }) => {
      const order = row.original as any;
      const courier = order.courierName || "Bangla Bazar Express";
      return (
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          {courier}
        </span>
      );
    }
  },
  {
    accessorKey: "trackingCode",
    header: "Tracking ID",
    cell: ({ row }) => {
      const order = row.original as any;
      const tracking = order.trackingCode || (order.invoiceId ? `BB-TRK-${String(order.invoiceId).replace(/[^0-9]/g, "")}` : (order.id ? `BB-TRK-${order.id.slice(-6).toUpperCase()}` : "BB-TRK-849201"));
      return (
        <span className="font-mono text-xs text-blue-600 dark:text-blue-400 font-semibold bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-md">
          {tracking}
        </span>
      );
    }
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status || "Pending";
      return (
        <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-wide ${
          status === "Delivered" || status === "Complete" ? "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400" :
          status === "Processing" || status === "Shipped" ? "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400" :
          status === "Canceled" ? "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400" :
          "bg-blue-100 text-orange-700 dark:bg-orange-950/30 dark:text-blue-400"
        }`}>
          {status}
        </span>
      );
    }
  },
  {
    accessorKey: "action",
    header: () => <div className="">Action</div>,
    id: "actions",
    cell: ({ row }) => {
      const order = row.original;
      const [trackingOpen, setTrackingOpen] = useState(false);
      const router = useRouter();

      const handleStatusChange = async (newStatus: string) => {
        const res = await updateOrderTracking(order.id, order.trackingCode || "", order.courierName || "", newStatus);
        if (res) {
          toast.success(`Order status updated to ${newStatus}`);
          router.refresh();
        } else {
          toast.error("Failed to update order status");
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
            <DropdownMenuContent align="end" className="rounded-2xl border-slate-100 dark:border-slate-800">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(order.id)}
              >
                Copy order ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setTrackingOpen(true)}>
                Update Tracking & Status
              </DropdownMenuItem>
              <Link href={`/dashboard/seller/store-dashboard/${storeId}/orders/${order.id}`}>
                <DropdownMenuItem className="cursor-pointer">View order details</DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs font-bold text-slate-400">Manage Order</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleStatusChange("Pending")} disabled={order.status === "Pending"}>
                Mark as Pending
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange("Processing")} disabled={order.status === "Processing"}>
                Mark as Processing
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange("Shipped")} disabled={order.status === "Shipped"}>
                Mark as Shipped
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange("Delivered")} disabled={order.status === "Delivered" || order.status === "Complete"}>
                Mark as Delivered
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange("Canceled")} disabled={order.status === "Canceled" || order.status === "Cancelled"} className="text-red-600 hover:text-red-750 focus:text-red-700">
                Mark as Cancelled
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange("Return")} disabled={order.status === "Return" || order.status === "Returned"}>
                Mark as Returned
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <StoreTrackingDialog open={trackingOpen} setOpen={setTrackingOpen} order={order} />
        </>
      );
    },
  },
];
