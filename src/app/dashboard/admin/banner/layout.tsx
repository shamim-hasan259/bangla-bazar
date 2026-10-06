"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Image, Sliders, Layout, Percent } from "lucide-react";
import PageTitle from "@/components/ui/PageTitle";

interface BannerLayoutProps {
  children: React.ReactNode;
}

export default function BannerLayout({ children }: BannerLayoutProps) {
  const pathname = usePathname();

  const tabs = [
    {
      name: "Main Slider",
      href: "/dashboard/admin/banner/slider",
      icon: Sliders,
      description: "Manage homepage carousel sliders",
    },
    {
      name: "Right Promo Banner",
      href: "/dashboard/admin/banner/right",
      icon: Image,
      description: "Manage top-right static promo",
    },
    {
      name: "Bottom Promo Banner",
      href: "/dashboard/admin/banner/bottom",
      icon: Percent,
      description: "Manage bottom horizontal banner",
    },
  ];

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 max-w-7xl mx-auto w-full">
      {/* Premium Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b pb-5">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Layout className="h-8 w-8 text-primary" />
            Banner Management
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            personalize and manage the marketing and promotional content sections on the home page.
          </p>
        </div>
      </div>

      {/* Sub Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "group relative rounded-xl border p-4 transition-all duration-300 flex items-center gap-4 hover:shadow-md",
                isActive
                  ? "bg-primary/5 border-primary shadow-sm text-primary"
                  : "bg-card border-border hover:border-primary/50 text-card-foreground"
              )}
            >
              <div
                className={cn(
                  "p-3 rounded-xl transition-all duration-300",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex flex-col text-left">
                <span className="font-semibold text-sm tracking-tight transition-colors">
                  {tab.name}
                </span>
                <span className="text-xs text-muted-foreground line-clamp-1">
                  {tab.description}
                </span>
              </div>
              {isActive && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="mt-6 transition-opacity duration-300">
        {children}
      </div>
    </div>
  );
}
