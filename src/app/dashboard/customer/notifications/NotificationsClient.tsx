"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Inbox,
  CheckCircle2,
  Loader2,
  ArrowRight,
  Bell,
  RefreshCw,
  Trash2,
  Package,
  Truck,
  RotateCcw,
  Wallet,
  Tag,
  Heart,
  Store,
  SlidersHorizontal,
  ShieldCheck,
  Search,
  Check,
  ExternalLink,
  Sparkles,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";

export interface NotificationItem {
  id: string;
  userId: string;
  userType: string;
  title: string;
  message: string;
  category?: string | null;
  link?: string | null;
  type?: string | null;
  isRead: boolean;
  metadata?: any;
  createdAt: string | Date;
}

interface NotificationsClientProps {
  initialNotifications: NotificationItem[];
  customerId: string;
}

type CategoryType =
  | "all"
  | "Order"
  | "Delivery"
  | "ReturnRefund"
  | "Wallet"
  | "VoucherOffer"
  | "Wishlist"
  | "StoreSeller"
  | "System"
  | "Security";

const CATEGORIES_CONFIG: {
  id: CategoryType;
  label: string;
  labelBn: string;
  icon: any;
  color: string;
  badgeBg: string;
}[] = [
  { id: "all", label: "All", labelBn: "সবগুলো", icon: Bell, color: "text-blue-600", badgeBg: "bg-blue-50 text-blue-700 border-blue-200" },
  { id: "Order", label: "Order", labelBn: "অর্ডার", icon: Package, color: "text-indigo-600", badgeBg: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  { id: "Delivery", label: "Delivery", labelBn: "ডেলিভারি", icon: Truck, color: "text-emerald-600", badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { id: "ReturnRefund", label: "Return & Refund", labelBn: "রিটার্ন ও রিফান্ড", icon: RotateCcw, color: "text-amber-600", badgeBg: "bg-amber-50 text-amber-700 border-amber-200" },
  { id: "Wallet", label: "Wallet", labelBn: "ওয়ালেট", icon: Wallet, color: "text-cyan-600", badgeBg: "bg-cyan-50 text-cyan-700 border-cyan-200" },
  { id: "VoucherOffer", label: "Vouchers & Offers", labelBn: "ভাউচার ও অফার", icon: Tag, color: "text-purple-600", badgeBg: "bg-purple-50 text-purple-700 border-purple-200" },
  { id: "Wishlist", label: "Wishlist", labelBn: "উইশলিস্ট", icon: Heart, color: "text-rose-600", badgeBg: "bg-rose-50 text-rose-700 border-rose-200" },
  { id: "StoreSeller", label: "Store & Seller", labelBn: "স্টোর / সেলার", icon: Store, color: "text-teal-600", badgeBg: "bg-teal-50 text-teal-700 border-teal-200" },
  { id: "System", label: "System", labelBn: "সিস্টেম", icon: SlidersHorizontal, color: "text-slate-600", badgeBg: "bg-slate-100 text-slate-700 border-slate-200" },
  { id: "Security", label: "Security", labelBn: "সিকিউরিটি", icon: ShieldCheck, color: "text-red-600", badgeBg: "bg-red-50 text-red-700 border-red-200" },
];

export default function NotificationsClient({
  initialNotifications,
  customerId,
}: NotificationsClientProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "unread" | "read">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [loadingAll, setLoadingAll] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  // Fetch notifications from API
  const fetchNotificationsFromAPI = async (showToast = false) => {
    try {
      setIsRefreshing(true);
      const res = await fetch("/api/customer/notifications", {
        method: "GET",
        cache: "no-store",
      });

      if (!res.ok) throw new Error("Failed to load notifications");

      const data = await res.json();
      if (data.success && Array.isArray(data.notifications)) {
        setNotifications(data.notifications);
        if (showToast) {
          toast.success("Notifications updated");
        }
      }
    } catch (err: any) {
      console.error("API error:", err);
      if (showToast) {
        toast.error("Failed to load notifications from server");
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotificationsFromAPI();
    const interval = setInterval(() => {
      if (typeof document !== "undefined" && document.hidden) return;
      fetchNotificationsFromAPI();
    }, 45000);
    return () => clearInterval(interval);
  }, []);

  // Filtered notifications list
  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      const cat = item.category || item.type || "System";

      // Category filter
      if (selectedCategory !== "all") {
        if (cat !== selectedCategory && item.type !== selectedCategory) {
          return false;
        }
      }

      // Status filter
      if (statusFilter === "unread" && item.isRead) return false;
      if (statusFilter === "read" && !item.isRead) return false;

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title?.toLowerCase().includes(q);
        const matchesMessage = item.message?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesMessage) return false;
      }

      return true;
    });
  }, [notifications, selectedCategory, statusFilter, searchQuery]);

  // Dynamic counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, { total: number; unread: number }> = {
      all: { total: notifications.length, unread: notifications.filter((n) => !n.isRead).length },
    };

    CATEGORIES_CONFIG.forEach((c) => {
      if (c.id !== "all") {
        const catItems = notifications.filter(
          (n) => (n.category || n.type || "System") === c.id || n.type === c.id
        );
        counts[c.id] = {
          total: catItems.length,
          unread: catItems.filter((n) => !n.isRead).length,
        };
      }
    });

    return counts;
  }, [notifications]);

  // Mark single as read
  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      setLoadingId(id);
      const res = await fetch("/api/customer/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: id }),
      });

      if (!res.ok) throw new Error("Failed to mark as read");

      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      toast.success("Notification marked as read");
    } catch (err: any) {
      toast.error(err.message || "Failed to update notification");
    } finally {
      setLoadingId(null);
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      setLoadingAll(true);
      const res = await fetch("/api/customer/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          markAll: true,
          category: selectedCategory !== "all" ? selectedCategory : undefined,
        }),
      });

      if (!res.ok) throw new Error("Failed to mark all as read");

      setNotifications((prev) =>
        prev.map((n) => {
          if (
            selectedCategory === "all" ||
            (n.category || n.type || "System") === selectedCategory ||
            n.type === selectedCategory
          ) {
            return { ...n, isRead: true };
          }
          return n;
        })
      );
      toast.success("All notifications marked as read");
    } catch (err: any) {
      toast.error(err.message || "Failed to mark all as read");
    } finally {
      setLoadingAll(false);
    }
  };

  // Delete notification
  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setDeletingId(id);
      const res = await fetch(`/api/customer/notifications?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete notification");

      setNotifications((prev) => prev.filter((n) => n.id !== id));
      toast.success("Notification removed");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete notification");
    } finally {
      setDeletingId(null);
    }
  };

  // Seed / Generate Demo Notifications for all 9 categories
  const handleGenerateDemoEvents = async () => {
    try {
      setIsSeeding(true);
      const res = await fetch("/api/customer/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "seed_demo" }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to seed demo notifications");
      }

      toast.success("Demo notifications generated across all 9 categories!");
      await fetchNotificationsFromAPI(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to generate events");
    } finally {
      setIsSeeding(false);
    }
  };

  // Click notification row (only mark as read if unread, no route navigation)
  const handleNotificationClick = (n: NotificationItem) => {
    if (!n.isRead) {
      handleMarkAsRead(n.id);
    }
  };

  const getCategoryConfig = (item: NotificationItem) => {
    const cat = item.category || item.type || "System";
    const found = CATEGORIES_CONFIG.find((c) => c.id === cat);
    return found || CATEGORIES_CONFIG.find((c) => c.id === "System")!;
  };

  const totalUnread = categoryCounts.all.unread;

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="relative p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-100 flex items-center justify-center">
            <Bell className="w-6 h-6 animate-pulse" />
            {totalUnread > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] px-1 items-center justify-center rounded-full bg-red-500 text-[11px] font-bold text-white shadow-sm ring-2 ring-white">
                {totalUnread > 99 ? "99+" : totalUnread}
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Notifications Center
              </h1>
              {totalUnread > 0 && (
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  {totalUnread} Unread
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 mt-0.5">
              Real-time alerts for orders, deliveries, refunds, wallet, offers, security & more.
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerateDemoEvents}
            disabled={isSeeding}
            className="rounded-xl border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100 text-indigo-700 font-medium transition-all shadow-none"
            title="Generate sample events for testing all 9 categories"
          >
            {isSeeding ? (
              <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 mr-1.5 text-indigo-600" />
            )}
            Simulate Events
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchNotificationsFromAPI(true)}
            disabled={isRefreshing}
            className="rounded-xl border-slate-200 hover:bg-slate-50 font-medium transition-all text-slate-700"
          >
            <RefreshCw
              className={`w-4 h-4 mr-1.5 text-slate-500 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>

          {totalUnread > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={loadingAll}
              className="rounded-xl border-slate-200 hover:bg-blue-50 hover:text-blue-600 font-medium transition-all text-slate-700"
            >
              {loadingAll ? (
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
              ) : (
                <Check className="w-4 h-4 mr-1.5 text-blue-600" />
              )}
              Mark all read
            </Button>
          )}
        </div>
      </div>

      {/* Category Pills Navigation (Horizontal Scrolling) */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {CATEGORIES_CONFIG.map((cat) => {
            const Icon = cat.icon;
            const countObj = categoryCounts[cat.id] || { total: 0, unread: 0 };
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20 ring-2 ring-blue-600/30"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/60"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-white" : cat.color}`} />
                <span>{cat.label}</span>
                {countObj.unread > 0 ? (
                  <span
                    className={`px-1.5 py-0.2 text-[10px] font-bold rounded-full ${
                      isSelected
                        ? "bg-white text-blue-700"
                        : "bg-red-500 text-white"
                    }`}
                  >
                    {countObj.unread}
                  </span>
                ) : countObj.total > 0 ? (
                  <span
                    className={`px-1.5 py-0.2 text-[10px] rounded-full font-medium ${
                      isSelected ? "bg-blue-500 text-white" : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {countObj.total}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        {/* Secondary Filter & Search Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 mt-3 border-t border-slate-100">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search notifications by title or message..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  statusFilter === "all"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter("unread")}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  statusFilter === "unread"
                    ? "bg-white text-blue-600 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Unread ({categoryCounts[selectedCategory]?.unread || 0})
              </button>
              <button
                onClick={() => setStatusFilter("read")}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  statusFilter === "read"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Read
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <Card className="rounded-2xl border-slate-200/80 shadow-xs overflow-hidden">
            <CardContent className="p-12 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4 border border-blue-100">
                <Inbox className="w-8 h-8 opacity-70" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">
                No notifications found
              </h3>
              <p className="text-sm text-slate-500 max-w-sm mt-1 mb-6">
                {searchQuery
                  ? "No notifications matching your search criteria."
                  : selectedCategory !== "all"
                  ? `You have no ${selectedCategory} notifications yet.`
                  : "You're all caught up! There are no notifications to show right now."}
              </p>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateDemoEvents}
                  disabled={isSeeding}
                  className="rounded-xl border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100"
                >
                  <Sparkles className="w-4 h-4 mr-1.5" />
                  Generate Demo Notifications
                </Button>
                {(searchQuery || selectedCategory !== "all" || statusFilter !== "all") && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("all");
                      setStatusFilter("all");
                    }}
                    className="rounded-xl text-slate-600 hover:text-slate-900"
                  >
                    Reset Filters
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredNotifications.map((n) => {
            const catConfig = getCategoryConfig(n);
            const Icon = catConfig.icon;
            const timeAgo = n.createdAt
              ? formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })
              : "";

            return (
              <div
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                className={`group relative flex items-start justify-between gap-4 p-4 sm:p-5 rounded-2xl border transition-all duration-200 cursor-default ${
                  !n.isRead
                    ? "bg-white border-blue-200/90 shadow-sm hover:border-blue-300 ring-1 ring-blue-500/10"
                    : "bg-slate-50/70 border-slate-200/70"
                }`}
              >
                {/* Unread indicator dot */}
                {!n.isRead && (
                  <span className="absolute left-2.5 top-5 w-2 h-2 rounded-full bg-blue-600 ring-4 ring-blue-100" />
                )}

                <div className="flex items-start gap-3.5 pl-2 sm:pl-3 flex-1 min-w-0">
                  {/* Category Icon */}
                  <div
                    className={`p-2.5 rounded-xl border shrink-0 mt-0.5 ${
                      !n.isRead
                        ? "bg-blue-50/80 border-blue-100 text-blue-600"
                        : "bg-white border-slate-200 text-slate-500"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* Text content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span
                        className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md border ${catConfig.badgeBg}`}
                      >
                        {catConfig.label}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {timeAgo}
                      </span>
                      {!n.isRead && (
                        <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded">
                          New
                        </span>
                      )}
                    </div>

                    <h4
                      className={`text-sm font-semibold leading-snug break-words ${
                        !n.isRead ? "text-slate-900 font-bold" : "text-slate-700"
                      }`}
                    >
                      {n.title}
                    </h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed line-clamp-2 sm:line-clamp-none break-words">
                      {n.message}
                    </p>
                  </div>
                </div>

                {/* Right Action buttons */}
                <div className="flex items-center gap-1 shrink-0 self-start sm:self-center ml-2">
                  {!n.isRead && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => handleMarkAsRead(n.id, e)}
                      disabled={loadingId === n.id}
                      className="h-8 w-8 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                      title="Mark as read"
                    >
                      {loadingId === n.id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => handleDelete(n.id, e)}
                    disabled={deletingId === n.id}
                    className="h-8 w-8 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                    title="Delete notification"
                  >
                    {deletingId === n.id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
