import {
  Archive,
  ListOrderedIcon,
  Box,
  Move,
  AlignVerticalJustifyEnd,
  FlagTriangleLeftIcon,
  MessageCircle,
  Cog,
  File,
  LayoutDashboard,
  NotebookPenIcon,
  NotebookTabs,
  NotepadText,
  ShoppingCart,
  Users,
  Users2,
  Store,
  Copyright,
  Wallet,
  Database,
  FolderOpen,
  Percent
} from "lucide-react";

export const sellerSidebarLinks = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard/seller/",
  },
  {
    title: "Master Data",
    icon: Database,
    subLinks: [
      { title: "Products", href: "/dashboard/seller/products", icon: Archive },
      { title: "Media Center", href: "/dashboard/seller/products/media-center", icon: FolderOpen },
      { title: "Opportunity Center", href: "/dashboard/seller/products/opportunity-center", icon: Box },
      { title: "Categories", href: "/dashboard/seller/category", icon: Database },
      { title: "Suppliers", href: "/dashboard/seller/supplier", icon: Users2 },
      { title: "Customers", href: "/dashboard/seller/customer", icon: Users },
      { title: "Stores", href: "/dashboard/seller/store", icon: Store },
      { title: "Brands", href: "/dashboard/seller/brand", icon: Copyright },
      { title: "Warehouses", href: "/dashboard/seller/warehouse", icon: Users2 },
      { title: "Assortments", href: "/dashboard/seller/assortment/workbench", icon: FolderOpen },
    ]
  },
  {
    title: "Purchases",
    icon: ShoppingCart,
    subLinks: [
      { title: "PO", href: "/dashboard/seller/po", icon: File },
      { title: "GRN", href: "/dashboard/seller/grn", icon: NotepadText },
      { title: "TPN", href: "/dashboard/seller/tpn", icon: NotebookPenIcon },
      { title: "RTV", href: "/dashboard/seller/rtv", icon: NotebookPenIcon },
    ]
  },
  {
    title: "Sales",
    icon: ShoppingCart,
    subLinks: [
      { title: "Sales History", href: "/dashboard/seller/sales", icon: ShoppingCart },
      { title: "Order List", href: "/dashboard/seller/orders", icon: ListOrderedIcon },
      { title: "Live Logistics", href: "/dashboard/seller/logistics", icon: Move },
      { title: "Return Settlement", href: "/dashboard/seller/orders/returns", icon: AlignVerticalJustifyEnd },
    ]
  },
  {
    title: "Inventory",
    icon: Box,
    subLinks: [
      { title: "Current Stock", href: "/dashboard/seller/inventory", icon: Box },
      { title: "Stock Adjustment", href: "/dashboard/seller/adjust", icon: Move },
      { title: "Stock Damage", href: "/dashboard/seller/damage", icon: File },
      { title: "Stock Movement", href: "/dashboard/seller/movement", icon: AlignVerticalJustifyEnd },
    ]
  },
  {
    title: "Accounts & Escrow",
    icon: NotebookTabs,
    subLinks: [
      { title: "Ledgers", href: "/dashboard/seller/accounts", icon: NotebookTabs },
      { title: "Wallet & Payouts", href: "/dashboard/seller/wallet", icon: Wallet },
      { title: "Performance Tiers", href: "/dashboard/seller/performance", icon: FlagTriangleLeftIcon },
      { title: "Account Health", href: "/dashboard/seller/account-health", icon: File },
    ]
  },
  {
    title: "Marketing Center",
    icon: Percent,
    subLinks: [
      { title: "Dashboard", href: "/dashboard/seller/marketing", icon: Percent },
      { title: "Campaign Hub", href: "/dashboard/seller/marketing/campaigns", icon: Percent },
      { title: "Flash Sales", href: "/dashboard/seller/marketing/flash-sales", icon: Percent },
      { title: "Vouchers", href: "/dashboard/seller/marketing/vouchers", icon: Percent },
      { title: "Bundles", href: "/dashboard/seller/marketing/bundles", icon: Percent },
      { title: "Promotions", href: "/dashboard/seller/marketing/promotions", icon: Percent },
      { title: "Sponsored Products", href: "/dashboard/seller/solutions/sponsored-products", icon: Percent },
    ]
  },
  {
    title: "Communication & Reviews",
    icon: MessageCircle,
    subLinks: [
      { title: "Customer Chats", href: "/dashboard/seller/customer-communication", icon: MessageCircle },
      { title: "Review Response Hub", href: "/dashboard/seller/reviews", icon: MessageCircle },
    ]
  },
  {
    title: "Reports",
    icon: FolderOpen,
    subLinks: [
      { title: "Sales Report", href: "/dashboard/seller/sales", icon: ShoppingCart },
      { title: "Inventory Report", href: "/dashboard/seller/inventory", icon: Box },
    ]
  },
  {
    title: "Setting",
    icon: Cog,
    href: "/dashboard/seller/setting",
  },
];
