"use client";

import React from "react";
import Link from "next/link";
import { Button } from "../ui/button";
import { ChevronDown, ChevronRight, Sparkles } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface Category {
  id: string;
  name: string;
  subcategories?: Category[];
}

const CategoryNav = ({ categories = [] }: { categories?: any[] }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { t } = useLanguage();

  return (
    <div className="relative z-40 bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 hidden md:block">
      <div className="max-w-[1200px] mx-auto px-4 xl:px-0">
        <div className="flex items-center justify-between h-11">

          {/* Left: Shop by Category Blue Pill + Nav Links */}
          <div className="flex items-center gap-6">

            {/* Shop by Category button */}
            <div
              className="relative inline-block"
              onMouseEnter={() => setIsOpen(true)}
              onMouseLeave={() => setIsOpen(false)}
            >
              <button
                type="button"
                className="
                  h-10 px-3 rounded-md
                  text-slate-800 dark:text-slate-100 hover:text-blue-600
                  font-bold text-[13.5px]
                  flex items-center gap-1.5
                  transition-colors duration-150
                  cursor-pointer bg-transparent border-none outline-none
                "
              >
                <span>{t("categories") || "Shop by Category"}</span>
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-300 ease-in-out text-slate-500 ${
                    isOpen ? "rotate-180 text-blue-600" : ""
                  }`}
                />
              </button>

              {/* Custom Categories Hover Dropdown (Bridged using pt-1) */}
              {isOpen && (
                <div
                  className="absolute left-0 top-full pt-1 w-60 z-[100] animate-in fade-in-50 slide-in-from-top-1 duration-150"
                >
                  <div className="py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md max-h-[500px] overflow-y-auto">
                    {categories.length > 0 ? (
                      <div>
                        {categories.map((category) => (
                          <React.Fragment key={category.id}>
                            {category.subcategories && category.subcategories.length > 0 ? (
                              <div className="relative group/sub">
                                <div className="flex items-center justify-between py-2 px-4 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer group transition-colors text-slate-800 dark:text-slate-200 hover:text-orange-500">
                                  <span className="font-bold text-xs transition-colors">
                                    {t(category.name, category.name)}
                                  </span>
                                  <ChevronRight size={12} className="text-slate-400 group-hover:text-orange-500 transition-colors" />
                                </div>

                                {/* Subcategories dropdown (pure CSS hover) */}
                                <div className="hidden group-hover/sub:block absolute top-0 left-full w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg ml-0.5 z-[100] py-1">
                                  {category.subcategories.map((sub: any) => (
                                    <Link
                                      key={sub.id}
                                      href={`/products?category=${sub.id}`}
                                      className="flex items-center py-2 px-4 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-orange-500 transition-colors"
                                      onClick={() => setIsOpen(false)}
                                    >
                                      {t(sub.name, sub.name)}
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <Link
                                href={`/products?category=${category.id}`}
                                className="flex items-center py-2 px-4 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer text-xs font-bold text-slate-800 dark:text-slate-200 hover:text-orange-500 transition-colors"
                                onClick={() => setIsOpen(false)}
                              >
                                {t(category.name, category.name)}
                              </Link>
                            )}
                          </React.Fragment>
                        ))}

                        <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

                        <Link
                          href="/products"
                          className="flex items-center justify-center py-2 px-4 bg-orange-50/50 hover:bg-orange-50 cursor-pointer text-xs font-bold text-orange-500 transition-colors"
                          onClick={() => setIsOpen(false)}
                        >
                          {t("view_all_categories", "View All Categories")}
                        </Link>
                      </div>
                    ) : (
                      <div className="py-8 text-center text-slate-400 text-xs italic">
                        {t("no_categories_found", "No categories found")}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Nav links: Home, Shop, Deals, Contact Us */}
            <nav className="hidden lg:flex items-center gap-7 text-[13.5px] font-semibold text-slate-700 dark:text-slate-300">
              <Link href="/" className="hover:text-blue-600 transition-colors flex items-center gap-1">
                <span>{t("home")}</span>
              </Link>
              <Link href="/products" className="hover:text-blue-600 transition-colors flex items-center gap-1">
                <span>{t("shop", "Shop")}</span>
                <ChevronDown size={13} className="text-slate-400" />
              </Link>
              <Link href="/products" className="hover:text-blue-600 transition-colors flex items-center gap-1">
                <span>{t("deals", "Deals")}</span>
                <ChevronDown size={13} className="text-slate-400" />
              </Link>
              <Link href="/products" className="hover:text-blue-600 transition-colors">
                <span>{t("new_arrivals", "New Arrivals")}</span>
              </Link>
              <Link href="/dashboard/customer/chat" className="hover:text-blue-600 transition-colors">
                <span>{t("help_support")}</span>
              </Link>
            </nav>
          </div>

          {/* Right: Best Sellers Pill button matching reference design */}
          <Link
            href="/products?sort=popular"
            className="hidden lg:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#f0f7ff] hover:bg-[#e1effe] text-blue-600 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200/90 text-[12px] font-bold transition-all shadow-2xs group cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>{t("best_sellers", "Best Sellers")}</span>
          </Link>

        </div>
      </div>
    </div>
  );
};
export default CategoryNav;