"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  ChevronDown,
  ChevronRight,
  Menu,
  Shield,
  HelpCircle,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Logo from "@/components/common/Logo";
import { getAdminSidebarLinks } from "./links/adminSidebarLinks";

export default function AdminSidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  // Get links based on user type
  const userType = (session?.user as any)?.type;
  const links = useMemo(() => getAdminSidebarLinks(userType), [userType]);

  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Automatically expand parent menu if current pathname matches any subLink
  useEffect(() => {
    setOpenMenus((prev) => {
      let changed = false;
      const next = { ...prev };
      links.forEach((link) => {
        if (
          link?.subLinks &&
          link.subLinks.some(
            (sub) => pathname === sub.href || pathname?.startsWith(`${sub.href}/`)
          )
        ) {
          if (!next[link.title]) {
            next[link.title] = true;
            changed = true;
          }
        }
      });
      return changed ? next : prev;
    });
  }, [pathname, links]);

  const toggleMenu = (title: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const isLinkActive = (href?: string) => {
    if (!href) return false;
    if (href === "/dashboard/admin") {
      return pathname === "/dashboard/admin" || pathname === "/dashboard/admin/";
    }
    return pathname === href || pathname?.startsWith(`${href}/`);
  };

  const isParentActive = (subLinks?: { href: string }[]) => {
    if (!subLinks) return false;
    return subLinks.some(
      (sub) => pathname === sub.href || pathname?.startsWith(`${sub.href}/`)
    );
  };

  // Sidebar Inner Content Component
  const renderSidebarContent = (isMobile = false) => (
    <div className="w-full h-full flex flex-col bg-[#F8F9FC] dark:bg-slate-900 select-none p-4 pb-2">
      {/* ── Brand / Header ── */}
      <div className="flex items-center px-2 py-3.5 shrink-0 mb-3">
        <Logo subtitle="Bangla Bazar Admin" />
      </div>

      {/* ── Nav Links List ── */}
      <div
        className="flex-1 overflow-y-auto pr-1 space-y-1"
        style={{ scrollbarWidth: "none" }}
        data-lenis-prevent
      >
        {links
          .filter((link): link is NonNullable<typeof link> => link !== null)
          .map((link) => {
            const Icon = link.icon;
            const hasSubLinks = !!(link.subLinks && link.subLinks.length > 0);
            const isExpanded = !!openMenus[link.title];
            const active = hasSubLinks
              ? isParentActive(link.subLinks)
              : isLinkActive(link.href);

            if (hasSubLinks) {
              return (
                <div key={link.title} className="space-y-0.5">
                  {/* Parent Accordion Trigger */}
                  <div
                    onClick={() => toggleMenu(link.title)}
                    className={cn(
                      "flex items-center justify-between cursor-pointer px-3 py-2.5 rounded-lg transition-all select-none group",
                      active
                        ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold shadow-2xs"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                    )}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Icon
                        className={cn(
                          "w-4.5 h-4.5 shrink-0 transition-colors",
                          active
                            ? "text-[#1E60ED]"
                            : "text-slate-400 group-hover:text-slate-500 dark:group-hover:text-slate-300"
                        )}
                      />
                      <span className="text-[13px] font-medium leading-none truncate">
                        {link.title}
                      </span>
                    </div>
                    <ChevronRight
                      className={cn(
                        "w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0",
                        isExpanded && "rotate-90"
                      )}
                    />
                  </div>

                  {/* Sub Links Tree */}
                  {isExpanded && (
                    <div className="ml-4 pl-3.5 border-l-2 border-slate-200 dark:border-slate-800 space-y-1 my-1">
                      {link.subLinks?.map((subLink) => {
                        const isSubActive =
                          pathname === subLink.href ||
                          pathname?.startsWith(`${subLink.href}/`);
                        const SubIcon = subLink.icon;

                        return (
                          <Link
                            key={subLink.href}
                            href={subLink.href}
                            onClick={() => {
                              if (isMobile) setIsMobileOpen(false);
                            }}
                            className={cn(
                              "flex items-center gap-2.5 py-1.5 px-2.5 text-[12px] font-medium rounded-md transition-all",
                              isSubActive
                                ? "text-[#1E60ED] font-bold bg-blue-50/70 dark:bg-blue-950/30"
                                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/60 dark:hover:bg-slate-800/40"
                            )}
                          >
                            {SubIcon ? (
                              <SubIcon className="h-3.5 w-3.5 shrink-0 opacity-80" />
                            ) : (
                              <div
                                className={cn(
                                  "w-1.5 h-1.5 rounded-full shrink-0",
                                  isSubActive
                                    ? "bg-[#1E60ED]"
                                    : "bg-slate-300 dark:bg-slate-600"
                                )}
                              />
                            )}
                            <span className="truncate">{subLink.title}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            // Normal Link
            return (
              <Link
                key={link.title}
                href={link.href || "#"}
                onClick={() => {
                  if (isMobile) setIsMobileOpen(false);
                }}
                className={cn(
                  "flex items-center justify-between px-3 py-2.5 rounded-lg transition-all select-none group",
                  active
                    ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold shadow-2xs"
                    : "hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                )}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Icon
                    className={cn(
                      "w-4.5 h-4.5 shrink-0 transition-colors",
                      active
                        ? "text-[#1E60ED]"
                        : "text-slate-400 group-hover:text-slate-500 dark:group-hover:text-slate-300"
                    )}
                  />
                  <span className="text-[13px] font-medium leading-none truncate">
                    {link.title}
                  </span>
                </div>
                {!active && link.title !== "Dashboard" && (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-slate-500 transition-colors shrink-0" />
                )}
              </Link>
            );
          })}
      </div>

      {/* ── Footer & User Profile Section ── */}
      <div className="shrink-0 space-y-1 border-t border-slate-100 dark:border-slate-800 pt-3 mt-auto">
        <Link
          href="/dashboard/admin/help-support"
          onClick={() => {
            if (isMobile) setIsMobileOpen(false);
          }}
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-xl transition-all select-none",
            pathname?.startsWith("/dashboard/admin/help-support")
              ? "bg-slate-100 dark:bg-slate-800 text-[#1E60ED] font-bold"
              : "text-slate-500 dark:text-slate-400 hover:bg-slate-100/60 dark:hover:bg-slate-800/40"
          )}
        >
          <HelpCircle
            className={cn(
              "w-5 h-5",
              pathname?.startsWith("/dashboard/admin/help-support")
                ? "text-[#1E60ED]"
                : "text-slate-400"
            )}
          />
          <span className="text-[13px] font-medium">Help & Support</span>
        </Link>
        <Link
          href="/dashboard/admin/setting"
          onClick={() => {
            if (isMobile) setIsMobileOpen(false);
          }}
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-xl transition-all select-none",
            pathname?.startsWith("/dashboard/admin/setting")
              ? "bg-slate-100 dark:bg-slate-800 text-[#1E60ED] font-bold"
              : "text-slate-500 dark:text-slate-400 hover:bg-slate-100/60 dark:hover:bg-slate-800/40"
          )}
        >
          <Settings
            className={cn(
              "w-5 h-5",
              pathname?.startsWith("/dashboard/admin/setting")
                ? "text-[#1E60ED]"
                : "text-slate-400"
            )}
          />
          <span className="text-[13px] font-medium">System Settings</span>
        </Link>

        {/* Profile Card Widget with Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-3 p-2.5 bg-white dark:bg-slate-800 shadow-xs border border-slate-100 dark:border-slate-800 rounded-xl mt-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-750 transition-all">
              <Avatar className="w-9 h-9 border border-slate-200 dark:border-slate-700 shrink-0 rounded-full">
                <AvatarImage
                  src={
                    // @ts-ignore
                    session?.user?.photo || session?.user?.image || ""
                  }
                  alt={session?.user?.name || "Admin"}
                />
                <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
                  {session?.user?.name
                    ? session.user.name.slice(0, 2).toUpperCase()
                    : "AD"}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-bold text-slate-800 dark:text-slate-200 truncate leading-tight">
                  {session?.user?.name || "Admin User"}
                </div>
                <div className="text-[10px] text-slate-400 truncate leading-none mt-0.5">
                  {
                    // @ts-ignore
                    session?.user?.type || session?.user?.email || "Super Admin"
                  }
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-md p-1"
          >
            <DropdownMenuItem asChild>
              <Link
                href="/dashboard/admin/profile"
                className="text-slate-750 dark:text-slate-250 text-xs py-1.5 cursor-pointer font-medium"
              >
                Admin Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href="/dashboard/admin/setting"
                className="text-slate-750 dark:text-slate-250 text-xs py-1.5 cursor-pointer"
              >
                System Settings
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
      {/* Mobile Sidebar (Drawer) */}
      <div className="md:hidden fixed top-2 left-4 z-50">
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="w-9 h-9 border border-slate-200 bg-white shadow-xs"
            >
              <Menu className="w-4 h-4 text-slate-700" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 border-r border-slate-200/50">
            {renderSidebarContent(true)}
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Fixed Sticky Sidebar (250px) */}
      <div className="hidden md:flex flex-col shrink-0 border-r border-slate-200/50 dark:border-slate-800 w-[250px] h-full overflow-y-hidden select-none">
        {renderSidebarContent(false)}
      </div>
    </>
  );
}



