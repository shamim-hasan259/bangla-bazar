"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";

import watchImg from "@/assets/smart-watch.png";
import laptopsImg from "@/assets/categories/laptops.png";
import electronicsImg from "@/assets/categories/electronics.png";

const FRIDGE_IMG = "https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=400&q=80";
const COOKWARE_IMG = "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80";

export default function TriplePromoBanners() {
  const { t } = useLanguage();
  const [fridgeSrc, setFridgeSrc] = useState<any>(FRIDGE_IMG);
  const [cookwareSrc, setCookwareSrc] = useState<any>(COOKWARE_IMG);

  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 xl:px-0 my-4 sm:my-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 items-stretch">

        {/* Card 1: Magenta / Fridge Banner */}
        <div className="bg-[#881337] rounded overflow-hidden p-4 sm:p-5 flex items-center justify-between text-white shadow-xs min-h-[160px] sm:min-h-[175px] relative group">
          {/* Left Text Content */}
          <div className="flex flex-col justify-center z-10 max-w-[160px] sm:max-w-[170px]">
            <span className="text-[#fde047] font-serif font-bold text-xs sm:text-sm tracking-wide">
              [ {t("free_shipping", "Free Shipping")} ]
            </span>
            <h4 className="font-extrabold text-xs sm:text-sm text-white uppercase leading-tight mt-1 mb-3 tracking-wide">
              {t("with_buying_fridge", "WITH BUYING FRIDGE")}
            </h4>
            <Link
              href="/products?category=home"
              className="bg-white text-[#881337] hover:bg-slate-100 text-[10px] sm:text-[11px] font-extrabold px-3.5 py-1.5 rounded shadow-xs w-fit transition-transform active:scale-95 uppercase tracking-wider"
            >
              {t("shop_now", "Shop Now")}
            </Link>
          </div>

          {/* Right Product Image */}
          <div className="relative w-28 sm:w-36 h-32 sm:h-36 shrink-0 flex items-center justify-center">
            <Image
              src={fridgeSrc}
              alt="Freeshipping with buying fridge"
              fill
              className="object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-300"
              onError={() => setFridgeSrc(electronicsImg)}
            />
          </div>
        </div>

        {/* Card 2: Black / Cookware Split Banner */}
        <div className="bg-slate-900 rounded overflow-hidden flex items-stretch text-white shadow-xs min-h-[160px] sm:min-h-[175px] relative group border border-slate-800">
          {/* Left Angled Image Container */}
          <div
            className="w-5/12 relative overflow-hidden bg-black"
            style={{
              clipPath: "polygon(0 0, 100% 0, 75% 100%, 0 100%)",
            }}
          >
            <Image
              src={cookwareSrc}
              alt="Discount 20% off cookware"
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
              onError={() => setCookwareSrc(laptopsImg)}
            />
          </div>

          {/* Right Dark Content Area */}
          <div className="w-7/12 p-4 sm:p-5 flex flex-col justify-center z-10 -ml-3">
            <h4 className="font-black text-xs sm:text-sm text-white uppercase tracking-tight leading-tight">
              {t("discount", "DISCOUNT")} <span className="text-[#fde047] font-extrabold">[ 20% ]</span> {t("off", "OFF")}
            </h4>
            <p className="text-[10px] sm:text-[11px] text-slate-300 font-medium leading-snug mt-1 mb-3">
              {t("sale_up_to_60", "Sale up to 60% on 50+ products in clude wedding flower")}
            </p>
            <Link
              href="/products?category=home"
              className="bg-white text-slate-900 hover:bg-slate-100 text-[10px] sm:text-[11px] font-extrabold px-3.5 py-1.5 rounded shadow-xs w-fit transition-transform active:scale-95 uppercase tracking-wider"
            >
              {t("explore_now", "Explore Now")}
            </Link>
          </div>
        </div>

        {/* Card 3: Dark Brown / Smart Watch Banner */}
        <div className="bg-[#451a03] rounded overflow-hidden p-4 sm:p-5 flex items-center justify-between text-white shadow-xs min-h-[160px] sm:min-h-[175px] relative group">
          {/* Left Text Content */}
          <div className="flex flex-col justify-center z-10 max-w-[150px] sm:max-w-[165px]">
            <span className="text-amber-200/90 font-serif italic text-xs sm:text-sm">
              {t("spring_season", "Spring Season")}
            </span>
            <h4 className="font-extrabold text-[11px] sm:text-xs text-white uppercase leading-tight mt-1 mb-3 tracking-tight">
              <span className="text-[#fde047] font-black">[ 5% OFF ]</span> {t("first_order", "FOR THE FIRST ORDER")}
            </h4>
            <Link
              href="/products?category=watches"
              className="bg-white text-[#451a03] hover:bg-slate-100 text-[10px] sm:text-[11px] font-extrabold px-3.5 py-1.5 rounded shadow-xs w-fit transition-transform active:scale-95 uppercase tracking-wider"
            >
              {t("buy_now", "Buy Now")}
            </Link>
          </div>

          {/* Right Smartwatch Image */}
          <div className="relative w-28 sm:w-36 h-32 sm:h-36 shrink-0 flex items-center justify-center">
            <Image
              src={watchImg}
              alt="Spring Season Smartwatch offer"
              fill
              className="object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div>

      </div>
    </div>
  );
}
