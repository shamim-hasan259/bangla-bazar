"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Star, ShoppingCart, Zap, ChevronLeft, ChevronRight, Loader2, Clock } from "lucide-react";
import { useDispatch } from "react-redux";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { addToCart } from "@/app/redux-store/Slice/CartSlice";
import { toast } from "sonner";
import axios from "axios";
import { useLanguage } from "@/context/LanguageContext";

interface FlashItem {
  id: string;
  title: string;
  rating: number;
  reviews: number;
  originalPrice: number;
  discountPrice: number;
  image: string;
  category: string;
  stock: number;
  sold: number;
  slug?: string;
}

function getDiscountPercent(original: number, discounted: number) {
  if (!original || original <= discounted) return 15;
  return Math.round(((original - discounted) / original) * 100);
}

export default function FlashSaleGridSection() {
  const { data: session } = useSession();
  const router = useRouter();
  const { t } = useLanguage();
  const dispatch = useDispatch();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [items, setItems] = useState<FlashItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [timeLeft, setTimeLeft] = useState({
    days: 30,
    hours: 14,
    minutes: 35,
    seconds: 59,
  });

  useEffect(() => {
    let isMounted = true;
    const fetchFlashSale = async () => {
      try {
        setLoading(true);
        let flashProducts: any[] = [];
        
        try {
          const res = await axios.get("/api/flash-sale");
          if (res.data) {
            if (res.data.endDate) {
              const end = new Date(res.data.endDate).getTime();
              const now = new Date().getTime();
              const diff = Math.max(0, end - now);
              const d = Math.floor(diff / (1000 * 60 * 60 * 24));
              const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
              const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
              const s = Math.floor((diff % (1000 * 60)) / 1000);
              setTimeLeft({ days: d, hours: h, minutes: m, seconds: s });
            }

            if (res.data.products && Array.isArray(res.data.products) && res.data.products.length > 0) {
              flashProducts = res.data.products.map((fsp: any) => {
                const p = fsp.product || fsp;
                let photoUrl = "/flashsale/smartphone.jpg";
                if (p.photo && typeof p.photo === "string") photoUrl = p.photo;
                else if (Array.isArray(p.photo) && p.photo.length > 0) photoUrl = p.photo[0];

                const orig = p.mrp || Math.round(p.price * 1.3);
                const disc = p.price;
                const totalStock = fsp.flashSaleStock || p.stock || 50;
                const soldCount = Math.floor(totalStock * 0.65);

                return {
                  id: p.id,
                  title: p.name,
                  rating: p.averageRating || 5,
                  reviews: p.reviewCount || 24,
                  originalPrice: orig,
                  discountPrice: disc,
                  image: photoUrl,
                  category: p.category?.name || "Deals",
                  stock: totalStock,
                  sold: soldCount,
                  slug: p.slug,
                };
              });
            }
          }
        } catch (e) {
          // /api/flash-sale optional
        }

        if (flashProducts.length === 0) {
          try {
            const prodRes = await axios.get("/api/products?section=flash-sale&limit=10");
            let rawList = Array.isArray(prodRes.data) ? prodRes.data : [];
            if (rawList.length === 0) {
              const allRes = await axios.get("/api/products?limit=10");
              if (Array.isArray(allRes.data)) rawList = allRes.data;
            }

            flashProducts = rawList.map((p: any) => {
              let photoUrl = "/flashsale/smartphone.jpg";
              if (p.photo && typeof p.photo === "string") photoUrl = p.photo;
              else if (Array.isArray(p.photo) && p.photo.length > 0) photoUrl = p.photo[0];

              const orig = p.mrp || Math.round(p.price * 1.3);
              const disc = p.price;
              const totalStock = p.stock || 40;
              const soldCount = Math.floor(totalStock * 0.7);

              return {
                id: p.id,
                title: p.name,
                rating: p.averageRating || 5,
                reviews: p.reviewCount || 18,
                originalPrice: orig,
                discountPrice: disc,
                image: photoUrl,
                category: p.category?.name || "Deals",
                stock: totalStock,
                sold: soldCount,
                slug: p.slug,
              };
            });
          } catch (fetchErr) {
            console.error("Error in fallback flash products:", fetchErr);
          }
        }

        if (isMounted) setItems(flashProducts);
      } catch (err) {
        console.error("Error fetching flash sales:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchFlashSale();

    return () => {
      isMounted = false;
    };
  }, []);

  // Timer countdown interval
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [items]);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 600;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
      setTimeout(checkScroll, 350);
    }
  };



  const handleAddToCart = (item: FlashItem, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!session?.user) {
      toast.error("Please log in to add items to cart!");
      router.push("/auth/customer/login");
      return;
    }
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
    toast.success(`${item.title} added to cart!`);
  };

  const pad = (n: number) => String(n).padStart(2, "0");

  if (!loading && items.length === 0) {
    return null;
  }

  return (
    <section className="w-full py-4 select-none">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs">
        {/* ── Section Header ── */}
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4 sm:mb-5 pb-3 border-b border-slate-100 dark:border-slate-800">
          {/* Left: Title + Countdown Timer */}
          <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
            {/* Title */}
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-6 bg-red-600 rounded-full" />
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                {t("flash_sale")}
              </h2>
            </div>

            {/* Countdown Clock */}
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-1 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 px-2 py-0.5 rounded-full text-red-600 dark:text-red-400 text-[11px] font-bold">
                <Clock className="w-3 h-3 text-red-500 animate-pulse" />
                <span className="uppercase tracking-wider text-[10px]">{t("on_sale_now", "On Sale Now")}</span>
              </div>
              <div className="flex items-center gap-1">
                {[
                  { val: pad(timeLeft.days), label: "D" },
                  { val: pad(timeLeft.hours), label: "H" },
                  { val: pad(timeLeft.minutes), label: "M" },
                  { val: pad(timeLeft.seconds), label: "S" },
                ].map((unit, i) => (
                  <React.Fragment key={unit.label}>
                    <div className="flex flex-col items-center bg-slate-900 text-white dark:bg-slate-800 rounded-md px-1.5 py-0.5 min-w-[26px] text-center shadow-xs">
                      <span className="font-mono text-xs font-black leading-tight text-white">{unit.val}</span>
                      <span className="text-[8px] font-bold text-slate-400 leading-none">{unit.label}</span>
                    </div>
                    {i < 3 && (
                      <span className="font-bold text-slate-500 text-xs leading-none">:</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          {/* Right: See All */}
          <Link
            href="/products?sort=deals"
            className="flex items-center gap-0.5 text-slate-900 dark:text-white hover:text-black dark:hover:text-slate-200 text-xs font-bold transition-colors whitespace-nowrap"
          >
            {t("view_all_short")} <ChevronRight className="w-4 h-4 text-slate-900 dark:text-white" />
          </Link>
        </div>

        {/* ── Horizontally Scrollable Product Cards Slider (No Gap) ── */}
        <div className="relative overflow-hidden">
          {/* Left Arrow */}
          {canScrollLeft && (
            <button
              onClick={() => scroll("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-8 h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-r border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-md hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
              aria-label="Previous items"
            >
              <ChevronLeft className="w-4 h-4 text-slate-700 dark:text-slate-300" />
            </button>
          )}

          {/* Right Arrow */}
          {canScrollRight && (
            <button
              onClick={() => scroll("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-8 h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-l border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-md hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
              aria-label="Next items"
            >
              <ChevronRight className="w-4 h-4 text-slate-700 dark:text-slate-300" />
            </button>
          )}

          {loading ? (
            <div className="h-56 w-full flex items-center justify-center py-4">
              <Loader2 className="w-8 h-8 animate-spin text-[#1E60ED]" />
            </div>
          ) : (
            <div
              ref={scrollRef}
              onScroll={checkScroll}
              className="flex overflow-x-auto scroll-smooth"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {items.map((item, idx) => {
                const discount = getDiscountPercent(item.originalPrice, item.discountPrice);
                const soldPct = Math.min(100, Math.round((item.sold / item.stock) * 100));
                const remaining = item.stock - item.sold;

                return (
                  <div
                    key={item.id}
                    className={`flex-none w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/6 flex flex-col group cursor-pointer ${
                      idx !== items.length - 1
                        ? "border-r border-slate-100 dark:border-slate-800"
                        : ""
                    }`}
                  >
                    {/* Product Image */}
                    <Link
                      href={`/products/${item.id}`}
                      className="relative w-full aspect-square bg-[#f7f7f7] dark:bg-slate-800 overflow-hidden flex items-center justify-center"
                    >
                      {/* -X% Discount Badge */}
                      <span className="absolute top-2 left-2 z-10 bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-sm leading-none">
                        -{discount}%
                      </span>
                      {/* Lightning icon top-right */}
                      <span className="absolute top-2 right-2 z-10 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                        <Zap className="w-3 h-3 fill-white" />
                      </span>
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </Link>

                    {/* Card Info */}
                    <div className="flex flex-col gap-1.5 p-2.5 flex-1">
                      {/* Title */}
                      <Link
                        href={`/products/${item.id}`}
                        className="text-[11px] sm:text-xs font-medium text-slate-700 dark:text-slate-300 line-clamp-2 leading-snug min-h-[28px] hover:text-black dark:hover:text-white transition-colors"
                      >
                        {item.title}
                      </Link>

                      {/* Star Rating */}
                      <div className="flex items-center gap-1">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-2.5 h-2.5 ${
                                i < Math.floor(item.rating)
                                  ? "fill-amber-400 text-amber-400"
                                  : "fill-slate-200 text-slate-200"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-[10px] text-slate-400">({item.reviews})</span>
                      </div>

                      {/* Price */}
                      <div className="flex flex-col">
                        <span className="text-sm sm:text-base font-black text-red-600 dark:text-red-500 leading-tight">
                          ৳{item.discountPrice.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-400 line-through leading-none">
                          ৳{item.originalPrice.toLocaleString()}
                        </span>
                      </div>

                      {/* Sold Progress Bar */}
                      <div className="space-y-0.5">
                        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-black dark:bg-white transition-all duration-500"
                            style={{ width: `${soldPct}%` }}
                          />
                        </div>
                        <p className="text-[9px] font-bold text-slate-500 dark:text-slate-400">
                          {remaining <= 5 ? (
                            <span className="text-red-500">Only {remaining} left!</span>
                          ) : (
                            `${soldPct}% Sold`
                          )}
                        </p>
                      </div>

                      {/* Add to Cart Button */}
                      <button
                        onClick={(e) => handleAddToCart(item, e)}
                        className="mt-auto w-full bg-slate-900 hover:bg-black text-white font-bold text-[10px] sm:text-xs py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer shadow-sm"
                      >
                        <ShoppingCart className="w-3 h-3" />
                        {t("add_to_cart")}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
