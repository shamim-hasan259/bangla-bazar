"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Home,
  LayoutDashboard,
  Bell,
  Folder,
  MessageSquare,
  Percent,
  Activity,
  CreditCard,
  HelpCircle,
  Settings,
  Package,
  ClipboardList,
  ChevronDown,
  ChevronRight,
  Menu,
  ArrowLeft,
  Store,
  Plus,
  Boxes,
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
import { useSellerStore } from "@/context/SellerStoreContext";

interface MenuItem {
  key: string;
  label: string;
  icon: any;
  href?: string;
  badge?: string;
  count?: number;
  subItems?: Array<{ label: string; href: string }>;
}

export default function SellerSidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    products: false,
    orders: false,
    campaigns: false,
    messages: false,
  });

  const { storeId, storeData } = useSellerStore();
  const isStoreDashboard = !!storeId;

  const toggleMenu = (menu: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menu]: !prev[menu],
    }));
  };

  useEffect(() => {
    if (pathname?.includes("/seller/products") || pathname?.includes("/seller/brand")) {
      setOpenMenus((prev) => ({ ...prev, products: true }));
    }
    if (pathname?.includes("/seller/orders")) {
      setOpenMenus((prev) => ({ ...prev, orders: true }));
    }
    if (pathname?.includes("/seller/marketing")) {
      setOpenMenus((prev) => ({ ...prev, campaigns: true }));
    }
    if (pathname?.includes("/seller/solutions")) {
      setOpenMenus((prev) => ({ ...prev, messages: true }));
    }
  }, [pathname]);

  const genericMenuConfig: MenuItem[] = [
    {
      key: "home",
      label: "Home",
      icon: Home,
      href: "/",
      badge: "H",
    },
    {
      key: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard/seller",
      badge: "D",
    },
    {
      key: "Store",
      label: "Store",
      icon: Store,
      href: "/dashboard/seller/store",
    },
    {
      key: "orders",
      label: "Orders",
      icon: ClipboardList,
      subItems: [
        { label: "Manage Orders", href: "/dashboard/seller/orders" },
        { label: "Return Settlement", href: "/dashboard/seller/orders/returns" },
      ],
    },
    {
      key: "products",
      label: "Products",
      icon: Package,
      subItems: [
        { label: "Manage Products", href: "/dashboard/seller/products" },
        { label: "Add Products", href: "/dashboard/seller/products/create" },
        { label: "Media Center", href: "/dashboard/seller/products/media-center" },
      ],
    },
    {
      key: "inventory",
      label: "Inventory",
      icon: Boxes,
      subItems: [
        { label: "Stock", href: "/dashboard/seller/inventory/stock" },
        { label: "Stock Ledger", href: "/dashboard/seller/inventory/ledger" },
      ],
    },
    {
      key: "marketing-center",
      label: "Marketing Center",
      icon: Percent,
      subItems: [
        { label: "Dashboard", href: "/dashboard/seller/marketing" },
        { label: "Campaign Hub", href: "/dashboard/seller/marketing/campaigns" },
        { label: "Flash Sales", href: "/dashboard/seller/marketing/flash-sales" },
        { label: "Vouchers", href: "/dashboard/seller/marketing/vouchers" },
        { label: "Bundles", href: "/dashboard/seller/marketing/bundles" },
      ],
    },
    {
      key: "messages",
      label: "Messages",
      icon: MessageSquare,
      href: "/dashboard/seller/customer-communication",
    },
    {
      key: "notifications",
      label: "Notifications",
      icon: Bell,
      href: "/dashboard/seller/notifications",
      badge: "N",
    },
    {
      key: "performance",
      label: "Performance",
      icon: Activity,
      href: "/dashboard/seller/assortment/workbench",
    },
    {
      key: "billing",
      label: "Billing",
      icon: CreditCard,
      href: "/dashboard/seller/wallet",
    },
  ];

  const storeMenuConfig: MenuItem[] = [
    {
      key: "store-dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      href: `/dashboard/seller/store-dashboard/${storeId}`,
    },
    {
      key: "store-featured",
      label: "Store (Featured)",
      icon: Folder,
      href: `/dashboard/seller/store-dashboard/${storeId}/featured-products`,
    },
    {
      key: "store-products-create",
      label: "Create Product",
      icon: Plus,
      href: `/dashboard/seller/store-dashboard/${storeId}/products/create`,
    },
    {
      key: "store-products-manage",
      label: "Manage Products",
      icon: Package,
      href: `/dashboard/seller/store-dashboard/${storeId}/products`,
    },
    {
      key: "store-messages",
      label: "Manage Messages",
      icon: MessageSquare,
      href: `/dashboard/seller/store-dashboard/${storeId}/messages`,
    },
    {
      key: "store-orders",
      label: "Manage Orders",
      icon: ClipboardList,
      href: `/dashboard/seller/store-dashboard/${storeId}/orders`,
    },
    {
      key: "store-notifications",
      label: "Notifications",
      icon: Bell,
      href: "/dashboard/seller/notifications",
    },
    {
      key: "store-inventory",
      label: "Inventory",
      icon: Boxes,
      subItems: [
        { label: "Stock", href: `/dashboard/seller/store-dashboard/${storeId}/inventory/stock` },
        { label: "Stock Ledger", href: `/dashboard/seller/store-dashboard/${storeId}/inventory/ledger` },
      ],
    },
    {
      key: "store-profile",
      label: "Store Profile",
      icon: Settings,
      href: `/dashboard/seller/store-dashboard/${storeId}/profile`,
    },
  ];

  const menuConfig = isStoreDashboard ? storeMenuConfig : genericMenuConfig;

  const isItemActive = (item: any) => {
    if (item.key === "dashboard") {
      return pathname === "/dashboard/seller";
    }
    if (item.key === "store-dashboard") {
      return pathname === `/dashboard/seller/store-dashboard/${storeId}`;
    }
    if (item.href && item.href !== "#" && pathname === item.href) {
      return true;
    }
    if (item.subItems) {
      return item.subItems.some((sub: any) => pathname?.startsWith(sub.href));
    }
    return false;
  };

  const isChildActive = (href: string) => href !== "#" && pathname === href;

  const sidebarContent = (
    <div className="w-full h-full flex flex-col bg-[#F8F9FC] dark:bg-slate-900 select-none p-4 pb-2">
      {/* ── Logo Header ── */}
      {isStoreDashboard && storeData ? (
        <div className="flex items-center gap-3 px-2 py-4 shrink-0 mb-4">
          <div className="w-9 h-9 rounded-xl border overflow-hidden relative bg-slate-50 flex items-center justify-center shrink-0">
            {storeData.storeLogo ? (
              <Image src={storeData.storeLogo} alt="" fill className="object-cover" />
            ) : (
              <Store className="w-5 h-5 text-slate-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[14px] font-bold text-slate-800 dark:text-white leading-tight truncate">{storeData.storeNameEn}</div>
            <div className="text-[11px] text-slate-400 font-medium leading-none mt-0.5">Store Dashboard</div>
          </div>
        </div>
      ) : (
        <div className="flex items-center px-2 py-3.5 shrink-0 mb-3">
          <Logo subtitle="Bangla Bazar Seller" />
        </div>
      )}

      {/* ── Nav List (scrollable) ── */}
      <nav className="flex-1 overflow-y-auto space-y-1 pr-1" style={{ scrollbarWidth: "none" }} data-lenis-prevent>
        {menuConfig.map((item) => {
          const Icon = item.icon;
          const isExpanded = openMenus[item.key];
          const active = isItemActive(item);

          if (item.subItems) {
            return (
              <div key={item.key} className="space-y-0.5">
                {/* Parent Row */}
                <div
                  onClick={() => toggleMenu(item.key)}
                  className={cn(
                    "flex items-center justify-between cursor-pointer px-3 py-2.5 rounded-lg transition-all select-none",
                    active
                      ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold shadow-2xs"
                      : "hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                  )}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Icon className={cn("w-4.5 h-4.5 shrink-0", active ? "text-[#1E60ED]" : "text-slate-400")} />
                    <span className="text-[13px] leading-none">{item.label}</span>
                    {item.count && (
                      <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-500 text-white leading-none">
                        {item.count === 99 ? "99+" : item.count}
                      </span>
                    )}
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  )}
                </div>

                {/* Sub Menu Items Tree */}
                {isExpanded && (
                  <div className="ml-4 pl-3.5 border-l-2 border-slate-200 dark:border-slate-800 space-y-1 my-1">
                    {item.subItems.map((sub) => {
                      const childActive = isChildActive(sub.href);

                      return (
                        <Link
                          key={sub.label}
                          href={sub.href}
                          className={cn(
                            "flex items-center gap-2.5 py-1.5 px-2.5 text-[12px] rounded-md transition-all",
                            childActive
                              ? "text-[#1E60ED] font-bold bg-blue-50/70 dark:bg-blue-950/30"
                              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/60 dark:hover:bg-slate-800/40"
                          )}
                        >
                          <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", childActive ? "bg-[#1E60ED]" : "bg-slate-300 dark:bg-slate-600")} />
                          <span className="truncate">{sub.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.key}
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
                <span className="text-[13px] leading-none">{item.label}</span>
                {item.count && (
                  <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-500 text-white leading-none">
                    {item.count === 99 ? "99+" : item.count}
                  </span>
                )}
              </div>

              {item.badge && (
                <span className="text-[10px] font-medium text-slate-400 border border-slate-200/60 dark:border-slate-700/60 px-1.5 py-0.5 rounded bg-slate-50 dark:bg-slate-850 shrink-0 leading-none">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Footer / Help & Settings ── */}
      <div className="shrink-0 space-y-1 border-t border-slate-100 dark:border-slate-800 pt-3">
        {isStoreDashboard ? (
          <Link
            href="/dashboard/seller/store"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#1E60ED] hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-all select-none font-bold"
          >
            <ArrowLeft className="w-5 h-5 text-[#1E60ED]" />
            <span className="text-[13px]">Exit Store Panel</span>
          </Link>
        ) : (
          <>
            <Link
              href="#"
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100/60 dark:hover:bg-slate-800/40 transition-all select-none"
            >
              <HelpCircle className="w-5 h-5 text-slate-400" />
              <span className="text-[13px] font-medium">Help</span>
            </Link>
            <Link
              href="/dashboard/seller/setting"
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100/60 dark:hover:bg-slate-800/40 transition-all select-none"
            >
              <Settings className="w-5 h-5 text-slate-400" />
              <span className="text-[13px] font-medium">Settings</span>
            </Link>
          </>
        )}

        {/* ── Profile Card Widget ── */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-3 p-2.5 bg-white dark:bg-slate-800 shadow-xs border border-slate-100 dark:border-slate-800 rounded-xl mt-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-750 transition-all">
              <Avatar className="w-9 h-9 border border-slate-200 dark:border-slate-700 shrink-0 rounded-full">
                <AvatarImage src={session?.user?.image || (session?.user as any)?.photo || ""} alt={session?.user?.name || "Seller"} />
                <AvatarFallback>{session?.user?.name ? session.user.name.slice(0, 2).toUpperCase() : "SL"}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-bold text-slate-800 dark:text-slate-200 truncate leading-tight">{session?.user?.name || "Seller"}</div>
                <div className="text-[10px] text-slate-400 truncate leading-none mt-0.5">{session?.user?.email || (session?.user as any)?.phone || "seller@banglabazar.com"}</div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-md p-1">
            <DropdownMenuItem asChild>
              <Link href="/dashboard/customer/setting" className="text-slate-750 dark:text-slate-250 text-xs py-1.5 cursor-pointer">
                View Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/seller/setting" className="text-slate-750 dark:text-slate-250 text-xs py-1.5 cursor-pointer">
                Account Settings
              </Link>
            </DropdownMenuItem>
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
      <div className="md:hidden fixed top-2 left-4 z-50">
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
