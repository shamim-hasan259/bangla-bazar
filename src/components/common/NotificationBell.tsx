"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { getMyNotifications, markNotificationsAsRead } from "@/app/actions/notificationAction";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      const data = await getMyNotifications();
      setNotifications(data);
      setUnreadCount(data.filter((n: any) => !n.isRead).length);
    };
    fetchNotifications();
    // In a real app, you might want to poll this or use websockets
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleOpen = async (isOpen: boolean) => {
    if (isOpen && unreadCount > 0) {
      await markNotificationsAsRead();
      setUnreadCount(0);
      // Optimistically update the UI list
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    }
  };

  return (
    <DropdownMenu onOpenChange={handleOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative bg-white dark:bg-slate-900 border border-black/5 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary shadow-sm rounded-full h-10 w-10 flex items-center justify-center transition-all duration-200 group cursor-pointer"
        >
          <Bell className="w-5 h-5 group-hover:text-primary transition-colors" />
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white dark:border-slate-900 shadow-sm animate-in zoom-in">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-[400px] overflow-y-auto">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-gray-500">
            No notifications yet.
          </div>
        ) : (
          notifications.map((notif) => (
            <DropdownMenuItem key={notif.id} className="flex flex-col items-start p-3 gap-1 cursor-default focus:bg-gray-50 dark:focus:bg-slate-800">
              <div className="flex justify-between w-full">
                <span className="font-semibold text-sm">{notif.title}</span>
                <span className="text-[10px] text-gray-400">
                  {new Date(notif.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">
                {notif.message}
              </p>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
