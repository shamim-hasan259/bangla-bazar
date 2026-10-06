"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Clock, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import axios from "axios";
import ProductCard from "./ProductCard";
import { useLanguage } from "@/context/LanguageContext";

interface HotDealProduct {
  id: string;
  name: string;
  originalPrice: number;
  salePrice: number;
  discountPercent: number;
  rating: number;
  reviews: number | string;
  image: string;
  category: string;
}

const fallbackHotDeals: HotDealProduct[] = [
  {
    id: "hd-1",
    name: "Ultra-Comfort Knit Breathable Running Sneakers",
    salePrice: 2850,
    originalPrice: 3500,
    discountPercent: 19,
    rating: 4.8,
    reviews: "410",
    image: "/img/products/running-sneakers.jpg",
    category: "Fashion & Apparel",
  },
  {
    id: "hd-2",
    name: "Waterproof Commuter Laptop Backpack 25L with USB Port",
    salePrice: 2450,
    originalPrice: 3100,
    discountPercent: 21,
    rating: 4.7,
    reviews: "280",
    image: "/img/products/travel-backpack.jpg",
    category: "Fashion & Apparel",
  },
  {
    id: "hd-3",
    name: "Urban Oversized Heavyweight Fleece Hoodie",
    salePrice: 1550,
    originalPrice: 1999,
    discountPercent: 22,
    rating: 4.9,
    reviews: "320",
    image: "/img/products/casual-hoodie.jpg",
    category: "Fashion & Apparel",
  },
  {
    id: "hd-4",
    name: "Samsung Galaxy Watch 6 Classic 47mm Rotating Bezel",
    salePrice: 32500,
    originalPrice: 36900,
    discountPercent: 12,
    rating: 4.8,
    reviews: "260",
    image: "/img/products/modern-smartphone.jpg",
    category: "Watches & Jewelry",
  },
  {
    id: "hd-5",
    name: "Apple Watch Ultra 2 GPS + Cellular 49mm Titanium",
    salePrice: 88500,
    originalPrice: 96000,
    discountPercent: 8,
    rating: 4.9,
    reviews: "380",
    image: "/img/products/wireless-earbuds.jpg",
    category: "Watches & Jewelry",
  },
];

export default function HotDealSection() {
  const { t } = useLanguage();
  const [api, setApi] = useState<CarouselApi | null>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);
  const [products, setProducts] = useState<HotDealProduct[]>([]);
  const [loading, setLoading] = useState(true);

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState({
    days: 4,
    hours: 18,
    minutes: 42,
    seconds: 30,
  });

  useEffect(() => {
    let isMounted = true;
    const fetchHotDeals = async () => {
      try {
        setLoading(true);
        const res = await axios.get("/api/products?section=hot-deal&limit=12");
        if (isMounted && Array.isArray(res.data) && res.data.length > 0) {
          const mapped = res.data.map((p: any) => {
            let photoUrl = "/deals/deals_sunglasses.jpg";
            if (p.photo && typeof p.photo === "string") photoUrl = p.photo;
            else if (Array.isArray(p.photo) && p.photo.length > 0) photoUrl = p.photo[0];

            const orig = p.mrp || Math.round(p.price * 1.25);
            const disc = p.price;
            const discountPct = Math.round(((orig - disc) / orig) * 100) || 15;

            return {
              id: p.id,
              name: p.name,
              originalPrice: orig,
              salePrice: disc,
              discountPercent: discountPct,
              rating: p.averageRating || 4.8,
              reviews: p.reviewCount || 35,
              image: photoUrl,
              category: p.category?.name || "Hot Deals",
            };
          });
          setProducts(mapped);
        }
      } catch (err) {
        console.error("Error fetching hot deals:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchHotDeals();

    return () => {
      isMounted = false;
    };
  }, []);

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

  useEffect(() => {
    if (!api) return;
    const onSelect = () => {
      setCanPrev(api.canScrollPrev());
      setCanNext(api.canScrollNext());
    };
    api.on("select", onSelect);
    api.on("reInit", onSelect);
    onSelect();
  }, [api]);



  const pad = (n: number) => String(n).padStart(2, "0");
  const productList = products.length > 0 ? products : fallbackHotDeals;
  const displayProducts = productList.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.salePrice,
    mrp: p.originalPrice,
    photo: p.image,
    rating: p.rating,
    reviews: p.reviews,
    category: p.category,
  }));

  if (!loading && displayProducts.length === 0) {
    return null;
  }

  return (
    <section className="w-full py-4 select-none">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs">
        {/* Section Header */}
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4 sm:mb-5 pb-3 border-b border-slate-100 dark:border-slate-800">
          {/* Left: Title + Badge */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-6 bg-slate-900 dark:bg-white rounded-full" />
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                {t("hot_deals")}
              </h2>
            </div>

            {/* Countdown Clock */}
            <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 px-2.5 py-1 rounded-full text-slate-600 dark:text-slate-300 text-[11px] font-semibold">
              <Clock className="w-3 h-3 text-slate-500 dark:text-slate-400" />
              <span>{t("ending_in")}:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white ml-0.5">
                {timeLeft.days}d {pad(timeLeft.hours)}h {pad(timeLeft.minutes)}m {pad(timeLeft.seconds)}s
              </span>
            </div>
          </div>

          {/* Right: View All & Navigation */}
          <div className="flex items-center gap-2">
            <Link
              href="/products?sort=deals"
              className="text-xs font-bold text-slate-900 dark:text-slate-100 hover:text-black dark:hover:text-white px-3 py-1 border border-slate-900 dark:border-slate-700 rounded-sm uppercase tracking-wider transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {t("view_all_short")}
            </Link>

            {/* Prev / Next Arrows */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => api?.scrollPrev()}
                disabled={!canPrev}
                className="w-7 h-7 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs"
                aria-label="Previous hot deals"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => api?.scrollNext()}
                disabled={!canNext}
                className="w-7 h-7 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs"
                aria-label="Next hot deals"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Carousel Slider */}
        {loading ? (
          <div className="h-56 w-full flex items-center justify-center py-4">
            <Loader2 className="w-8 h-8 animate-spin text-[#1E60ED]" />
          </div>
        ) : (
          <Carousel
            setApi={setApi}
            opts={{ align: "start", loop: true, dragFree: true }}
            className="w-full"
          >
            <CarouselContent className="-ml-3 sm:-ml-4">
              {displayProducts.map((product, idx) => (
                <CarouselItem
                  key={`${product.id}-${idx}`}
                  className="pl-3 sm:pl-4 basis-[48%] min-[420px]:basis-[45%] sm:basis-[33.33%] md:basis-[25%] lg:basis-[20%]"
                >
                  <ProductCard product={product} />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        )}
      </div>
    </section>
  );
}
