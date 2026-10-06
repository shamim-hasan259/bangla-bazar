"use client";

import Link from "next/link";
import { LucideIcon, Power, ChevronRight, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useEffect, useState } from "react";

interface NavProps {
  isCollapsed: boolean;
  links: {
    title: string;
    icon: LucideIcon;
    href?: string;
    variant?: "default" | "ghost";
    header?: string;
    subLinks?: {
      title: string;
      href: string;
      icon?: LucideIcon;
    }[];
  }[];
  userType?: string;
  showLogout?: boolean;
}

export function Nav({ links, isCollapsed, userType = "customer", showLogout = true }: NavProps) {
  const router = useRouter();
  const pathName = usePathname();

  // Color logic based on user type
  const activeColorText = userType === "admin" ? "text-slate-800 dark:text-white" : "text-[#1E60ED] dark:text-orange-400";
  const activeColorBg = userType === "admin" ? "bg-white dark:bg-slate-800 shadow-xs border border-slate-100/50 dark:border-slate-750" : "bg-blue-50/50 dark:bg-orange-900/20";
  const hoverColorBg = "hover:bg-slate-50 dark:hover:bg-slate-850";
  
  const logOutHandler = async () => {
    const signout = await signOut();
    if (signout) {
      router.push("/");
    }
  };

  return (
    <div
      data-collapsed={isCollapsed}
      className="group flex flex-col gap-2 py-2"
    >
      <nav className="grid gap-1 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2">
        {links.map((link, index) => {
          const hasSubLinks = link.subLinks && link.subLinks.length > 0;
          const isActive =
            (link.href && (pathName === link.href || pathName === `${link.href}/`)) ||
            (hasSubLinks && link.subLinks?.some((sub) => pathName.includes(sub.href)));

          if (hasSubLinks) {
            return (
              <Collapsible
                key={index}
                defaultOpen={isActive}
                className="w-full"
              >
                {isCollapsed ? (
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                      <CollapsibleTrigger
                        className={cn(
                          "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
                          isActive
                            ? cn(activeColorBg, activeColorText)
                            : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                        )}
                      >
                        <link.icon className="h-4 w-4" />
                        <span className="sr-only">{link.title}</span>
                      </CollapsibleTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="flex items-center gap-4">
                      {link.title}
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <CollapsibleTrigger
                    className={cn(
                      "flex items-center justify-between w-full px-3 py-2.5 text-[13px] font-medium rounded-lg transition-all duration-200 cursor-pointer group/collapsible select-none",
                      isActive
                        ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold shadow-2xs"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <link.icon
                        className={cn(
                          "w-4.5 h-4.5 transition-colors shrink-0",
                          isActive
                            ? "text-[#1E60ED]"
                            : "text-slate-400 group-hover/collapsible:text-slate-500 dark:group-hover/collapsible:text-slate-300"
                        )}
                      />
                      <span>{link.title}</span>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-400 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 shrink-0" />
                  </CollapsibleTrigger>
                )}
                
                <CollapsibleContent className={cn("space-y-1 my-1", isCollapsed ? "" : "ml-4 pl-3.5 border-l-2 border-slate-200 dark:border-slate-800 animate-in slide-in-from-top-1 duration-150")}>
                  {link.subLinks?.map((subLink, subIndex) => {
                    const isSubActive = pathName.includes(subLink.href);
                    
                    return isCollapsed ? (
                      <Tooltip key={subIndex} delayDuration={0}>
                        <TooltipTrigger asChild>
                          <Link
                            href={subLink.href}
                            className={cn(
                              "flex h-9 w-9 mx-auto mt-1 items-center justify-center rounded-lg transition-colors",
                              isSubActive
                                ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                            )}
                          >
                            {subLink.icon ? (
                              <subLink.icon className="h-4 w-4" />
                            ) : (
                              <div className="h-1.5 w-1.5 rounded-full bg-current" />
                            )}
                            <span className="sr-only">{subLink.title}</span>
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="flex items-center gap-4">
                          {subLink.title}
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <Link
                        key={subIndex}
                        href={subLink.href}
                        className={cn(
                          "flex items-center gap-2.5 px-2.5 py-1.5 text-[12px] font-medium rounded-md transition-all",
                          isSubActive
                            ? "text-[#1E60ED] font-bold bg-blue-50/70 dark:bg-blue-950/30"
                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/60 dark:hover:bg-slate-800/40"
                        )}
                      >
                        {subLink.icon ? (
                          <subLink.icon className="h-3.5 w-3.5 shrink-0 opacity-80" />
                        ) : (
                          <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", isSubActive ? "bg-[#1E60ED]" : "bg-slate-300 dark:bg-slate-600")} />
                        )}
                        <span className="truncate">{subLink.title}</span>
                      </Link>
                    );
                  })}
                </CollapsibleContent>
              </Collapsible>
            );
          }

          // Render Normal Link
          return isCollapsed ? (
            <Tooltip key={index} delayDuration={0}>
              <TooltipTrigger asChild>
                <Link
                  href={link.href || "#"}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
                    isActive
                      ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                      : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                >
                  <link.icon className="h-4 w-4" />
                  <span className="sr-only">{link.title}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="flex items-center gap-4">
                {link.title}
              </TooltipContent>
            </Tooltip>
          ) : (
            <Link
              key={index}
              href={link.href || "#"}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 text-[13px] font-medium rounded-lg transition-all duration-200 group select-none",
                isActive
                  ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold shadow-2xs"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100"
              )}
            >
              <link.icon
                className={cn(
                  "w-4.5 h-4.5 transition-colors shrink-0",
                  isActive
                    ? "text-[#1E60ED]"
                    : "text-slate-400 group-hover:text-slate-500 dark:group-hover:text-slate-300"
                )}
              />
              <span className="truncate">{link.title}</span>
              {!isActive && link.title !== "Dashboard" && (
                <ChevronRight className="w-3.5 h-3.5 ml-auto text-slate-300 dark:text-slate-650 group-hover:text-slate-500 transition-colors" />
              )}
            </Link>
          );
        })}

        {showLogout && (
          <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800">
            {isCollapsed ? (
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <button
                    onClick={logOutHandler}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                  >
                    <Power className="h-4 w-4" />
                    <span className="sr-only">Logout</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">Logout</TooltipContent>
              </Tooltip>
            ) : (
              <button
                onClick={logOutHandler}
                className="flex items-center gap-3 px-3 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/15 rounded-lg transition-all cursor-pointer group w-full text-left"
              >
                <Power className="w-4 h-4 text-rose-400 group-hover:text-rose-600 transition-colors" />
                <span>Log out</span>
              </button>
            )}
          </div>
        )}
      </nav>
    </div>
  );
}

