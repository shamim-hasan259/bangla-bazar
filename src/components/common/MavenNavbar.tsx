"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Logo from "./Logo";
import SearchBar from "./SearchBar";
import { useSession, signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSelector } from "react-redux";
import { RootState } from "@/app/redux-store/store";
import { cn } from "@/lib/utils";
import axios from "axios";
import { useLanguage } from "@/context/LanguageContext";
import {
  Search,
  ShoppingCart,
  Heart,
  GitCompare,
  Menu,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  X,
  Globe,
  HelpCircle,
  Store,
  TrendingUp,
  User,
  LayoutDashboard,
  LogOut,
  Check,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  highlight?: boolean;
  bold?: boolean;
  children?: { label: string; href: string }[];
}

const FALLBACK_NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "All Categories", href: "/products" },
];

function NavDropdown({ item }: { item: NavItem }) {
  const [open, setOpen] = useState(false);
  const timeout = useRef<NodeJS.Timeout | null>(null);

  const enter = () => {
    if (timeout.current) clearTimeout(timeout.current);
    setOpen(true);
  };
  const leave = () => {
    timeout.current = setTimeout(() => setOpen(false), 120);
  };
  useEffect(() => () => {
    if (timeout.current) clearTimeout(timeout.current);
  }, []);

  const hasChildren = item.children && item.children.length > 0;

  if (!hasChildren) {
    return (
      <Link
        href={item.href}
        className={[
          "flex items-center gap-[3px] text-xs sm:text-[13px] py-1 px-1 whitespace-nowrap transition-colors duration-150 shrink-0",
          item.href === "/" ? "text-slate-900 dark:text-white font-extrabold" : "text-slate-700 hover:text-black dark:hover:text-white",
          item.bold ? "font-extrabold" : "font-semibold",
          item.highlight ? "text-rose-600 hover:text-rose-700" : "",
        ].join(" ")}
      >
        <span>{item.label}</span>
      </Link>
    );
  }

  return (
    <div className="relative shrink-0" onMouseEnter={enter} onMouseLeave={leave}>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Link
            href={item.href}
            className={[
              "flex items-center gap-[3px] text-xs sm:text-[13px] py-1 px-1 whitespace-nowrap transition-colors duration-150 outline-none select-none cursor-pointer",
              item.href === "/" ? "text-slate-900 dark:text-white font-extrabold" : "text-slate-700 hover:text-black dark:hover:text-white",
              item.bold ? "font-extrabold" : "font-semibold",
              item.highlight ? "text-rose-600 hover:text-rose-700" : "",
            ].join(" ")}
          >
            <span>{item.label}</span>
            <ChevronDown
              size={11}
              className={
                "mt-[1px] opacity-60 transition-transform duration-200 " +
                (open ? "rotate-180" : "")
              }
            />
          </Link>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          sideOffset={8}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-xl min-w-[210px] max-h-[350px] overflow-y-auto py-1.5 px-1 space-y-0.5 z-[100]"
          onMouseEnter={enter}
          onMouseLeave={leave}
        >
          {item.children!.map((c) => (
            <DropdownMenuItem key={c.label + c.href} asChild className="p-0">
              <Link
                href={c.href}
                className="flex items-center justify-between px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-black dark:hover:text-white rounded-lg transition-colors group/item cursor-pointer w-full"
                onClick={() => setOpen(false)}
              >
                <span className="truncate">{c.label}</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all text-slate-500 shrink-0 ml-1" />
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function CategoryNavSlider({ items }: { items: NavItem[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 6);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 6);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [items]);

  const slide = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -260 : 260;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
      setTimeout(checkScroll, 350);
    }
  };

  return (
    <div className="relative group/navslider flex items-center w-full">
      {/* Left scroll arrow */}
      {canScrollLeft && (
        <div className="absolute left-0 top-0 bottom-0 z-10 flex items-center pr-3 bg-gradient-to-r from-white via-white/95 to-transparent dark:from-slate-950 dark:via-slate-950/95 dark:to-transparent">
          <button
            type="button"
            onClick={() => slide("left")}
            aria-label="Slide left"
            className="w-6 h-6 rounded-full bg-white dark:bg-slate-800 shadow-md border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 hover:text-black dark:hover:text-white transition-all cursor-pointer active:scale-90"
          >
            <ChevronLeft size={13} />
          </button>
        </div>
      )}

      {/* Nav items list */}
      <nav
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex items-center gap-5 xl:gap-6 py-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] scroll-smooth w-full select-none"
      >
        {items.map((item) => (
          <NavDropdown key={item.label + item.href} item={item} />
        ))}
      </nav>

      {/* Right scroll arrow */}
      {canScrollRight && (
        <div className="absolute right-0 top-0 bottom-0 z-10 flex items-center pl-3 bg-gradient-to-l from-white via-white/95 to-transparent dark:from-slate-950 dark:via-slate-950/95 dark:to-transparent">
          <button
            type="button"
            onClick={() => slide("right")}
            aria-label="Slide right"
            className="w-6 h-6 rounded-full bg-white dark:bg-slate-800 shadow-md border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 hover:text-black dark:hover:text-white transition-all cursor-pointer active:scale-90"
          >
            <ChevronRight size={13} />
          </button>
        </div>
      )}
    </div>
  );
}

function MobileDrawer({
  open,
  onClose,
  items,
}: {
  open: boolean;
  onClose: () => void;
  items: NavItem[];
}) {
  const { data: session } = useSession();
  const { language, setLanguage, t } = useLanguage();
  const user = session?.user as any;
  const userType = user?.type?.toLowerCase();
  const dashboardHref =
    ["admin", "manager", "marketing", "sales", "stuff"].includes(userType)
      ? "/dashboard/admin"
      : ["seller", "vendor"].includes(userType)
      ? "/dashboard/seller"
      : "/dashboard/customer";

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-50 transition-opacity backdrop-blur-[2px]"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          "fixed top-0 left-0 h-full w-72 bg-white dark:bg-slate-900 z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
          <Logo />
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-500 hover:text-black dark:hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Mobile Language Switcher Row */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <Globe className="w-3.5 h-3.5 text-blue-600" />
            <span>ভাষা / Language:</span>
          </div>
          <div className="flex items-center bg-white dark:bg-slate-900 rounded-lg p-0.5 border border-slate-200 dark:border-slate-800 shadow-2xs">
            <button
              onClick={() => setLanguage("bn")}
              className={cn(
                "px-2.5 py-1 text-[11px] font-bold rounded-md transition-all",
                language === "bn"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-black"
              )}
            >
              বাংলা
            </button>
            <button
              onClick={() => setLanguage("en")}
              className={cn(
                "px-2.5 py-1 text-[11px] font-bold rounded-md transition-all",
                language === "en"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-black"
              )}
            >
              EN
            </button>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {items.map((item) => (
            <div key={item.label}>
              <Link
                href={item.href}
                className={
                  "flex items-center justify-between px-4 py-2.5 text-xs font-semibold rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors " +
                  (item.href === "/" ? "text-slate-900 dark:text-white font-extrabold" : "text-slate-800 dark:text-slate-200")
                }
                onClick={onClose}
              >
                <span>{item.label}</span>
                {item.children && <ChevronDown size={13} className="text-slate-400" />}
              </Link>
              {item.children && (
                <div className="pl-4 space-y-1 my-1">
                  {item.children.map((c) => (
                    <Link
                      key={c.label + c.href}
                      href={c.href}
                      className="block px-4 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white transition-colors font-medium truncate"
                      onClick={onClose}
                    >
                      {c.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {session?.user ? (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col gap-2.5">
            <div className="flex items-center gap-3 p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
              <Avatar className="w-10 h-10 border border-slate-200 dark:border-slate-700 shrink-0">
                <AvatarImage src={user?.image || user?.photo || ""} alt={user?.name || "User"} />
                <AvatarFallback className="bg-slate-900 text-white font-bold text-xs">
                  {user?.name ? user.name.slice(0, 2).toUpperCase() : "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{user?.name || "User"}</div>
                <div className="text-[10px] text-slate-400 truncate">{user?.email || ""}</div>
              </div>
            </div>
            <Link
              href={dashboardHref}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-lg transition-colors shadow-xs"
              onClick={onClose}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>{t("dashboard")}</span>
            </Link>
            <button
              onClick={() => {
                onClose();
                signOut({ callbackUrl: "/" });
              }}
              className="w-full flex items-center justify-center gap-2 py-2 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 font-bold text-xs rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors border border-rose-200/60 dark:border-rose-900/40 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>{t("logout")}</span>
            </button>
          </div>
        ) : (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col gap-2">
            <Link
              href="/auth/customer/login"
              className="w-full text-center py-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold text-xs rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              onClick={onClose}
            >
              {t("login")}
            </Link>
            <Link
              href="/auth/customer/registration"
              className="w-full text-center py-2 bg-slate-900 text-white font-bold text-xs rounded hover:bg-black transition-colors shadow-xs"
              onClick={onClose}
            >
              {t("register")}
            </Link>
          </div>
        )}
      </div>
    </>
  );
}

export default function MavenNavbar({ cartCount }: { cartCount?: number }) {
  const { data: session } = useSession();
  const { language, setLanguage, t } = useLanguage();
  const user = session?.user as any;
  const userType = user?.type?.toLowerCase();
  const dashboardHref =
    ["admin", "manager", "marketing", "sales", "stuff"].includes(userType)
      ? "/dashboard/admin"
      : ["seller", "vendor"].includes(userType)
      ? "/dashboard/seller"
      : "/dashboard/customer";

  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [navCategories, setNavCategories] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;
    const fetchNavCategories = async () => {
      try {
        const res = await axios.get("/api/category");
        if (isMounted && Array.isArray(res.data)) {
          setNavCategories(res.data);
        }
      } catch (e) {
        console.error("Error fetching navbar categories:", e);
      }
    };
    fetchNavCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  const compareItems = useSelector((state: RootState) => state.compare?.items || []);
  const wishlistItems = useSelector((state: RootState) => state.wishlist?.items || []);
  const cartItems = useSelector((state: RootState) => state.cart?.items || []);
  const reduxTotalQuantity = useSelector((state: RootState) => state.cart?.totalQuantity || 0);

  useEffect(() => {
    setMounted(true);

    const handleScroll = () => {
      if (window.scrollY > 30) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const fallbackNavItems: NavItem[] = [
    { label: t("home"), href: "/" },
    { label: t("all_categories"), href: "/products" },
  ];

  const navItems: NavItem[] = navCategories.length > 0 ? [
    { label: t("home"), href: "/" },
    {
      label: t("all_categories"),
      href: "/products",
      children: navCategories.map((c) => ({
        label: t(c.name, c.name),
        href: `/products?category=${c.id}`,
      })),
    },
    ...navCategories.map((cat) => ({
      label: t(cat.name, cat.name),
      href: `/products?category=${cat.id}`,
      children: (cat.subcategories || []).map((sub: any) => ({
        label: t(sub.name, sub.name),
        href: `/products?category=${sub.id}`,
      })),
    })),
  ] : fallbackNavItems;

  const totalCartCount = cartCount !== undefined ? cartCount : (reduxTotalQuantity || cartItems.length);
  const compareCount = mounted ? compareItems.length : 0;
  const wishlistCount = mounted ? wishlistItems.length : 0;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      window.location.href = "/products?search=" + encodeURIComponent(searchValue.trim());
    }
  };

  return (
    <>
      {/* 1. Top Utility Header Bar (Scrolls away naturally) */}
      <div className="w-full bg-slate-50 dark:bg-slate-900 border-b border-slate-200/60 dark:border-slate-800 text-[11px] font-medium text-slate-600 dark:text-slate-400 py-1.5">
        <div className="w-full max-w-[1200px] mx-auto px-4 xl:px-0 flex items-center justify-between">
          
          {/* Left: Language Selector */}
          <div className="flex items-center gap-4">
            {/* Language Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1.5 cursor-pointer hover:text-black dark:hover:text-white transition-colors outline-none focus:outline-none select-none py-0.5 font-semibold text-slate-800 dark:text-slate-200">
                <Globe className="w-3.5 h-3.5 text-black dark:text-white" />
                <span>{language === "bn" ? "বাংলা" : "English"}</span>
                <ChevronDown className="w-3 h-3 text-black dark:text-white opacity-80" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-36 mt-1 z-50 rounded-2xl p-1 shadow-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <DropdownMenuItem
                  onClick={() => setLanguage("bn")}
                  className={cn(
                    "flex items-center justify-between cursor-pointer rounded-xl px-3 py-2 text-xs font-medium transition-colors",
                    language === "bn"
                      ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold"
                      : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-sm">🇧🇩</span> বাংলা
                  </span>
                  {language === "bn" && <Check className="w-3.5 h-3.5 text-blue-600" />}
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => setLanguage("en")}
                  className={cn(
                    "flex items-center justify-between cursor-pointer rounded-xl px-3 py-2 text-xs font-medium transition-colors",
                    language === "en"
                      ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold"
                      : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-sm">🇺🇸</span> English
                  </span>
                  {language === "en" && <Check className="w-3.5 h-3.5 text-blue-600" />}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Right: Quick Links */}
          <div className="flex items-center gap-4 sm:gap-6">
            <Link href="/help" className="flex items-center gap-1.5 hover:text-black dark:hover:text-white transition-colors text-slate-800 dark:text-slate-200">
              <HelpCircle className="w-3.5 h-3.5 text-black dark:text-white" />
              <span>{t("help")}</span>
            </Link>
            <Link href="/auth/seller/login" className="flex items-center gap-1.5 hover:text-black dark:hover:text-white transition-colors text-slate-800 dark:text-slate-200">
              <Store className="w-3.5 h-3.5 text-black dark:text-white" />
              <span>{t("start_seller")}</span>
            </Link>
            <Link href="/auth/affiliate/login" className="flex items-center gap-1.5 hover:text-black dark:hover:text-white transition-colors text-slate-800 dark:text-slate-200">
              <TrendingUp className="w-3.5 h-3.5 text-black dark:text-white" />
              <span>{t("join_affiliate")}</span>
            </Link>
          </div>

        </div>
      </div>

      {/* 2. Main Center Header Bar (Sticky / Fixed when scrolling) */}
      <header
        className={cn(
          "sticky top-0 z-50 w-full bg-white dark:bg-slate-950 transition-shadow duration-200",
          isScrolled ? "shadow-md" : "shadow-xs"
        )}
      >
        <div className="w-full bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 py-3 sm:py-3.5">
          <div className="w-full max-w-[1200px] mx-auto px-4 xl:px-0 flex items-center justify-between gap-3 sm:gap-6">

            {/* Left: Mobile Menu + Brand Logo */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden text-slate-700 dark:text-slate-200 hover:text-black p-1.5 rounded transition-colors"
                aria-label="Toggle Mobile Menu"
              >
                <Menu className="w-6 h-6" />
              </button>
              <Logo />
            </div>

            {/* Center: Search Box */}
            <div className="hidden md:flex items-center flex-1 max-w-xl">
              <SearchBar />
            </div>

            {/* Right: Compare, Wishlist, Cart & Auth Buttons */}
            <div className="flex items-center gap-3 sm:gap-5 shrink-0">
              
              {/* Compare Item */}
              <Link
                href="/compare"
                className="flex flex-col items-center group relative text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white transition-colors"
              >
                <div className="relative">
                  <GitCompare className="w-5 h-5 text-slate-700 dark:text-slate-300 group-hover:text-black dark:group-hover:text-white transition-colors" />
                  <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white text-[9px] font-extrabold h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center leading-none shadow-xs">
                    {compareCount}
                  </span>
                </div>
                <span className="text-[10px] font-semibold mt-0.5 text-slate-500 group-hover:text-black dark:group-hover:text-white hidden sm:block">
                  {t("compare")}
                </span>
              </Link>

              {/* Wishlist Item */}
              <Link
                href="/wishlist"
                className="flex flex-col items-center group relative text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white transition-colors"
              >
                <div className="relative">
                  <Heart className="w-5 h-5 text-slate-700 dark:text-slate-300 group-hover:text-black dark:group-hover:text-white transition-colors" />
                  <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white text-[9px] font-extrabold h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center leading-none shadow-xs">
                    {wishlistCount}
                  </span>
                </div>
                <span className="text-[10px] font-semibold mt-0.5 text-slate-500 group-hover:text-black dark:group-hover:text-white hidden sm:block">
                  {t("wishlist")}
                </span>
              </Link>

              {/* Cart Item */}
              <Link
                href="/cart"
                className="flex flex-col items-center group relative text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white transition-colors"
              >
                <div className="relative">
                  <ShoppingCart className="w-5 h-5 text-slate-700 dark:text-slate-300 group-hover:text-black dark:group-hover:text-white transition-colors" />
                  <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white text-[9px] font-extrabold h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center leading-none shadow-xs">
                    {totalCartCount}
                  </span>
                </div>
                <span className="text-[10px] font-semibold mt-0.5 text-slate-500 group-hover:text-black dark:group-hover:text-white hidden sm:block">
                  {t("cart")}
                </span>
              </Link>

              {/* Divider */}
              <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block" />

              {/* Login & SignUp or User Profile Dropdown */}
              {session?.user ? (
                <div className="hidden sm:flex items-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center gap-2 py-1 px-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all outline-none focus:outline-none cursor-pointer border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900">
                      <Avatar className="w-7 h-7 border border-slate-200 dark:border-slate-700 shrink-0">
                        <AvatarImage src={user?.photo || user?.image || ""} alt={user?.name || "User"} className="object-cover" />
                        <AvatarFallback className="bg-blue-600 text-white font-bold text-[10px]">
                          {user?.name ? user.name.slice(0, 2).toUpperCase() : "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="hidden md:flex flex-col text-left pr-0.5">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 max-w-[100px] truncate leading-tight">
                          {user?.name || t("my_account")}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium capitalize leading-none mt-0.5">
                          {user?.type || "Customer"}
                        </span>
                      </div>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 mt-2 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-1.5">
                      <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user?.name || "User"}</p>
                        <p className="text-[11px] text-slate-400 truncate">{user?.email || ""}</p>
                      </div>
                      <DropdownMenuItem asChild className="cursor-pointer rounded-lg">
                        <Link href={dashboardHref} className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-black dark:hover:text-white transition-colors">
                          <LayoutDashboard className="w-4 h-4 text-black dark:text-white" />
                          <span>{t("dashboard")}</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="cursor-pointer rounded-lg">
                        <Link href={userType === "admin" ? "/dashboard/admin/profile" : userType === "seller" ? "/dashboard/seller/setting" : "/dashboard/customer/setting"} className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                          <User className="w-4 h-4 text-slate-500" />
                          <span>{t("profile")}</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="my-1 border-slate-100 dark:border-slate-800" />
                      <DropdownMenuItem
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="text-rose-600 focus:text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-950/20 cursor-pointer rounded-lg flex items-center gap-2.5 px-3 py-2 text-xs font-semibold"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>{t("logout")}</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Link
                    href="/auth/customer/login"
                    className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:bg-slate-200 font-extrabold text-xs px-4 py-2 rounded transition-colors"
                  >
                    {t("login")}
                  </Link>
                  <Link
                    href="/auth/customer/registration"
                    className="bg-slate-900 hover:bg-black text-white font-extrabold text-xs px-4 py-2 rounded transition-colors shadow-xs"
                  >
                    {t("register")}
                  </Link>
                </div>
              )}

            </div>

          </div>
        </div>

        {/* Mobile Search Bar Row (Shown on small screens) */}
        <div className="block md:hidden px-4 py-2.5 bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800">
          <SearchBar />
        </div>
      </header>

      {/* 3. Bottom Category Links Navigation Bar (Scrolls away naturally) */}
      <div className="hidden lg:block w-full bg-white dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800 relative z-40">
        <div className="w-full max-w-[1200px] mx-auto px-4 xl:px-0">
          <CategoryNavSlider items={navItems} />
        </div>
      </div>

      {/* Mobile Drawer */}
      <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} items={navItems} />
    </>
  );
}