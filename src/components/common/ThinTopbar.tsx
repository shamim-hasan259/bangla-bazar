"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { useLanguage } from "@/context/LanguageContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, LogOut, LayoutDashboard, User, Truck, ShieldCheck, Headphones } from "lucide-react";

interface ThinTopbarProps {
  session: any;
}

export default function ThinTopbar({ session }: ThinTopbarProps) {
  const { language, setLanguage, t } = useLanguage();

  const handleLanguageToggle = () => {
    setLanguage(language === "en" ? "bn" : "en");
  };

  return (
    <div className="relative z-50 hidden lg:block bg-[#eaf4fe] dark:bg-slate-900/90 border-b border-[#d4e9fd] dark:border-slate-800 text-slate-700 dark:text-slate-300">
      <div className="max-w-[1200px] mx-auto px-4 xl:px-0 h-8 flex items-center justify-between text-[11.5px] font-medium tracking-tight">
        
        {/* Left: Free Shipping with truck icon */}
        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200">
          <Truck className="w-3.5 h-3.5 text-blue-600" />
          <span>{t("free_shipping")}</span>
        </div>

        {/* Center: Trust Badge */}
        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
          <span>{t("trusted_badge")}</span>
        </div>

        {/* Right Side: 24/7 Support + Seller/Auth & Language */}
        <div className="flex items-center gap-4 text-slate-600 dark:text-slate-400">
          <Link
            href="/dashboard/customer/chat"
            className="flex items-center gap-1.5 hover:text-blue-600 transition-colors cursor-pointer text-slate-700 dark:text-slate-200"
          >
            <Headphones className="w-3.5 h-3.5 text-blue-600" />
            <span>{t("customer_support")}</span>
          </Link>

          <span className="text-slate-300">|</span>

          {/* Become a Seller */}
          <Link
            href="/auth/seller/login"
            className="hover:text-blue-600 cursor-pointer transition-colors"
          >
            {t("become_seller")}
          </Link>

          <span className="text-slate-300">|</span>

          {/* Join Affiliate */}
          <Link
            href="/auth/affiliate/login"
            className="hover:text-blue-600 cursor-pointer transition-colors"
          >
            {t("join_affiliate")}
          </Link>

          {/* User Account / Auth section */}
          {session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 hover:text-blue-600 cursor-pointer transition-colors outline-none focus:outline-none py-1">
                <span className="max-w-[120px] truncate">
                  {session.user.name || session.user.email}
                </span>
                <ChevronDown className="w-3 h-3 opacity-80" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 mt-1 z-[100]">
                <div className="px-2 py-1.5 text-xs text-slate-500 font-normal truncate">
                  {session.user.name || session.user.email}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link
                    href={
                      session.user.type === "affiliate"
                        ? "/dashboard/affiliate/setting"
                        : session.user.type === "seller"
                        ? "/dashboard/seller/setting"
                        : session.user.type === "admin"
                        ? "/dashboard/admin/profile"
                        : "/dashboard/customer/setting"
                    }
                    className="flex items-center gap-2 w-full"
                  >
                    <User className="w-4 h-4 text-slate-500" />
                    <span>{t("profile")}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/dashboard" className="flex items-center gap-2 w-full">
                    <LayoutDashboard className="w-4 h-4 text-slate-500" />
                    <span>{t("dashboard")}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut()}
                  className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/10 cursor-pointer"
                >
                  <div className="flex items-center gap-2 w-full">
                    <LogOut className="w-4 h-4" />
                    <span>{t("logout")}</span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/auth/customer/login"
                className="hover:text-blue-600 cursor-pointer transition-colors"
              >
                {t("login")}
              </Link>
              <span>/</span>
              <Link
                href="/auth/customer/registration"
                className="hover:text-blue-600 cursor-pointer transition-colors"
              >
                {t("register")}
              </Link>
            </div>
          )}

          {/* Language Switcher Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 hover:text-blue-600 cursor-pointer transition-colors font-semibold text-[10.5px] bg-white/90 dark:bg-slate-800 hover:bg-white px-2.5 py-1 rounded-md border border-blue-200/70 dark:border-slate-700 text-slate-700 dark:text-slate-200 shadow-2xs outline-none">
              <span>{language === "bn" ? "বাংলা" : "English"}</span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32 mt-1 z-[100] rounded-xl p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg">
              <DropdownMenuItem
                onClick={() => setLanguage("bn")}
                className={`flex items-center justify-between cursor-pointer rounded-lg px-2.5 py-1.5 text-xs font-semibold ${
                  language === "bn" ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600" : ""
                }`}
              >
                <span>🇧🇩 বাংলা</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setLanguage("en")}
                className={`flex items-center justify-between cursor-pointer rounded-lg px-2.5 py-1.5 text-xs font-semibold ${
                  language === "en" ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600" : ""
                }`}
              >
                <span>🇺🇸 English</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
