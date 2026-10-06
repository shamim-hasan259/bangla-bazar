"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  ChevronDown,
  HelpCircle,
  Settings,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Logo from "@/components/common/Logo";
import { customerSidebarLinks } from "./links/customerSidebarLinks";

export default function CustomerSidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  // Filter links: separate Help and Setting from the main navigation scroll area
  const mainLinks = customerSidebarLinks.filter(
    (l) => l.title !== "Help" && l.title !== "Settings"
  );

  const [unreadNotifsCount, setUnreadNotifsCount] = React.useState<number>(0);

  React.useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await fetch("/api/customer/notifications?isRead=false", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (typeof data.unreadCount === "number") {
            setUnreadNotifsCount(data.unreadCount);
          }
        }
      } catch (e) {}
    };

    fetchUnread();
    const interval = setInterval(() => {
      if (typeof document !== "undefined" && document.hidden) return;
      fetchUnread();
    }, 45000);
    return () => clearInterval(interval);
  }, []);

  const isItemActive = (item: any) => {
    if (item.href === "/dashboard/customer") {
      return pathname === "/dashboard/customer";
    }
    return pathname === item.href || (item.href !== "#" && pathname?.startsWith(item.href));
  };

  const sidebarContent = (
    <div className="w-full h-full flex flex-col bg-[#F8F9FC] dark:bg-slate-900 select-none p-4 pb-2">
      {/* ── Logo Header ── */}
      <div className="flex items-center px-2 py-3.5 shrink-0 mb-3">
        <Logo subtitle="Bangla Bazar Customer" />
      </div>

      {/* ── Nav List (scrollable) ── */}
      <nav className="flex-1 overflow-y-auto space-y-1 pr-1" style={{ scrollbarWidth: "none" }} data-lenis-prevent>
        {mainLinks.map((item: any) => {
          const Icon = item.icon;
          const active = isItemActive(item);

          return (
            <Link
              key={item.title}
              href={item.href || "#"}
              className={cn(
                "flex items-center justify-between px-3 py-2.5 rounded-lg transition-all select-none",
                active
                  ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold shadow-2xs"
                  : "hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              )}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Icon className={cn("w-4.5 h-4.5 shrink-0", active ? "text-[#1E60ED]" : "text-slate-400")} />
                <span className="text-[13px] leading-none">{item.title}</span>
                {item.title === "Notifications" && unreadNotifsCount > 0 && (
                  <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-500 text-white leading-none animate-pulse">
                    {unreadNotifsCount > 99 ? "99+" : unreadNotifsCount}
                  </span>
                )}
              </div>

              {item.label && (
                <span className="text-[10px] font-medium text-slate-400 border border-slate-200/60 dark:border-slate-700/60 px-1.5 py-0.5 rounded bg-slate-50 dark:bg-slate-850 shrink-0 leading-none">
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Footer / Help & Settings ── */}
      <div className="shrink-0 space-y-1 border-t border-slate-100 dark:border-slate-800 pt-3">
        <Link
          href="/dashboard/customer/help-center"
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100/60 dark:hover:bg-slate-800/40 transition-all select-none"
        >
          <HelpCircle className="w-5 h-5 text-slate-400" />
          <span className="text-[13px] font-medium">Help</span>
        </Link>
        <Link
          href="/dashboard/customer/setting"
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100/60 dark:hover:bg-slate-800/40 transition-all select-none"
        >
          <Settings className="w-5 h-5 text-slate-400" />
          <span className="text-[13px] font-medium">Settings</span>
        </Link>

        {/* ── Profile Card Widget ── */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-3 p-2.5 bg-white dark:bg-slate-800 shadow-xs border border-slate-100 dark:border-slate-800 rounded-xl mt-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-750 transition-all">
              <Avatar className="w-9 h-9 border border-slate-200 dark:border-slate-700 shrink-0 rounded-full">
                <AvatarImage src={session?.user?.image || session?.user?.photo || ""} alt={session?.user?.name || "Customer"} />
                <AvatarFallback>{session?.user?.name ? session.user.name.slice(0, 2).toUpperCase() : "CS"}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-bold text-slate-800 dark:text-slate-200 truncate leading-tight">{session?.user?.name || "Customer"}</div>
                <div className="text-[10px] text-slate-400 truncate leading-none mt-0.5">{session?.user?.email || "customer@banglabazar.com"}</div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-md p-1">
            <DropdownMenuItem
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-red-600 dark:text-red-400 text-xs py-1.5 cursor-pointer font-medium"
            >
              Log Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Sheet Trigger */}
      <div className="md:hidden fixed top-2.5 left-4 z-50">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="w-9 h-9 border border-slate-200 bg-white shadow-xs">
              <Menu className="w-4 h-4 text-slate-700" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 border-r border-slate-200/50">
            {sidebarContent}
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sticky Sidebar */}
      <div
        className="hidden md:flex flex-col shrink-0 border-r border-slate-200/50 dark:border-slate-800"
        style={{
          width: 250,
          height: "100vh",
          position: "sticky",
          top: 0,
          overflowY: "hidden",
        }}
      >
        {sidebarContent}
      </div>
    </>
  );
}
