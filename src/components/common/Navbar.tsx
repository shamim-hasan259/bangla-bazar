import Link from "next/link";
import Image from "next/image";
import { getServerSession } from "next-auth";
import { LogIn, Menu, ChevronDown, User } from "lucide-react";
import { CgProfile } from "react-icons/cg";

import { authOptions } from "@/lib/auth";
import prisma from "@/index";

import WishListDrawer from "../home/WishListSheet";
import CartSheet from "../home/CartSheet";
import CategoryNav from "../home/CategoryNav";
import CompareNavbarButton from "./CompareNavbarButton";

import { Button } from "../ui/button";
import Logo from "./Logo";
import SearchBar from "./SearchBar";
import MobileNav from "./MobileNav";
import NotificationBell from "./NotificationBell";
import ThinTopbar from "./ThinTopbar";

async function Navbar() {
  const data = await getServerSession(authOptions);

  const categories = await prisma.category.findMany({
    where: {
      status: "Active",
      parentId: { not: null },
    },
    include: {
      _count: {
        select: { products: true },
      },
    },
  });

  return (
    <>
      <ThinTopbar session={data} />
      <header className="sticky top-0 z-50 bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 shadow-2xs w-full">
        <div className="max-w-[1200px] mx-auto px-4 xl:px-0">
          <div className="h-[68px] sm:h-[76px] flex items-center justify-between gap-4 md:gap-8">

            {/* Left Column: Brand Logo + Menu */}
            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
              {/* Hamburger Mobile Menu */}
              <div className="lg:hidden text-slate-700 dark:text-slate-300">
                <MobileNav categories={categories} />
              </div>

              {/* Logo (Direct rendering, scaled dynamically for small devices to prevent overflow) */}
              <Logo className="shrink-0" />
            </div>

            {/* Middle Column: SearchBar (Hidden on mobile, centered on tablet+) */}
            <div className="hidden md:flex flex-1 justify-center max-w-[620px] lg:max-w-[700px]">
              <div className="w-full">
                <SearchBar />
              </div>
            </div>

            {/* Right Column: User Account, Wishlist & Cart Actions */}
            <div className="flex items-center gap-2 md:gap-4 shrink-0">
              {/* Account Selector */}
              {!data?.user ? (
                <Link
                  href="/auth/customer/login"
                  className="flex items-center gap-1.5 py-1 px-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:text-blue-600 transition-colors group cursor-pointer"
                >
                  <User className="w-5 h-5 text-slate-700 dark:text-slate-300 group-hover:text-blue-600 transition-colors" />
                  <span className="hidden sm:inline text-[13px] font-medium">Account</span>
                </Link>
              ) : (
                <Link
                  href="/dashboard"
                  className="flex items-center gap-1.5 py-1 px-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:text-blue-600 transition-colors group cursor-pointer"
                >
                  {data?.user?.image ? (
                    <Image
                      src={data?.user?.image}
                      alt="Profile"
                      width={22}
                      height={22}
                      className="rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                    />
                  ) : (
                    <CgProfile className="text-xl text-slate-700 dark:text-slate-300 group-hover:text-blue-600 transition-colors" />
                  )}
                  <span className="hidden sm:inline text-[13px] font-medium max-w-[85px] truncate">
                    {data?.user?.name ? data.user.name.split(" ")[0] : "Account"}
                  </span>
                </Link>
              )}

              {/* Wishlist with Label & Badge */}
              <WishListDrawer showLabel={true} triggerClassName="hidden sm:flex" />

              {/* Cart with Label & Badge */}
              <CartSheet showLabel={true} />

              {/* Compare Button */}
              <CompareNavbarButton showLabel={false} className="hidden lg:flex" />
            </div>
          </div>

          {/* 3. Mobile-only search row (Padded and formatted nicely for fluid layouts) */}
          <div className="md:hidden pb-3.5 pt-0.5 px-0.5">
            <SearchBar />
          </div>

        </div>
      </header>

      {/* 4. Categories Navigation Bar (Not sticky, scrolls away) */}
      <CategoryNav categories={categories} />
    </>
  );
}

export default Navbar;