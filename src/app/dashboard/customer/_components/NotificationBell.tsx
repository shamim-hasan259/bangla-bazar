"use client";

import React, { useState, useEffect, useRef } from "react";
import { Bell, Check, ExternalLink, Inbox, Loader2 } from "lucide-react";
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "../notifications/_action";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface NotificationBellProps {
  customerId: string;
}

export default function NotificationBell({ customerId }: NotificationBellProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const data = await getNotifications(customerId);
      setNotifications(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Poll every 60 seconds for new notifications when tab is active
    const interval = setInterval(() => {
      if (typeof document !== "undefined" && document.hidden) return;
      fetchNotifications();
    }, 60000);
    return () => clearInterval(interval);
  }, [customerId]);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleNotificationClick = async (n: any) => {
    if (!n.isRead) {
      // Optimistic update
      setNotifications(prev =>
        prev.map(item => item.id === n.id ? { ...item, isRead: true } : item)
      );
      await markNotificationAsRead(n.id);
    }
  };

  const handleMarkAllAsRead = async () => {
    // Optimistic update
    setNotifications(prev => prev.map(item => ({ ...item, isRead: true })));
    await markAllNotificationsAsRead(customerId);
    toastMarkAll();
  };

  const toastMarkAll = () => {
    // Simple state alert/feedback
  };

  return (
    <div className="relative text-xs font-semibold select-none" ref={containerRef}>
      
      {/* Bell Button */}
      <button
        onClick={() => setOpen(!open)}
        className="w-9 h-9 border border-slate-200 dark:border-slate-800 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800/40 p-0 flex items-center justify-center text-slate-800 dark:text-slate-200 cursor-pointer transition-colors relative"
      >
        <Bell className="w-4.5 h-4.5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-rose-500 text-white rounded-full flex items-center justify-center text-[9px] font-black px-1.5 border-2 border-white dark:border-slate-900 shadow-sm animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden text-slate-700 dark:text-slate-200 animate-in fade-in slide-in-from-top-2 duration-200">
          
          {/* Header */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/20">
            <span className="font-extrabold text-slate-850 dark:text-white">Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-[#1E60ED] hover:underline font-bold text-[10px]"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List content */}
          <div className="max-h-72 overflow-y-auto divide-y divide-slate-50 dark:divide-slate-800/50">
            {loading ? (
              <div className="p-8 text-center flex justify-center items-center gap-2 text-slate-400">
                <Loader2 className="w-4 h-4 animate-spin text-[#1E60ED]" />
                Loading...
              </div>
            ) : notifications.length > 0 ? (
              notifications.slice(0, 5).map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`p-4 flex items-start gap-3 hover:bg-slate-50/85 dark:hover:bg-slate-800/20 cursor-default transition-colors relative ${
                    !n.isRead ? "bg-blue-50/25 dark:bg-blue-500/5" : ""
                  }`}
                >
                  {/* Unread indicator */}
                  {!n.isRead && (
                    <span className="absolute top-4.5 left-2 w-1.5 h-1.5 bg-[#1E60ED] rounded-full shrink-0"></span>
                  )}
                  
                  <div className="space-y-1 pl-1 min-w-0">
                    <p className={`font-bold text-[11px] leading-tight truncate ${!n.isRead ? "text-slate-850 dark:text-white" : "text-slate-600 dark:text-slate-350"}`}>
                      {n.title}
                    </p>
                    <p className="text-slate-450 dark:text-slate-400 text-[10px] leading-relaxed break-words">
                      {n.message}
                    </p>
                    <span className="text-[9px] text-slate-400 font-bold block pt-1">
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-450 flex flex-col items-center justify-center">
                <Inbox className="w-8 h-8 text-slate-300 mb-1" />
                <p>No notifications yet</p>
              </div>
            )}
          </div>

          {/* Footer view all */}
          <Link
            href="/dashboard/customer/notifications"
            onClick={() => setOpen(false)}
            className="block text-center py-3 border-t border-slate-100 dark:border-slate-800 text-[11px] font-bold text-[#1E60ED] hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors"
          >
            View All Notifications
          </Link>
        </div>
      )}
    </div>
  );
}
