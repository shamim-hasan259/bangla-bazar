"use client";

import React, { useEffect, useState } from "react";
import { Card, CardTitle, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import { useSession } from "next-auth/react";
import { Eye, ArrowUpRight } from "lucide-react";

interface SoldProduct {
  productId: string;
  quantity?: number;
  qty?: number;
  name: string;
  price: number;
  total: number;
  photo?: string;
}

interface Order {
  id: string;
  invoiceId: string;
  createdAt: string;
  status: string;
  total: number;
  grossTotal: number;
  soldProducts?: SoldProduct[];
  products?: any[];
}

const RecentOrderHistory: React.FC = () => {
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const { data: session } = useSession();
  //@ts-ignore
  const userId = session?.user?.id as string | undefined;

  const getOrderHistory = async () => {
    try {
      const { data } = await axios.get(`/api/orders/${userId}`);
      // Show only top 5 recent orders on dashboard
      setRecentOrders(data.slice(0, 5));
    } catch (error) {
      console.error("Failed to fetch order history:", error);
    }
  };

  useEffect(() => {
    if (userId) {
      getOrderHistory();
    }
  }, [userId]);

  const getStatusBadge = (status: string) => {
    const normalized = status.toLowerCase();
    switch (normalized) {
      case "pending":
      case "orderplaced":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Pending
          </span>
        );
      case "processing":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            Processing
          </span>
        );
      case "shipped":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            Shipped
          </span>
        );
      case "delivered":
      case "complete":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            Delivered
          </span>
        );
      case "canceled":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            Cancelled
          </span>
        );
      case "return":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
            Returned
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            {status}
          </span>
        );
    }
  };

  const getProductImage = (photo: any) => {
    if (!photo) return "/placeholder-product.png";
    if (Array.isArray(photo) && photo.length > 0) {
      return photo[0] || "/placeholder-product.png";
    }
    if (typeof photo === 'string' && photo.trim() !== '') {
      return photo;
    }
    return "/placeholder-product.png";
  };

  return (
    <Card className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs overflow-hidden pb-0 rounded-2xl">
      <CardHeader className="border-b border-slate-50 dark:border-slate-850/60 pb-3 flex flex-row items-center justify-between space-y-0 px-5">
        <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
          Recent Order History
        </CardTitle>
        <Link 
          href="/dashboard/customer/order-history"
          className="text-xs font-bold text-[#1E60ED] hover:underline flex items-center gap-1 transition-colors group"
        >
          View All
          <ArrowUpRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </Link>
      </CardHeader>
      
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-850 text-[11px] font-semibold text-slate-400 dark:text-slate-505 uppercase tracking-wider bg-slate-50/30 dark:bg-slate-950/10">
              <th className="py-3 px-5">Order ID</th>
              <th className="py-3 px-5">Date</th>
              <th className="py-3 px-5">Products</th>
              <th className="py-3 px-5">Total</th>
              <th className="py-3 px-5">Status</th>
              <th className="py-3 px-5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-xs">
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => {
                const items = order.soldProducts || order.products || [];
                const displayDate = new Date(order.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                });
                const totalQty = items.reduce((acc, item: any) => acc + (item.qty || item.quantity || 1), 0);

                const maxThumbnails = 3;
                const displayItems = items.slice(0, maxThumbnails);
                const remainingCount = items.length - maxThumbnails;

                return (
                  <tr 
                    key={order.id}
                    className="hover:bg-slate-50/40 dark:hover:bg-slate-950/10 transition-colors"
                  >
                    {/* Order ID */}
                    <td className="py-3.5 px-5 font-mono font-bold text-slate-850 dark:text-slate-200">
                      #{order.invoiceId || order.id.slice(-8)}
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-5 font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {displayDate}
                    </td>

                    {/* Products (Thumbnail Stacks + Name) */}
                    <td className="py-3.5 px-5 max-w-xs">
                      <div className="flex items-center gap-2">
                        {/* Images Stack */}
                        <div className="flex -space-x-1.5 overflow-hidden shrink-0">
                          {displayItems.map((item: any, idx: number) => (
                            <div 
                              key={idx} 
                              className="relative h-6 w-6 rounded-full border border-white dark:border-slate-900 overflow-hidden bg-slate-50 shadow-xs"
                            >
                              <Image
                                src={getProductImage(item.photo)}
                                alt={item.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ))}
                          {remainingCount > 0 && (
                            <div className="flex items-center justify-center h-6 w-6 rounded-full border border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 text-[9px] font-bold text-slate-600 dark:text-slate-450 shadow-xs">
                              +{remainingCount}
                            </div>
                          )}
                        </div>

                        {/* Text description */}
                        <span className="text-slate-850 dark:text-slate-300 truncate max-w-[110px] block font-medium">
                          {items[0]?.name || "Product"}
                          {items.length > 1 && (
                            <span className="text-slate-405 dark:text-slate-505 font-normal text-[10px]">
                              {" "}(and {totalQty - (items[0]?.qty || items[0]?.quantity || 1)} more)
                            </span>
                          )}
                        </span>
                      </div>
                    </td>

                    {/* Total */}
                    <td className="py-3.5 px-5 font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                      ৳{(order.grossTotal || order.total || 0).toFixed(2)}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      {getStatusBadge(order.status)}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-5 text-right whitespace-nowrap">
                      <Link href={`/dashboard/customer/order-history/${order.id}`}>
                        <Button 
                          variant="outline" 
                          size="icon"
                          className="h-7 w-7 border-[#1E60ED]/30 text-[#1E60ED] hover:bg-[#1E60ED]/5 rounded-md cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="py-8 text-center text-xs text-slate-400 dark:text-slate-550 italic">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default RecentOrderHistory;
