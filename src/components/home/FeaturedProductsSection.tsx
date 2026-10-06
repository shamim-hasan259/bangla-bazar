"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Truck,
  ShieldCheck,
  RefreshCw,
  Flame,
  Sparkles,
  Loader2,
} from "lucide-react";
import ProductCard from "./ProductCard";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import axios from "axios";
import headphoneImg from "@/assets/banner/headphone.png";
import { useLanguage } from "@/context/LanguageContext";

interface FeaturedProductsSectionProps {
  products?: any[];
  title?: string;
  shopMoreLink?: string;
}

const CATEGORY_TABS = [
  { id: "all", label: "All", icon: "❖" },
  { id: "fashion", label: "Fashion", categoryMatch: "fashion" },
  { id: "electronics", label: "Electronics", categoryMatch: "electronics" },
  { id: "home", label: "Home & Living", categoryMatch: "home" },
  { id: "beauty", label: "Beauty & Personal Care", categoryMatch: "beauty" },
  { id: "watches", label: "Watches & Jewelry", categoryMatch: "watches" },
  { id: "laptops", label: "Laptops & Tech", categoryMatch: "laptops" },
];

export default function FeaturedProductsSection({
  products,
  title = "Featured Products",
  shopMoreLink = "/products",
}: FeaturedProductsSectionProps) {
  const { t } = useLanguage();
  const [api, setApi] = useState<CarouselApi | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [fetchedProducts, setFetchedProducts] = useState<any[]>(products || []);
  const [loading, setLoading] = useState<boolean>(!products || products.length === 0);

  useEffect(() => {
    let isMounted = true;
    const loadProducts = async () => {
      try {
        setLoading(true);
        const url =
          activeTab === "all"
            ? "/api/products?featured=true&limit=24"
            : `/api/products?category=${activeTab}&limit=24`;
        const res = await axios.get(url);
        if (isMounted) {
          if (Array.isArray(res.data) && res.data.length > 0) {
            setFetchedProducts(res.data);
          } else {
            const fallback = await axios.get("/api/products?limit=16");
            if (isMounted && Array.isArray(fallback.data)) {
              setFetchedProducts(fallback.data);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load featured products:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, [activeTab]); // Only depend on activeTab

  const displayProducts = fetchedProducts.map((p) => {
    let photoUrl = "/img/products/modern-smartphone.jpg";
    if (p.photo && typeof p.photo === "string" && p.photo.trim() !== "") {
      photoUrl = p.photo;
    } else if (Array.isArray(p.photo) && p.photo.length > 0 && typeof p.photo[0] === "string") {
      photoUrl = p.photo[0];
    }

    return {
      id: p.id,
      name: p.name,
      price: p.price,
      mrp: p.mrp || Math.round(p.price * 1.25),
      photo: photoUrl,
      rating: p.averageRating || 4.8,
      reviews: p.reviewCount ? `${p.reviewCount}` : "25",
      stock: p.stock ?? 50,
      slug: p.slug,
      seller: p.store?.storeNameEn || p.store?.storeName || "Bangla Bazar Official",
    };
  });



  const cleanTitle = (title || "Featured Products").replace(/\s*grid\s*/i, "").trim() || "Featured Products";

  return (
    <section className="w-full py-5 select-none">
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5 px-1">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-6 bg-slate-900 dark:bg-white rounded-full" />
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
            {t(title)}
          </h2>
        </div>

        {/* Header Navigation Controls */}
        <div className="flex items-center gap-3 self-start md:self-end">
          <Link
            href={shopMoreLink}
            className="text-xs font-bold text-slate-900 dark:text-slate-100 hover:text-black transition-colors flex items-center gap-1"
          >
            {t("view_all")} <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          {/* Slider Prev / Next Circular Arrow Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => api?.scrollPrev()}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-xs flex items-center justify-center cursor-pointer active:scale-95 transition-all"
              aria-label="Previous products"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => api?.scrollNext()}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-xs flex items-center justify-center cursor-pointer active:scale-95 transition-all"
              aria-label="Next products"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Category Filter Pills Row */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-3 mb-4 px-1">
        {CATEGORY_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                isActive
                  ? "bg-black text-white font-extrabold border border-black shadow-xs"
                  : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold"
              }`}
            >
              {t(tab.label)}
            </button>
          );
        })}
      </div>

      {/* 3. Product Cards Carousel Grid */}
      {loading ? (
        <div className="h-56 w-full flex items-center justify-center py-4">
          <Loader2 className="w-8 h-8 animate-spin text-[#1E60ED]" />
        </div>
      ) : (
        <Carousel
          setApi={setApi}
          opts={{
            align: "start",
            loop: true,
            dragFree: true,
          }}
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

      {/* 4. Bottom Feature Promo Banner */}
      <div className="mt-8 bg-slate-900 text-white border border-slate-800 rounded p-5 sm:p-7 shadow-none relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left Column Content */}
        <div className="flex flex-col items-start max-w-lg z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-white font-extrabold text-[10px] uppercase tracking-wider shadow-none border border-slate-700">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Limited Time Offer</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-2.5 mb-1">
            Top Deals Just for You
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 font-medium mb-4">
            Discover trending products at unbeatable prices with guaranteed warranty.
          </p>
          {/* 3 Trust Features Badges */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 w-full mb-5">
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left bg-slate-800/80 backdrop-blur-md p-2.5 rounded border border-slate-700/60 shadow-none">
              <Truck className="w-4 h-4 text-amber-400 mb-1" />
              <span className="text-[11px] font-bold text-slate-100">Free Shipping</span>
              <span className="text-[9px] text-slate-400">Orders over ৳1,000</span>
            </div>
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left bg-slate-800/80 backdrop-blur-md p-2.5 rounded border border-slate-700/60 shadow-none">
              <ShieldCheck className="w-4 h-4 text-amber-400 mb-1" />
              <span className="text-[11px] font-bold text-slate-100">Secure Payment</span>
              <span className="text-[9px] text-slate-400">100% safe & trusted</span>
            </div>
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left bg-slate-800/80 backdrop-blur-md p-2.5 rounded border border-slate-700/60 shadow-none">
              <RefreshCw className="w-4 h-4 text-amber-400 mb-1" />
              <span className="text-[11px] font-bold text-slate-100">Easy Return</span>
              <span className="text-[9px] text-slate-400">Within 7 days</span>
            </div>
          </div>
          {/* CTA Button */}
          <Link
            href={shopMoreLink}
            className="px-6 py-2.5 bg-white hover:bg-slate-100 active:scale-95 text-slate-900 font-extrabold rounded text-xs sm:text-sm inline-flex items-center gap-2 transition-all shadow-none cursor-pointer"
          >
            Shop Now <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {/* Right Single Large Feature Image with 50% OFF Badge */}
        <div className="relative w-full md:w-96 lg:w-[440px] h-56 sm:h-64 md:h-72 flex items-center justify-center flex-shrink-0 z-10">
          <div className="absolute top-0 right-2 z-20 bg-black text-white border border-white/20 font-black text-xs px-3.5 py-1.5 rounded-full shadow-md animate-bounce flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Up to 50% OFF</span>
          </div>
          <div className="relative w-full h-full rounded overflow-hidden flex items-center justify-center">
            <Image
              src={headphoneImg}
              alt="Top Deals Promo"
              fill
              className="object-contain p-2"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
