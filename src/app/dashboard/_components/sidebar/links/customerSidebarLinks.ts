import { Cog, LayoutDashboard, HistoryIcon, HeartIcon, Award, Bell, MapPin, Wallet, RotateCcw, Star, Store, CreditCard } from "lucide-react";
import { MdHelpOutline } from "react-icons/md";
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";

export const customerSidebarLinks: any[] = [
  {
    title: "Dashboard",
    label: "",
    icon: LayoutDashboard,
    variant: "default",
    href: "/dashboard/customer",
  },
  {
    title: "Order History",
    label: "",
    icon: HistoryIcon,
    variant: "ghost",
    href: "/dashboard/customer/order-history",
  },
  {
    title: "Returns & Refunds",
    label: "",
    icon: RotateCcw,
    variant: "ghost",
    href: "/dashboard/customer/returns",
  },
  {
    title: "My Digital Wallet",
    label: "",
    icon: Wallet,
    variant: "ghost",
    href: "/dashboard/customer/wallet",
  },
  {
    title: "Payment Methods",
    label: "",
    icon: CreditCard,
    variant: "ghost",
    href: "/dashboard/customer/payment-method",
  },
  {
    title: "Address Book",
    label: "",
    icon: MapPin,
    variant: "ghost",
    href: "/dashboard/customer/addresses",
  },
  {
    title: "My Reviews",
    label: "",
    icon: Star,
    variant: "ghost",
    href: "/dashboard/customer/reviews",
  },
  {
    title: "My Wishlist",
    label: "",
    icon: HeartIcon,
    variant: "ghost",
    href: "/dashboard/customer/wishlist",
  },
  {
    title: "My Vouchers",
    label: "",
    icon: Award,
    variant: "ghost",
    href: "/dashboard/customer/vouchers",
  },
  {
    title: "Help Center",
    label: "",
    icon: MdHelpOutline,
    variant: "ghost",
    href: "/dashboard/customer/help-center",
  },
  {
    title: "Live Chat",
    label: "",
    icon: IoChatbubbleEllipsesOutline,
    variant: "ghost",
    href: "/dashboard/customer/chat",
  },
  {
    title: "Become a Seller",
    label: "Earn",
    icon: Store,
    variant: "ghost",
    href: "/auth/seller/registration",
  },
  {
    title: "Notifications",
    label: "",
    icon: Bell,
    variant: "ghost",
    href: "/dashboard/customer/notifications",
  },
  {
    title: "Setting",
    label: "",
    icon: Cog,
    variant: "ghost",
    href: "/dashboard/customer/setting",
  },
];
