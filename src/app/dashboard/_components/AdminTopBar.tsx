"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

// Maps admin URL segments to human-readable labels
const LABEL_MAP: Record<string, string> = {
  dashboard: "Dashboard",
  admin: "Home",
  category: "Category Management",
  create: "Add Category",
  products: "Product Management",
  accounts: "Accounts",
  campaigns: "Campaigns",
  brand: "Brand Management",
  setting: "Settings & Support",
  users: "User Management",
  vendors: "Vendor Management",
  stores: "Store Management",
  customer: "Customer Management",
  inventory: "Inventory Management",
  sales: "Sales & Financials",
  payouts: "Payouts & Escrow",
  "help-support": "Help & Support",
};

function toLabel(segment: string): string {
  return (
    LABEL_MAP[segment] ??
    segment
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

export default function AdminTopBar() {
  const pathname = usePathname();

  // Build breadcrumb segments
  const segments = pathname.split("/").filter(Boolean);

  // Build cumulative hrefs
  const crumbs = segments.map((seg, i) => ({
    label: toLabel(seg),
    href: "/" + segments.slice(0, i + 1).join("/"),
  }));

  // Remove "dashboard" from display (it's implied), keep rest
  const displayCrumbs = crumbs.filter((c) => c.label !== "Dashboard");

  return (
    <div
      className="w-full bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center shrink-0"
      style={{
        height: 40,
        paddingLeft: 20,
        paddingRight: 20,
        fontFamily: "'Inter', 'Roboto', 'Arial', sans-serif",
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
                  className="hover:text-[#1E60ED] transition-colors dark:text-slate-400 dark:hover:text-[#1E60ED]"
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

