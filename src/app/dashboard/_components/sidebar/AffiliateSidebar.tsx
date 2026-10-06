"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  ChevronDown,
  LogOut,
  User,
  Settings,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Logo from "@/components/common/Logo";
import { affiliateSidebarLinks } from "./links/affiliateSidebarLinks";

export default function AffiliateSidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const isItemActive = (item: any) => {
    if (item.href === "/dashboard/affiliate") {
      return pathname === "/dashboard/affiliate";
    }
    return pathname === item.href || (item.href !== "#" && pathname?.startsWith(item.href));
  };

  const user = session?.user as any;

  return (
    <aside className="w-64 shrink-0 hidden md:flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 h-full select-none justify-between p-4 z-40">
      {/* ── Logo & Header ── */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center px-2 py-3 shrink-0">
          <Logo subtitle="Bangla Bazar Affiliate" />
        </div>

        {/* Affiliate Badge card */}
        <div className="mx-1 px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-medium text-blue-100 uppercase tracking-wider">Affiliate Partner</p>
              <p className="text-xs font-bold truncate max-w-[120px]">
                {user?.affiliateCode || "AFF-PARTNER"}
              </p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-white/25 text-white">
            5% Tier
          </span>
        </div>

        {/* ── Navigation Links ── */}
        <nav className="space-y-1.5 mt-2" data-lenis-prevent>
          {affiliateSidebarLinks.map((item) => {
            const Icon = item.icon;
            const active = isItemActive(item);

            return (
              <Link
                key={item.title}
                href={item.href}
                className={cn(
                  "flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all select-none text-xs font-semibold",
                  active
                    ? "bg-[#1E60ED] text-white shadow-md shadow-blue-500/20"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className={cn("w-4.5 h-4.5 shrink-0", active ? "text-white" : "text-slate-400 dark:text-slate-500")} />
                  <span>{item.title}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* ── User Profile Block at Bottom ── */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
        <DropdownMenu>
          <DropdownMenuTrigger className="w-full flex items-center justify-between p-2 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors outline-none cursor-pointer">
            <div className="flex items-center gap-2.5 min-w-0">
              <Avatar className="w-9 h-9 rounded-xl border border-blue-200 dark:border-slate-700">
                <AvatarImage src={user?.photo || ""} />
                <AvatarFallback className="bg-blue-600 text-white text-xs font-bold">
                  {(user?.name || "A").slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="text-left min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                  {user?.name || "Affiliate Partner"}
                </p>
                <p className="text-[11px] text-slate-400 truncate">
                  {user?.phone || user?.email || "affiliate@banglabazar.com"}
                </p>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56 mb-2 rounded-2xl p-1.5 shadow-xl border-slate-200 dark:border-slate-800">
            <div className="px-2.5 py-2">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{user?.name}</p>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">{user?.affiliateCode}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="cursor-pointer rounded-xl text-xs py-2">
              <Link href="/dashboard/affiliate/setting" className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-slate-500" />
                <span>Account Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer rounded-xl text-xs py-2">
              <Link href="/" className="flex items-center gap-2">
                <User className="w-4 h-4 text-slate-500" />
                <span>Visit Storefront</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => signOut({ callbackUrl: "/auth/affiliate/login" })}
              className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/40 cursor-pointer rounded-xl text-xs py-2 font-semibold"
            >
              <div className="flex items-center gap-2 w-full">
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
