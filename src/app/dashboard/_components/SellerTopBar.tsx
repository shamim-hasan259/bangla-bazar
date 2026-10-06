"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { useSellerStore } from "@/context/SellerStoreContext";

// Maps URL segments to human-readable labels (matches Daraz naming)
const LABEL_MAP: Record<string, string> = {
  dashboard:  "Dashboard",
  seller:     "Home",
  products:   "Products",
  create:     "Add Products",
  orders:     "Orders and Reviews",
  store:      "Store",
  wallet:     "Finance",
  setting:    "Setting and Support",
  customer:   "My Account",
  brand:      "Brand Management",
  media:      "Media Center",
};

function toLabel(segment: string): string {
  return (
    LABEL_MAP[segment] ??
    segment
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

export default function SellerTopBar() {
  const pathname = usePathname();
  const { storeData } = useSellerStore();

  // Build breadcrumb segments
  // e.g. /dashboard/seller/products/create
  // → ["dashboard","seller","products","create"]
  const segments = pathname.split("/").filter(Boolean);

  // Build cumulative hrefs
  const crumbs = segments.map((seg, i) => {
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(seg);
    const label = isMongoId ? (storeData?.storeNameEn || "Store") : toLabel(seg);
    return {
      label,
      href: "/" + segments.slice(0, i + 1).join("/"),
    };
  });

  // Remove "dashboard" from display (it's implied), keep rest
  const displayCrumbs = crumbs.filter((c) => c.label !== "Dashboard");

  // Replace "Home" with actual "Home" label at index 0
  // The last crumb is the current page (not a link)
  return (
    <div
      className="w-full bg-slate-100   dark:border-slate-800 flex items-center shrink-0"
      style={{
        height: 40,
        paddingLeft: 20,
        paddingRight: 20,
        fontFamily: "'Roboto', 'Arial', sans-serif",
      }}
    >
      <nav className="flex items-center" aria-label="Breadcrumb">
        {displayCrumbs.map((crumb, index) => {
          const isLast = index === displayCrumbs.length - 1;

          return (
            <React.Fragment key={crumb.href}>
              {isLast ? (
                /* Current page — bold, dark, not a link */
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#212121",
                  }}
                  className="dark:text-white"
                >
                  {crumb.label}
                </span>
              ) : (
                /* Ancestor — link, muted */
                <Link
                  href={crumb.href}
                  style={{
                    fontSize: 13,
                    fontWeight: 400,
                    color: "#757575",
                    textDecoration: "none",
                  }}
                  className="hover:text-[#F85606] transition-colors dark:text-slate-400 dark:hover:text-[#F85606]"
                >
                  {crumb.label}
                </Link>
              )}

              {/* Separator */}
              {!isLast && (
                <ChevronRight
                  style={{
                    width: 13,
                    height: 13,
                    color: "#bdbdbd",
                    margin: "0 4px",
                    flexShrink: 0,
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </nav>
    </div>
  );
}
