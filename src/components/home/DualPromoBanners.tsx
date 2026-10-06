"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";

import gadgetImg from "@/assets/gadget.png";
import laptopImg from "@/assets/Macbook-laptop.png";

const CAMERA_IMG = "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=400&q=80";
const IPHONE_CASES_IMG = "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=600&q=80";

export default function DualPromoBanners() {
  const { t } = useLanguage();
  const [cameraSrc, setCameraSrc] = useState<any>(CAMERA_IMG);
  const [phoneCaseSrc, setPhoneCaseSrc] = useState<any>(IPHONE_CASES_IMG);

  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 xl:px-0 my-4 sm:my-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-stretch">

        {/* Left Card: 50% OFF CAMERA (4 cols on lg) */}
        <div className="lg:col-span-4 bg-slate-900 rounded overflow-hidden p-5 sm:p-6 flex flex-col items-center justify-between text-white shadow-xs min-h-[220px] sm:min-h-[240px] relative group text-center border border-slate-800">
          {/* Top Headline */}
          <div className="z-10 flex flex-col items-center">
            <h4 className="text-[#fde047] font-black text-sm sm:text-base tracking-wider uppercase">
              50% {t("off", "OFF")} {t("cameras", "CAMERA")}
            </h4>
            <p className="text-white text-[10px] sm:text-xs font-medium tracking-[0.25em] uppercase mt-0.5">
              {t("everything", "EVERYTHING!")}
            </p>
          </div>

          {/* Center Graphic with Brackets */}
          <div className="relative w-full flex items-center justify-center my-2 py-1">
            {/* Left Bracket */}
            <div className="text-white/80 font-mono text-5xl sm:text-6xl font-light pr-2 select-none">
              [
            </div>

            {/* Product Image */}
            <div className="relative w-28 sm:w-36 h-28 sm:h-36 shrink-0">
              <Image
                src={cameraSrc}
                alt="50% Off Camera Everything"
                fill
                className="object-contain drop-shadow-lg group-hover:scale-105 transition-transform duration-300"
                onError={() => setCameraSrc(gadgetImg)}
              />
            </div>

            {/* Right Bracket */}
            <div className="text-white/80 font-mono text-5xl sm:text-6xl font-light pl-2 select-none">
              ]
            </div>
          </div>

          {/* Bottom Action Link */}
          <Link
            href="/products?category=electronics"
            className="z-10 bg-white text-slate-900 hover:bg-slate-100 text-[10px] sm:text-[11px] font-extrabold px-4 py-1.5 rounded shadow-xs transition-transform active:scale-95 uppercase tracking-wider cursor-pointer"
          >
            {t("shop_now", "Shop Camera")}
          </Link>
        </div>

        {/* Right Card: CASE IPHONE FOR 2018 (8 cols on lg) */}
        <div className="lg:col-span-8 bg-gradient-to-r from-slate-900 via-[#18181b] to-black rounded overflow-hidden p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between text-white shadow-xs min-h-[220px] sm:min-h-[240px] relative group border border-slate-800">
          {/* Left Text Content */}
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left z-10 max-w-sm">
            <span className="text-slate-200 text-[11px] sm:text-xs font-semibold tracking-widest uppercase">
              {t("case_iphone", "CASE IPHONE FOR 2018")}
            </span>

            <h3 className="text-[#fde047] font-black text-3xl sm:text-4xl tracking-tight my-1 drop-shadow-xs">
              35% {t("off", "OFF")}
            </h3>

            <span className="text-white font-extrabold text-xs sm:text-sm tracking-widest uppercase mb-2">
              {t("sitewide", "SITEWIDE *")}
            </span>

            <div className="bg-black/20 backdrop-blur-xs px-3 py-1 rounded text-amber-200 text-[10px] sm:text-[11px] font-mono tracking-wider mb-4 border border-white/10">
              [ {t("promo_code", "PROMO CODE")}: VICTOPENCART | {t("time", "TIME")}: 20-12 ]
            </div>

            <Link
              href="/products?category=electronics"
              className="bg-white text-slate-900 hover:bg-slate-100 text-xs font-extrabold px-6 py-2.5 rounded shadow-md transition-transform active:scale-95 uppercase tracking-wider cursor-pointer"
            >
              {t("buy_now", "Buy Now")}
            </Link>
          </div>

          {/* Right Product Graphic (Stacked iPhone Cases) */}
          <div className="relative w-full sm:w-72 h-44 sm:h-52 shrink-0 mt-4 sm:mt-0 flex items-center justify-center">
            <Image
              src={phoneCaseSrc}
              alt="35% Off Case iPhone Sitewide"
              fill
              className="object-contain drop-shadow-xl group-hover:scale-105 transition-transform duration-500"
              onError={() => setPhoneCaseSrc(laptopImg)}
            />
          </div>
        </div>

      </div>
    </div>
  );
}
