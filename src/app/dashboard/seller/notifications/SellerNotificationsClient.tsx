"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { 
  Bell, 
  ShoppingBag, 
  Package, 
  CreditCard, 
  ShieldCheck, 
  Info, 
  CheckCheck, 
  Trash2, 
  Search, 
  RefreshCw, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  Inbox
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { 
  markSellerNotificationAsRead, 
  markAllSellerNotificationsAsRead, 
  deleteSellerNotification,
  getSellerNotifications
} from "./_action";

interface NotificationItem {
  id: string;
  userId?: string | null;
  userType: string;
  title: string;
  message: string;
  category?: string | null;
  type?: string | null;
  link?: string | null;
  isRead: boolean;
  createdAt: Date | string;
}

interface Props {
  initialNotifications: NotificationItem[];
  sellerId: string;
}

export default function SellerNotificationsClient({ initialNotifications, sellerId }: Props) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  const categoryCounts = useMemo(() => {
    const isOrder = (cat: string, type: string) =>
      cat.includes("order") || cat.includes("sale") || cat.includes("cancel") || cat.includes("return") || cat.includes("refund") || cat.includes("delivery") || type.includes("order") || type.includes("cancel") || type.includes("return") || type.includes("delivery");
    const isInventory = (cat: string, type: string) =>
      cat.includes("stock") || cat.includes("inventory") || cat.includes("product") || type.includes("stock") || type.includes("lowstock") || type.includes("outofstock") || type.includes("approval") || type.includes("rejection");
    const isWallet = (cat: string, type: string) =>
      cat.includes("wallet") || cat.includes("escrow") || cat.includes("payout") || cat.includes("payment") || cat.includes("commission") || cat.includes("withdrawal") || type.includes("payout") || type.includes("withdrawal") || type.includes("commission");
    const isSystem = (cat: string, type: string) =>
      cat.includes("system") || cat.includes("security") || cat.includes("policy") || cat.includes("campaign") || cat.includes("verification") || cat.includes("maintenance") || type.includes("policy") || type.includes("campaign") || type.includes("verification") || type.includes("maintenance");

    let orders = 0;
    let inventory = 0;
    let wallet = 0;
    let system = 0;

    notifications.forEach((item) => {
      const cat = (item.category || item.type || "System").toLowerCase();
      const type = (item.type || "").toLowerCase();
      if (isOrder(cat, type)) orders++;
      else if (isInventory(cat, type)) inventory++;
      else if (isWallet(cat, type)) wallet++;
      else if (isSystem(cat, type)) system++;
    });

    return { orders, inventory, wallet, system };
  }, [notifications]);

  const getCategoryIcon = (category?: string | null, type?: string | null) => {
    const cat = (category || type || "System").toLowerCase();
    const t = (type || "").toLowerCase();

    if (cat.includes("order") || cat.includes("sale") || cat.includes("cancel") || cat.includes("return") || cat.includes("refund") || cat.includes("delivery") || t.includes("order") || t.includes("cancel") || t.includes("delivery") || t.includes("return")) {
      return (
        <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-[#1E60ED] flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/50 shadow-2xs">
          <ShoppingBag className="w-5 h-5" />
        </div>
      );
    }
    if (cat.includes("stock") || cat.includes("inventory") || cat.includes("product") || t.includes("stock") || t.includes("lowstock") || t.includes("outofstock") || t.includes("approval") || t.includes("rejection")) {
      return (
        <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100 dark:border-amber-900/50 shadow-2xs">
          <Package className="w-5 h-5" />
        </div>
      );
    }
    if (cat.includes("wallet") || cat.includes("escrow") || cat.includes("payout") || cat.includes("payment") || cat.includes("commission") || cat.includes("withdrawal") || t.includes("payout") || t.includes("withdrawal") || t.includes("commission")) {
      return (
        <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-900/50 shadow-2xs">
          <CreditCard className="w-5 h-5" />
        </div>
      );
    }
    if (cat.includes("security") || cat.includes("alert") || cat.includes("system") || cat.includes("policy") || cat.includes("campaign") || cat.includes("verification") || cat.includes("maintenance")) {
      return (
        <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-900/50 shadow-2xs">
          <ShieldCheck className="w-5 h-5" />
        </div>
      );
    }
    return (
      <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700 shadow-2xs">
        <Info className="w-5 h-5" />
      </div>
    );
  };

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      const data = await getSellerNotifications(sellerId);
      if (data) {
        setNotifications(JSON.parse(JSON.stringify(data)));
        toast.success("Notifications refreshed");
      }
    } catch {
      toast.error("Failed to refresh notifications");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      setProcessingId(id);
      const res = await markSellerNotificationAsRead(id);
      if (res.success) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
        toast.success("Notification marked as read");
      }
    } catch {
      toast.error("Failed to update notification");
    } finally {
      setProcessingId(null);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setIsRefreshing(true);
      const res = await markAllSellerNotificationsAsRead(sellerId);
      if (res.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        toast.success("All notifications marked as read");
      }
    } catch {
      toast.error("Failed to mark all as read");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setProcessingId(id);
      const res = await deleteSellerNotification(id);
      if (res.success) {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        toast.success("Notification removed");
      }
    } catch {
      toast.error("Failed to remove notification");
    } finally {
      setProcessingId(null);
    }
  };

  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.message.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (activeTab === "all") return true;
      if (activeTab === "unread") return !item.isRead;
      
      const cat = (item.category || item.type || "System").toLowerCase();
      const type = (item.type || "").toLowerCase();

      if (activeTab === "orders") {
        return cat.includes("order") || cat.includes("sale") || cat.includes("cancel") || cat.includes("return") || cat.includes("refund") || cat.includes("delivery") || type.includes("order") || type.includes("cancel") || type.includes("return") || type.includes("delivery");
      }
      if (activeTab === "inventory") {
        return cat.includes("stock") || cat.includes("inventory") || cat.includes("product") || type.includes("stock") || type.includes("lowstock") || type.includes("outofstock") || type.includes("approval") || type.includes("rejection");
      }
      if (activeTab === "wallet") {
        return cat.includes("wallet") || cat.includes("escrow") || cat.includes("payout") || cat.includes("payment") || cat.includes("commission") || cat.includes("withdrawal") || type.includes("payout") || type.includes("withdrawal") || type.includes("commission");
      }
      if (activeTab === "system") {
        return cat.includes("system") || cat.includes("security") || cat.includes("policy") || cat.includes("campaign") || cat.includes("verification") || cat.includes("maintenance") || type.includes("policy") || type.includes("campaign") || type.includes("verification") || type.includes("maintenance");
      }

      return true;
    });
  }, [notifications, activeTab, searchQuery]);

  const tabs = [
    { key: "all", label: "All Notifications", count: notifications.length },
    { key: "unread", label: "Unread", count: unreadCount },
    { key: "orders", label: "Orders", count: categoryCounts.orders },
    { key: "inventory", label: "Inventory", count: categoryCounts.inventory },
    { key: "wallet", label: "Payouts & Wallet", count: categoryCounts.wallet },
    { key: "system", label: "System", count: categoryCounts.system },
  ];

  return (
    <div className="w-full space-y-6 pb-12">
      {/* ── Breadcrumb & Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 mb-1.5 font-medium">
            <Link href="/dashboard/seller" className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
              Dashboard
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className="text-slate-700 dark:text-slate-300 font-semibold">Notifications</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2.5">
            Notification Center
            {unreadCount > 0 && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#1E60ED]/10 text-[#1E60ED] font-bold border border-blue-200 dark:border-blue-800">
                {unreadCount} New
              </span>
            )}
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time updates on customer orders, inventory alerts, payouts, and system announcements.
          </p>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-9 gap-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={isRefreshing}
              className="h-9 gap-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer shadow-2xs"
            >
              <CheckCheck className="w-3.5 h-3.5 text-[#1E60ED]" />
              Mark all as read
            </Button>
          )}
        </div>
      </div>

      {/* ── Search & Filter Controls ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-3.5 md:p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search notifications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 w-full bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-blue-500 rounded-xl text-xs md:text-sm"
          />
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-thin scrollbar-thumb-slate-200">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-[#1E60ED] text-white shadow-sm"
                    : "bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-800"
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive
                        ? "bg-white/20 text-white"
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

      {/* ── Notifications List ── */}
      {filteredNotifications.length > 0 ? (
        <div className="space-y-3">
          {filteredNotifications.map((notif) => {
            const dateStr = new Date(notif.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={notif.id}
                className={`group p-4 md:p-5 rounded-2xl border transition-all duration-200 bg-white dark:bg-slate-900 flex items-start justify-between gap-4 shadow-2xs hover:shadow-sm ${
                  notif.isRead
                    ? "border-slate-100 dark:border-slate-800/80 opacity-90"
                    : "border-blue-200 dark:border-blue-900/60 bg-blue-50/20 dark:bg-blue-950/10"
                }`}
              >
                <div className="flex items-start gap-4">
                  {getCategoryIcon(notif.category, notif.type)}

                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {notif.title}
                      </h3>
                      {!notif.isRead && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-[#1E60ED] bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#1E60ED] animate-pulse" />
                          Unread
                        </span>
                      )}
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                        {dateStr}
                      </span>
                    </div>

                    <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
                      {notif.message}
                    </p>

                    {notif.link && (
                      <div className="pt-2">
                        <Link
                          href={notif.link}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1E60ED] hover:underline"
                        >
                          View Details
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center gap-1.5 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                  {!notif.isRead && (
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={processingId === notif.id}
                      onClick={() => handleMarkAsRead(notif.id)}
                      className="h-8 w-8 rounded-xl text-slate-400 hover:text-[#1E60ED] hover:bg-blue-50 dark:hover:bg-slate-800"
                      title="Mark as read"
                    >
                      <CheckCheck className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={processingId === notif.id}
                    onClick={() => handleDelete(notif.id)}
                    className="h-8 w-8 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800"
                    title="Delete notification"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs">
          <div className="w-14 h-14 bg-slate-50 dark:bg-slate-950 rounded-2xl flex items-center justify-center mb-4 text-slate-400 border border-slate-100 dark:border-slate-800">
            <Inbox className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
            No notifications found
          </h3>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 max-w-sm">
            {searchQuery
              ? `No results match "${searchQuery}". Try searching with different keywords.`
              : "You're all caught up! You will be notified when new orders or updates arrive."}
          </p>
        </div>
      )}
    </div>
  );
}
