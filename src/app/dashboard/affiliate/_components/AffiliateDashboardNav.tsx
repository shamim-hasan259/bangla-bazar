"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Menu,
  Copy,
  Check,
  Wallet,
  ExternalLink,
  Sparkles,
  Link as LinkIcon,
  LogOut,
  User,
  Settings,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Logo from "@/components/common/Logo";
import { affiliateSidebarLinks } from "../../_components/sidebar/links/affiliateSidebarLinks";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function AffiliateDashboardNav() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [copied, setCopied] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const user = session?.user as any;
  const affiliateCode = user?.affiliateCode || "AFF-PARTNER";

  const handleCopyCode = () => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(affiliateCode);
      setCopied(true);
      toast.success("Affiliate Code copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getPageTitle = () => {
    if (pathname === "/dashboard/affiliate") return "Affiliate Overview";
    if (pathname.includes("/links")) return "Affiliate Link Generator";
    if (pathname.includes("/earnings")) return "Earnings & Commission";
    if (pathname.includes("/referrals")) return "Referral Orders";
    if (pathname.includes("/wallet")) return "Wallet & Payouts";
    if (pathname.includes("/banners")) return "Marketing Materials & Banners";
    if (pathname.includes("/setting")) return "Affiliate Settings";
    return "Affiliate Dashboard";
  };

  return (
    <header className="h-16 px-4 sm:px-6 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between shrink-0 select-none z-30">
      {/* Left: Mobile Drawer Trigger + Page Breadcrumb */}
      <div className="flex items-center gap-3">
        {/* Mobile Menu */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden text-slate-700 dark:text-slate-200">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0 flex flex-col bg-white dark:bg-slate-900">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800">
              <Logo subtitle="Bangla Bazar Affiliate" />
            </div>
            <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
              {affiliateSidebarLinks.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.title}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all",
                      active
                        ? "bg-[#1E60ED] text-white"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.title}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="p-4 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="destructive"
                className="w-full text-xs font-bold rounded-xl"
                onClick={() => signOut({ callbackUrl: "/auth/affiliate/login" })}
              >
                <LogOut className="w-4 h-4 mr-2" /> Logout
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
            <span>Dashboard</span>
            <span>/</span>
            <span className="text-blue-600 dark:text-blue-400">Affiliate</span>
          </div>
          <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight">
            {getPageTitle()}
          </h1>
        </div>
      </div>

      {/* Right: Quick Affiliate Code Badge + Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Affiliate Code Copy Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200/80 dark:border-blue-900/50 text-slate-800 dark:text-slate-200">
          <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400">Code:</span>
          <span className="text-xs font-extrabold font-mono tracking-tight">{affiliateCode}</span>
          <button
            onClick={handleCopyCode}
            title="Copy Affiliate Code"
            className="p-1 hover:bg-blue-200/60 dark:hover:bg-blue-900 rounded-md transition-colors cursor-pointer text-blue-600 dark:text-blue-400"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Generate Link Quick CTA */}
        <Link
          href="/dashboard/affiliate/links"
          className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#1E60ED] hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
        >
          <LinkIcon className="w-3.5 h-3.5" />
          <span>New Link</span>
        </Link>

        {/* Visit Store */}
        <Link
          href="/"
          target="_blank"
          className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Store</span>
        </Link>
      </div>
    </header>
  );
}
