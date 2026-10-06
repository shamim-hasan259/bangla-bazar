import {
  Archive,
  Box,
  Cog,
  LayoutDashboard,
  Users,
  LucideIcon,
  Settings,
  Image,
  Store,
  Percent,
  Wallet,
  ShieldCheck,
  FileText,
} from "lucide-react";

export type SidebarLink = {
  title: string;
  label?: string;
  icon: LucideIcon;
  variant: "default" | "ghost";
  href?: string;
  header?: string; // Optional header for grouping
  subLinks?: { title: string; href: string; icon?: LucideIcon }[];
} | null;

export const getAdminSidebarLinks = (userType?: string): SidebarLink[] => [
  {
    title: "Dashboard",
    label: "",
    icon: LayoutDashboard,
    variant: "default",
    href: "/dashboard/admin",
    header: "Overview",
  },

  // Catalog Dropdown
  {
    title: "Catalog",
    icon: Archive,
    variant: "ghost",
    header: "Catalog",
    subLinks: [
      { title: "Products", href: "/dashboard/admin/products", icon: Box },
      { title: "Category", href: "/dashboard/admin/category", icon: Box },
    ],
  },

  // Marketplace Dropdown
  {
    title: "Marketplace",
    icon: Store,
    variant: "ghost",
    header: "Marketplace",
    subLinks: [
      { title: "Vendors", href: "/dashboard/admin/vendors", icon: Store },
      { title: "Stores", href: "/dashboard/admin/stores", icon: Store },
      { title: "Payout Requests", href: "/dashboard/admin/payouts", icon: Wallet },
    ],
  },

  // Dedicated Escrow Management Dropdown
  {
    title: "Escrow Management",
    icon: ShieldCheck,
    variant: "ghost",
    header: "Escrow Management",
    subLinks: [
      { title: "Release & Withdraw", href: "/dashboard/admin/escrow", icon: Wallet },
      { title: "Escrow Ledger", href: "/dashboard/admin/escrow/ledger", icon: FileText },
    ],
  },

  // Management
  {
    title: "Management",
    icon: Users,
    variant: "ghost",
    header: "Management",
    subLinks: [
      { title: "Customers", href: "/dashboard/admin/customer", icon: Users },
    ],
  },

  // Marketing
  {
    title: "Marketing",
    icon: Percent,
    variant: "ghost",
    header: "Marketing",
    subLinks: [
      { title: "Campaigns", href: "/dashboard/admin/campaigns", icon: Box },
      { title: "Flash Sales", href: "/dashboard/admin/flash-sales", icon: Box },
    ],
  },

  // Settings
  {
    title: "System",
    icon: Cog,
    variant: "ghost",
    header: "System",
    subLinks: [
      { title: "Admin Profile", href: "/dashboard/admin/profile", icon: Users },
      { title: "Homepage Layout", href: "/dashboard/admin/homepage", icon: Settings },
      { title: "Banners", href: "/dashboard/admin/banner", icon: Image },
      { title: "Settings", href: "/dashboard/admin/setting", icon: Settings },
    ],
  },
];
