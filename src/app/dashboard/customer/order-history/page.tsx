"use client";

import React, { useEffect, useState, useCallback, useTransition } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import Link from "next/link";
import Image from "next/image";
import { 
  Search, 
  ArrowRight,
  ShoppingBag,
  Loader2,
  Eye,
  RefreshCw
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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

export default function OrderHistory() {
  const { data: session } = useSession();
  //@ts-ignore
  const userId = session?.user?.id as string | undefined;

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [statusCounts, setStatusCounts] = useState<{ [key: string]: number }>({
    all: 0,
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    canceled: 0,
    return: 0,
  });

  const normalizeStatus = (status?: string): string => {
    if (!status) return "pending";
    const s = status.toLowerCase().trim();
    if (s === "pending" || s === "orderplaced" || s === "ordered") return "pending";
    if (s === "processing") return "processing";
    if (s === "shipped") return "shipped";
    if (s === "delivered" || s === "complete") return "delivered";
    if (s === "canceled" || s === "cancelled" || s === "cancel") return "canceled";
    if (s === "return" || s === "returned") return "return";
    return s;
  };

  // Fetch orders from Database API by status
  const fetchOrdersByStatus = useCallback(async (statusToFetch: string, search = searchQuery) => {
    if (!userId) return;
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (statusToFetch && statusToFetch !== "all") {
        params.status = statusToFetch;
      }
      if (search && search.trim()) {
        params.search = search.trim();
      }

      // Backend API call to database for this status
      const { data } = await axios.get(`/api/orders/${userId}`, { params });
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch orders from database:", error);
    } finally {
      setLoading(false);
    }
  }, [userId, searchQuery]);

  // Fetch overall counts once or on refresh
  const fetchAllStatusCounts = useCallback(async () => {
    if (!userId) return;
    try {
      const { data } = await axios.get(`/api/orders/${userId}`);
      if (Array.isArray(data)) {
        const counts = {
          all: data.length,
          pending: 0,
          processing: 0,
          shipped: 0,
          delivered: 0,
          canceled: 0,
          return: 0,
        };
        data.forEach((o: any) => {
          const norm = normalizeStatus(o.status);
          if (norm in counts) {
            counts[norm as keyof typeof counts] += 1;
          }
        });
        setStatusCounts(counts);
      }
    } catch (e) {
      console.error("Error fetching order counts:", e);
    }
  }, [userId]);

  // Trigger on Mount & user change
  useEffect(() => {
    if (userId) {
      fetchOrdersByStatus(statusFilter, searchQuery);
      fetchAllStatusCounts();
    }
  }, [userId, statusFilter, fetchOrdersByStatus, fetchAllStatusCounts]);

  // Tab change handler - explicitly invokes status query
  const handleTabChange = (tabValue: string) => {
    setStatusFilter(tabValue);
    fetchOrdersByStatus(tabValue, searchQuery);
  };

  // Manual refresh handler
  const handleRefresh = () => {
    fetchOrdersByStatus(statusFilter, searchQuery);
    fetchAllStatusCounts();
  };

  const filterTabs = [
    { label: "All Orders", value: "all", count: statusCounts.all },
    { label: "Pending", value: "pending", count: statusCounts.pending },
    { label: "Processing", value: "processing", count: statusCounts.processing },
    { label: "Shipped", value: "shipped", count: statusCounts.shipped },
    { label: "Delivered", value: "delivered", count: statusCounts.delivered },
    { label: "Cancelled", value: "canceled", count: statusCounts.canceled },
    { label: "Returned", value: "return", count: statusCounts.return },
  ];

  const getStatusBadge = (status: string) => {
    const normalized = normalizeStatus(status);
    switch (normalized) {
      case "pending":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Pending
          </span>
        );
      case "processing":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            Processing
          </span>
        );
      case "shipped":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            Shipped
          </span>
        );
      case "delivered":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Delivered
          </span>
        );
      case "canceled":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            Cancelled
          </span>
        );
      case "return":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
            Returned
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs">
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
    <div className="w-full space-y-6 pb-6">
      {/* Breadcrumb & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1.5 font-medium">
            <span className="hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer">
              &lt; Dashboard
            </span>
            <span>Home</span>
            <span>/</span>
            <span className="text-slate-800 dark:text-slate-200 font-semibold">Customer Dashboard</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Order History
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            View details, track shipments, and request returns for your purchases.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={loading}
          className="h-9 gap-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800 self-start md:self-auto cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-blue-600" : ""}`} />
          Refresh Orders
        </Button>
      </div>

      {/* Filters & Search Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-3.5 md:p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search by Order ID..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              fetchOrdersByStatus(statusFilter, e.target.value);
            }}
            className="pl-10 h-10 w-full bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-blue-500 rounded-xl text-sm"
          />
        </div>

        {/* Horizontal scrollable status filter pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-thin scrollbar-thumb-slate-200">
          {filterTabs.map((tab) => {
            const isActive = statusFilter === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => handleTabChange(tab.value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-sm"
                    : "bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-800"
                }`}
              >
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive
                        ? "bg-white/20 text-white dark:bg-slate-800 dark:text-slate-200"
                        : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders List Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
          <span className="text-sm text-slate-500 mt-3 font-medium">Fetching orders...</span>
        </div>
      ) : orders.length > 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider bg-slate-50/60 dark:bg-slate-950/40">
                  <th className="py-4 px-5">ORDER ID</th>
                  <th className="py-4 px-5">DATE</th>
                  <th className="py-4 px-5">PRODUCTS</th>
                  <th className="py-4 px-5">TOTAL AMOUNT</th>
                  <th className="py-4 px-5">STATUS</th>
                  <th className="py-4 px-5 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {orders.map((order) => {
                  const items = order.soldProducts || order.products || [];
                  const displayDate = new Date(order.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  });
                  const totalQty = items.reduce((acc, item: any) => acc + (item.qty || item.quantity || 1), 0);

                  // Extract first few items to display images
                  const maxThumbnails = 3;
                  const displayItems = items.slice(0, maxThumbnails);
                  const remainingCount = items.length - maxThumbnails;

                  return (
                    <tr 
                      key={order.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-950/30 transition-colors"
                    >
                      {/* Order ID */}
                      <td className="py-4 px-5 font-mono font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                        #{order.invoiceId || order.id.slice(-8)}
                      </td>

                      {/* Date */}
                      <td className="py-4 px-5 font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap text-xs">
                        {displayDate}
                      </td>

                      {/* Products (Inline Images + text) */}
                      <td className="py-4 px-5 max-w-xs md:max-w-md">
                        <div className="flex items-center gap-3">
                          {/* Image Stack */}
                          <div className="flex -space-x-2 overflow-hidden shrink-0">
                            {displayItems.map((item: any, idx: number) => (
                              <div 
                                key={idx} 
                                className="relative h-8 w-8 rounded-full border-2 border-white dark:border-slate-900 overflow-hidden bg-slate-100 shadow-xs"
                              >
                                <Image
                                  src={getProductImage(item.photo)}
                                  alt={item.name || "Product"}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            ))}
                            {remainingCount > 0 && (
                              <div className="flex items-center justify-center h-8 w-8 rounded-full border-2 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-400 shadow-xs">
                                +{remainingCount}
                              </div>
                            )}
                          </div>

                          {/* Name summary */}
                          <span className="text-slate-850 dark:text-slate-200 truncate block max-w-[150px] md:max-w-[220px] font-medium text-xs">
                            {items[0]?.name || "Product Item"}
                            {items.length > 1 && (
                              <span className="text-slate-400 dark:text-slate-500 text-xs font-normal">
                                {" "}(and {totalQty - (items[0]?.qty || items[0]?.quantity || 1)} more)
                              </span>
                            )}
                          </span>
                        </div>
                      </td>

                      {/* Total Amount */}
                      <td className="py-4 px-5 font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                        ৳{(order.grossTotal || order.total || 0).toFixed(2)}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        {getStatusBadge(order.status)}
                      </td>

                      {/* Action */}
                      <td className="py-4 px-5 text-right whitespace-nowrap">
                        <Link href={`/dashboard/customer/order-history/${order.id}`}>
                          <Button 
                            variant="outline" 
                            size="icon"
                            className="h-8 w-8 border-slate-200 dark:border-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 text-slate-600 dark:text-slate-400 rounded-xl cursor-pointer transition-colors shadow-2xs"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs">
          <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-full mb-4">
            <ShoppingBag className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-950 dark:text-slate-100 mb-1">No orders found</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mb-6">
            We couldn't find any orders matching the selected status or search query.
          </p>
          <Link href="/products">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold h-10 px-5 rounded-xl text-xs tracking-wide uppercase shadow-sm cursor-pointer transition-all">
              Start Shopping
              <ArrowRight className="ml-2 h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
