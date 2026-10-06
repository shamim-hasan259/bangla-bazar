"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ShoppingCart, Loader2 } from "lucide-react";
import { useDispatch } from "react-redux";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { addToCart } from "@/app/redux-store/Slice/CartSlice";
import { toast } from "sonner";
import axios from "axios";
import { useLanguage } from "@/context/LanguageContext";

interface DealItem {
  id: string;
  title: string;
  description: string;
  originalPrice: number;
  discountPrice: number;
  discountBadge: string;
  available: number;
  sold: number;
  image: string;
}

export default function DailyDealsCarouselSection() {
  const { data: session } = useSession();
  const router = useRouter();
  const { t } = useLanguage();
  const dispatch = useDispatch();
  const [deals, setDeals] = useState<DealItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);

  const [timeLeft, setTimeLeft] = useState({
    days: 12,
    hours: 14,
    minutes: 45,
    seconds: 59,
  });

  useEffect(() => {
    let isMounted = true;
    const fetchDailyDeals = async () => {
      try {
        setLoading(true);
        const res = await axios.get("/api/products?section=daily-deals&limit=8");
        let rawList = (Array.isArray(res.data) && res.data.length > 0) ? res.data : [];
        if (rawList.length === 0) {
          const fallback = await axios.get("/api/products?limit=8");
          if (Array.isArray(fallback.data)) rawList = fallback.data;
        }

        if (isMounted && rawList.length > 0) {
          const mapped = rawList.map((p: any) => {
            let photoUrl = "/flashsale/chair.jpg";
            if (p.photo && typeof p.photo === "string") photoUrl = p.photo;
            else if (Array.isArray(p.photo) && p.photo.length > 0) photoUrl = p.photo[0];

            const orig = p.mrp || Math.round(p.price * 1.35);
            const disc = p.price;
            const discountPct = Math.round(((orig - disc) / orig) * 100) || 20;
            const stock = p.stock || 30;
            const soldCount = Math.floor(stock * 0.7);

            return {
              id: p.id,
              title: p.name,
              description: p.description || "Premium verified authentic product with highest customer ratings.",
              originalPrice: orig,
              discountPrice: disc,
              discountBadge: `${discountPct}%`,
              available: Math.max(1, stock - soldCount),
              sold: soldCount,
              image: photoUrl,
            };
          });
          setDeals(mapped);
        }
      } catch (err) {
        console.error("Failed to load daily deals:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDailyDeals();

    return () => {
      isMounted = false;
    };
  }, []);

  const totalSlides = Math.ceil(deals.length / 2) || 1;

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleNext = () => {
    setActiveSlide((prev) => (prev + 1) % totalSlides);
  };

  const handlePrev = () => {
    setActiveSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const handleAddToCart = (item: DealItem) => {
    if (!session?.user) {
      toast.error("Please log in to add items to cart!");
      router.push("/auth/customer/login");
      return;
    }

    const userRole = String(
      (session?.user as any)?.role || (session?.user as any)?.type || ""
    ).toLowerCase();
    const isAdmin = ["admin", "manager", "stuff", "sales", "marketing"].includes(userRole);

    if (isAdmin) {
      toast.error("Admins cannot add products to cart! Please use a customer account.");
      return;
    }

    try {
      dispatch(
        addToCart({
          id: item.id,
          quantity: 1,
          name: item.title,
          photo: item.image,
          price: item.discountPrice,
          mrp: item.originalPrice,
        })
      );
      toast.success(`"${item.title}" added to cart!`);
    } catch {
      toast.error("Failed to add product to cart");
    }
  };

  const startIndex = activeSlide * 2;
  const currentItems = deals.slice(startIndex, startIndex + 2);

  if (!loading && deals.length === 0) {
    return null;
  }

  return (
    <section className="w-full py-4 space-y-4 select-none">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-6 bg-slate-900 dark:bg-white rounded-full" />
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
            {t("deals_of_the_day")}
          </h2>
        </div>

        {/* Carousel Arrow Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-black hover:text-white flex items-center justify-center transition-all shadow-2xs cursor-pointer active:scale-95"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNext}
            className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-black hover:text-white flex items-center justify-center transition-all shadow-2xs cursor-pointer active:scale-95"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Deal Cards Container */}
      {loading ? (
        <div className="h-56 w-full flex items-center justify-center py-4">
          <Loader2 className="w-8 h-8 animate-spin text-[#1E60ED]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {currentItems.map((item) => {
            const totalStock = item.available + item.sold;
            const soldPercentage = Math.round((item.sold / totalStock) * 100);

            return (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row items-center gap-5 relative group"
              >
                {/* Left Column: Product Image + Circular Discount Badge */}
                <Link
                  href={`/products/${item.id}`}
                  className="relative w-full sm:w-44 h-48 sm:h-48 shrink-0 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-center overflow-hidden"
                >
                  {/* Circular Red Badge */}
                  <div className="absolute top-2.5 right-2.5 w-9 h-9 bg-red-600 text-white rounded-full flex flex-col items-center justify-center text-[9px] font-black leading-none shadow-sm z-10">
                    <span>{item.discountBadge}</span>
                    <span className="text-[7px] uppercase tracking-tighter opacity-90">{t("off")}</span>
                  </div>

                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </Link>

                {/* Right Column: Details & Stock Progress */}
                <div className="flex-1 space-y-3 w-full text-left">
                  {/* Title */}
                  <Link href={`/products/${item.id}`}>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white line-clamp-1 hover:text-red-600 transition-colors">
                      {item.title}
                    </h3>
                  </Link>

                  {/* Pricing */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 line-through font-medium">
                      ৳{item.originalPrice.toLocaleString()}
                    </span>
                    <span className="text-base sm:text-lg font-black text-red-600 dark:text-red-500">
                      ৳{item.discountPrice.toLocaleString()}
                    </span>
                  </div>

                  {/* Description Snippet */}
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>

                  {/* Stock Progress Bar */}
                  <div className="space-y-1 pt-0.5">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-slate-600 dark:text-slate-400">
                        {t("available")}: <strong className="text-red-600 dark:text-red-500">{item.available}</strong>
                      </span>
                      <span className="text-slate-600 dark:text-slate-400">
                        {t("sold")}: <strong className="text-slate-900 dark:text-white">{item.sold}</strong>
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-red-500 to-rose-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${soldPercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Live Countdown & Add to Cart */}
                  <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    {/* Countdown Timer */}
                    <div className="space-y-1">
                      <span className="block text-[10px] font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-tight">
                        {t("hurry_up")}
                      </span>
                      <div className="flex items-center gap-1">
                        <div className="bg-slate-100 dark:bg-slate-800 rounded-md px-1.5 py-0.5 text-center min-w-[24px]">
                          <span className="text-[11px] font-black text-slate-900 dark:text-white leading-none">
                            {String(timeLeft.days).padStart(2, "0")}
                          </span>
                          <span className="block text-[7px] text-slate-400 uppercase">{t("days")}</span>
                        </div>
                        <span className="text-xs font-bold text-slate-400">:</span>
                        <div className="bg-slate-100 dark:bg-slate-800 rounded-md px-1.5 py-0.5 text-center min-w-[24px]">
                          <span className="text-[11px] font-black text-slate-900 dark:text-white leading-none">
                            {String(timeLeft.hours).padStart(2, "0")}
                          </span>
                          <span className="block text-[7px] text-slate-400 uppercase">{t("hours")}</span>
                        </div>
                        <span className="text-xs font-bold text-slate-400">:</span>
                        <div className="bg-slate-100 dark:bg-slate-800 rounded-md px-1.5 py-0.5 text-center min-w-[24px]">
                          <span className="text-[11px] font-black text-slate-900 dark:text-white leading-none">
                            {String(timeLeft.minutes).padStart(2, "0")}
                          </span>
                          <span className="block text-[7px] text-slate-400 uppercase">{t("mins")}</span>
                        </div>
                        <span className="text-xs font-bold text-slate-400">:</span>
                        <div className="bg-slate-100 dark:bg-slate-800 rounded-md px-1.5 py-0.5 text-center min-w-[24px]">
                          <span className="text-[11px] font-black text-slate-900 dark:text-white leading-none">
                            {String(timeLeft.seconds).padStart(2, "0")}
                          </span>
                          <span className="block text-[7px] text-slate-400 uppercase">{t("secs")}</span>
                        </div>
                      </div>
                    </div>

                    {/* Add to Cart Button */}
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="w-full sm:w-auto px-4 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer shrink-0"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>{t("add_to_cart")}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
