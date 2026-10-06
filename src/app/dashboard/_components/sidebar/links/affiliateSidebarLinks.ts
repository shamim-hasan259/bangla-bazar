import {
  LayoutDashboard,
  Link as LinkIcon,
  DollarSign,
  Users,
  Wallet,
  Image as ImageIcon,
  Settings,
  Percent,
} from "lucide-react";

export const affiliateSidebarLinks = [
  {
    title: "Overview",
    icon: LayoutDashboard,
    href: "/dashboard/affiliate",
  },
  {
    title: "Link Generator",
    icon: LinkIcon,
    href: "/dashboard/affiliate/links",
  },
  {
    title: "Earnings & Commission",
    icon: DollarSign,
    href: "/dashboard/affiliate/earnings",
  },
  {
    title: "Referral Orders",
    icon: Users,
    href: "/dashboard/affiliate/referrals",
  },
  {
    title: "Wallet & Payouts",
    icon: Wallet,
    href: "/dashboard/affiliate/wallet",
  },
  {
    title: "Marketing Assets",
    icon: ImageIcon,
    href: "/dashboard/affiliate/banners",
  },
  {
    title: "Settings & Profile",
    icon: Settings,
    href: "/dashboard/affiliate/setting",
  },
];
