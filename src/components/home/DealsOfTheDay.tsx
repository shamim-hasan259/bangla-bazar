"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function DealsOfTheDay() {
  // Live ticking countdown timer for 20h 50m 40s
  const [timeLeft, setTimeLeft] = useState({
    days: "00",
    hours: "20",
    minutes: "50",
    seconds: "40",
  });

  useEffect(() => {
    // Target 20 hours, 50 minutes, 40 seconds from component mount
    const targetTime = new Date().getTime() + (20 * 3600 + 50 * 60 + 40) * 1000;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetTime - now;

      if (difference <= 0) {
        clearInterval(interval);
        setTimeLeft({ days: "00", hours: "00", minutes: "00", seconds: "00" });
      } else {
        const d = Math.floor(difference / (1000 * 60 * 60 * 24));
        const h = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({
          days: d < 10 ? `0${d}` : `${d}`,
          hours: h < 10 ? `0${h}` : `${h}`,
          minutes: m < 10 ? `0${m}` : `${m}`,
          seconds: s < 10 ? `0${s}` : `${s}`,
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="w-full mt-6 mb-8 select-none">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div>
          <h2 className="text-lg sm:text-2xl font-extrabold text-[#1e1e38] dark:text-white tracking-tight uppercase">
            DEALS OF THE DAY
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Don&apos;t miss these special discounts available for a limited time
          </p>
        </div>

        <Link
          href="/products"
          className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
        >
          View All Deals <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Symmetrical 3x2 Grid Layout */}
      <div className="grid grid-cols-12 gap-3.5 sm:gap-4.5">
        {/* Card 1: Sunglasses Deal */}
        <Link
          href="/products"
          className="col-span-6 md:col-span-4 lg:col-span-4 bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl p-3.5 sm:p-4 flex flex-col justify-between group border border-slate-100 dark:border-slate-800 shadow-xs hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-md transition-all duration-300"
        >
          <div className="relative w-full h-36 sm:h-44 bg-[#f4f5f7] dark:bg-slate-800/60 rounded-lg sm:rounded-xl p-2.5 flex items-center justify-center overflow-hidden">
            <span className="absolute top-2 left-2 z-10 bg-rose-500 text-white font-extrabold text-[10px] sm:text-[11px] px-2 py-0.5 rounded-md shadow-xs">
              30% OFF
            </span>
            <Image
              src="/deals/deals_sunglasses.jpg"
              alt="Sunglasses Deal"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 50vw, 33vw"
            />
          </div>
          <div className="pt-2.5 pb-0.5 px-0.5 flex flex-col gap-1">
            <h3 className="font-bold text-xs sm:text-sm text-[#1e1e38] dark:text-slate-100 group-hover:text-blue-600 transition-colors line-clamp-1">
              Polarized UV Sunglasses
            </h3>
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm sm:text-base font-extrabold text-[#111111] dark:text-white">
                ৳1,250
              </span>
              <span className="text-xs text-slate-400 line-through font-normal">
                ৳1,800
              </span>
            </div>
          </div>
        </Link>

        {/* Card 2: Pink Blazer */}
        <Link
          href="/products"
          className="col-span-6 md:col-span-4 lg:col-span-4 bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl p-3.5 sm:p-4 flex flex-col justify-between group border border-slate-100 dark:border-slate-800 shadow-xs hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-md transition-all duration-300"
        >
          <div className="relative w-full h-36 sm:h-44 bg-[#f4f5f7] dark:bg-slate-800/60 rounded-lg sm:rounded-xl p-2.5 flex items-center justify-center overflow-hidden">
            <span className="absolute top-2 left-2 z-10 bg-blue-600 text-white font-extrabold text-[10px] sm:text-[11px] px-2 py-0.5 rounded-md shadow-xs">
              HOT DEAL
            </span>
            <Image
              src="/deals/deals_blazer.jpg"
              alt="Pink Blazer Fashion"
              fill
              className="object-cover rounded-md group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 50vw, 33vw"
            />
          </div>
          <div className="pt-2.5 pb-0.5 px-0.5 flex flex-col gap-1">
            <h3 className="font-bold text-xs sm:text-sm text-[#1e1e38] dark:text-slate-100 group-hover:text-blue-600 transition-colors line-clamp-1">
              Designer Pink Blazer
            </h3>
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm sm:text-base font-extrabold text-[#111111] dark:text-white">
                ৳2,450
              </span>
              <span className="text-xs text-slate-400 line-through font-normal">
                ৳3,200
              </span>
            </div>
          </div>
        </Link>

        {/* Card 3: Flagship Smartphone */}
        <Link
          href="/products"
          className="col-span-6 md:col-span-4 lg:col-span-4 bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl p-3.5 sm:p-4 flex flex-col justify-between group border border-slate-100 dark:border-slate-800 shadow-xs hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-md transition-all duration-300"
        >
          <div className="relative w-full h-36 sm:h-44 bg-[#f4f5f7] dark:bg-slate-800/60 rounded-lg sm:rounded-xl p-2.5 flex items-center justify-center overflow-hidden">
            <span className="absolute top-2 left-2 z-10 bg-indigo-600 text-white font-extrabold text-[10px] sm:text-[11px] px-2 py-0.5 rounded-md shadow-xs">
              BEST VALUE
            </span>
            <Image
              src="/deals/deals_iphone.jpg"
              alt="Smartphone Deal"
              fill
              className="object-cover rounded-md group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 50vw, 33vw"
            />
          </div>
          <div className="pt-2.5 pb-0.5 px-0.5 flex flex-col gap-1">
            <h3 className="font-bold text-xs sm:text-sm text-[#1e1e38] dark:text-slate-100 group-hover:text-blue-600 transition-colors line-clamp-1">
              Flagship Smartphone Pro
            </h3>
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm sm:text-base font-extrabold text-[#111111] dark:text-white">
                ৳85,000
              </span>
              <span className="text-xs text-slate-400 line-through font-normal">
                ৳95,000
              </span>
            </div>
          </div>
        </Link>

        {/* Card 4: White Sneakers */}
        <Link
          href="/products"
          className="col-span-6 md:col-span-4 lg:col-span-4 bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl p-3.5 sm:p-4 flex flex-col justify-between group border border-slate-100 dark:border-slate-800 shadow-xs hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-md transition-all duration-300"
        >
          <div className="relative w-full h-36 sm:h-44 bg-[#f4f5f7] dark:bg-slate-800/60 rounded-lg sm:rounded-xl p-2.5 flex items-center justify-center overflow-hidden">
            <span className="absolute top-2 left-2 z-10 bg-emerald-600 text-white font-extrabold text-[10px] sm:text-[11px] px-2 py-0.5 rounded-md shadow-xs">
              POPULAR
            </span>
            <Image
              src="/deals/deals_sneakers.jpg"
              alt="White Leather Sneakers"
              fill
              className="object-cover rounded-md group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 50vw, 33vw"
            />
          </div>
          <div className="pt-2.5 pb-0.5 px-0.5 flex flex-col gap-1">
            <h3 className="font-bold text-xs sm:text-sm text-[#1e1e38] dark:text-slate-100 group-hover:text-blue-600 transition-colors line-clamp-1">
              White Leather Sneakers
            </h3>
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm sm:text-base font-extrabold text-[#111111] dark:text-white">
                ৳1,850
              </span>
              <span className="text-xs text-slate-400 line-through font-normal">
                ৳2,400
              </span>
            </div>
          </div>
        </Link>

        {/* Card 5: Menswear Fashion */}
        <Link
          href="/products"
          className="col-span-6 md:col-span-4 lg:col-span-4 bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl p-3.5 sm:p-4 flex flex-col justify-between group border border-slate-100 dark:border-slate-800 shadow-xs hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-md transition-all duration-300"
        >
          <div className="relative w-full h-36 sm:h-44 bg-[#f4f5f7] dark:bg-slate-800/60 rounded-lg sm:rounded-xl p-2.5 flex items-center justify-center overflow-hidden">
            <span className="absolute top-2 left-2 z-10 bg-amber-500 text-white font-extrabold text-[10px] sm:text-[11px] px-2 py-0.5 rounded-md shadow-xs">
              TRENDING
            </span>
            <Image
              src="/deals/deals_menswear.jpg"
              alt="Menswear Fashion"
              fill
              className="object-cover rounded-md group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 50vw, 33vw"
            />
          </div>
          <div className="pt-2.5 pb-0.5 px-0.5 flex flex-col gap-1">
            <h3 className="font-bold text-xs sm:text-sm text-[#1e1e38] dark:text-slate-100 group-hover:text-blue-600 transition-colors line-clamp-1">
              Casual Menswear Collection
            </h3>
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm sm:text-base font-extrabold text-[#111111] dark:text-white">
                ৳1,650
              </span>
              <span className="text-xs text-slate-400 line-through font-normal">
                ৳2,200
              </span>
            </div>
          </div>
        </Link>

        {/* Card 6: Live Countdown Timer Card */}
        <div className="col-span-12 md:col-span-4 lg:col-span-4 bg-gradient-to-br from-[#1e1e38] via-slate-900 to-black text-white rounded-xl sm:rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-md hover:shadow-lg transition-all duration-300 relative overflow-hidden">
          {/* Top Header Badge */}
          <div className="flex items-center justify-between">
            <span className="bg-white/20 backdrop-blur-md text-white text-[10px] sm:text-[11px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
              EXCLUSIVE OFFERS
            </span>
            <span className="text-[10px] text-blue-100 font-semibold uppercase tracking-wider">
              Ends Soon
            </span>
          </div>

          {/* Live Timer Section */}
          <div className="my-3">
            <h3 className="text-base sm:text-lg font-black tracking-tight text-white mb-2.5">
              Hurry Up! Deals End In:
            </h3>
            <div className="grid grid-cols-4 gap-1.5 text-center">
              <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-lg p-1.5 sm:p-2">
                <span className="block text-sm sm:text-base font-black leading-none">{timeLeft.days}</span>
                <span className="text-[9px] font-medium text-blue-100">Days</span>
              </div>
              <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-lg p-1.5 sm:p-2">
                <span className="block text-sm sm:text-base font-black leading-none">{timeLeft.hours}</span>
                <span className="text-[9px] font-medium text-blue-100">Hours</span>
              </div>
              <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-lg p-1.5 sm:p-2">
                <span className="block text-sm sm:text-base font-black leading-none">{timeLeft.minutes}</span>
                <span className="text-[9px] font-medium text-blue-100">Mins</span>
              </div>
              <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-lg p-1.5 sm:p-2">
                <span className="block text-sm sm:text-base font-black leading-none">{timeLeft.seconds}</span>
                <span className="text-[9px] font-medium text-blue-100">Secs</span>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <Link
            href="/products"
            className="w-full py-2.5 bg-white hover:bg-slate-100 active:scale-95 text-blue-600 font-bold rounded-lg sm:rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer mt-1"
          >
            Explore All Deals <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </Link>
        </div>
      </div>
    </section>
  );
}
