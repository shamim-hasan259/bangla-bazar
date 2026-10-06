"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, ArrowRight, ShieldCheck, ChevronLeft, ChevronRight, Package, Users, CheckCircle2 } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { useLanguage } from "@/context/LanguageContext";

interface StoreProductThumb {
  id: string;
  image: string;
  alt: string;
}

interface StoreItem {
  id: string;
  name: string;
  category: string;
  logo: string;
  banner: string;
  rating: number;
  positiveRating: string;
  productsCount: number;
  followers: string;
  badge: string;
  previewProducts: StoreProductThumb[];
}

interface FeaturedSellersSectionProps {
  stores?: any[];
  title?: string;
  shopMoreLink?: string;
}

export default function FeaturedSellersSection({
  stores = [],
  title = "Featured Sellers",
  shopMoreLink = "/products",
}: FeaturedSellersSectionProps) {
  const { t } = useLanguage();
  const [api, setApi] = useState<CarouselApi | null>(null);
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api) return;
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  // High-fidelity curated fallback stores matching top international standards
  const fallbackStores: StoreItem[] = [
    {
      id: "store-1",
      name: "Apex Footwear Official",
      category: "Footwear & Athletic",
      logo: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&auto=format&fit=crop&q=80",
      banner: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&auto=format&fit=crop&q=80",
      rating: 4.9,
      positiveRating: "99%",
      productsCount: 142,
      followers: "12.4k",
      badge: "Verified Seller",
      previewProducts: [
        { id: "p1-1", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=160&auto=format&fit=crop&q=80", alt: "Sneakers" },
        { id: "p1-2", image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=160&auto=format&fit=crop&q=80", alt: "Running Shoes" },
        { id: "p1-3", image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=160&auto=format&fit=crop&q=80", alt: "Casual Wear" },
      ],
    },
    {
      id: "store-2",
      name: "TechWorld Electronics",
      category: "Gadgets & Smart Devices",
      logo: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&auto=format&fit=crop&q=80",
      banner: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=600&auto=format&fit=crop&q=80",
      rating: 4.8,
      positiveRating: "98%",
      productsCount: 310,
      followers: "45.1k",
      badge: "Top Brand",
      previewProducts: [
        { id: "p2-1", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=160&auto=format&fit=crop&q=80", alt: "Headphones" },
        { id: "p2-2", image: "/flashsale/smartphone.jpg", alt: "5G Smartphone" },
        { id: "p2-3", image: "https://images.unsplash.com/photo-1543512214-318c7553f230?w=160&auto=format&fit=crop&q=80", alt: "Smart Speaker" },
      ],
    },
    {
      id: "store-3",
      name: "Aura Beauty & Skincare",
      category: "Cosmetics & Organic Care",
      logo: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&auto=format&fit=crop&q=80",
      banner: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&auto=format&fit=crop&q=80",
      rating: 4.9,
      positiveRating: "99%",
      productsCount: 89,
      followers: "18.9k",
      badge: "Official Store",
      previewProducts: [
        { id: "p3-1", image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=160&auto=format&fit=crop&q=80", alt: "Cosmetics Kit" },
        { id: "p3-2", image: "/flashsale/spa.jpg", alt: "Spa Body Care" },
        { id: "p3-3", image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=160&auto=format&fit=crop&q=80", alt: "Skincare" },
      ],
    },
    {
      id: "store-4",
      name: "Fashion Hub Bangladesh",
      category: "Men & Women Apparel",
      logo: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=200&auto=format&fit=crop&q=80",
      banner: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=600&auto=format&fit=crop&q=80",
      rating: 4.8,
      positiveRating: "97%",
      productsCount: 215,
      followers: "24.7k",
      badge: "Verified Seller",
      previewProducts: [
        { id: "p4-1", image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=160&auto=format&fit=crop&q=80", alt: "Sweater" },
        { id: "p4-2", image: "/img/products/mens-denim-jeans.jpg", alt: "Denim Jeans" },
        { id: "p4-3", image: "/img/products/mens-classic-polo.jpg", alt: "Classic Polo" },
      ],
    },
    {
      id: "store-5",
      name: "SoundMax Audio BD",
      category: "Hi-Fi Studio & Speakers",
      logo: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=200&auto=format&fit=crop&q=80",
      banner: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80",
      rating: 4.9,
      positiveRating: "99%",
      productsCount: 65,
      followers: "15.3k",
      badge: "Top Rated",
      previewProducts: [
        { id: "p5-1", image: "/assets/banner/headphone.png", alt: "Studio Headphone" },
        { id: "p5-2", image: "/img/products/wireless-earbuds.jpg", alt: "Earbuds" },
        { id: "p5-3", image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=160&auto=format&fit=crop&q=80", alt: "Sound Speaker" },
      ],
    },
    {
      id: "store-6",
      name: "TimeCraft Luxury Watches",
      category: "Chronographs & Smartwatches",
      logo: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=200&auto=format&fit=crop&q=80",
      banner: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80",
      rating: 4.9,
      positiveRating: "99%",
      productsCount: 112,
      followers: "32.1k",
      badge: "Official Brand",
      previewProducts: [
        { id: "p6-1", image: "/assets/banner/watches.png", alt: "Chronograph" },
        { id: "p6-2", image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=160&auto=format&fit=crop&q=80", alt: "Classic Watch" },
        { id: "p6-3", image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=160&auto=format&fit=crop&q=80", alt: "Leather Watch" },
      ],
    },
  ];

  const displayStores: StoreItem[] =
    stores && stores.length > 0
      ? stores.map((s, idx) => {
          const match = fallbackStores[idx % fallbackStores.length];
          return {
            id: s.id || match.id,
            name: s.name || match.name,
            category: match.category,
            logo: s.logo || match.logo,
            banner: s.banner || match.banner,
            rating: s.rating || match.rating,
            positiveRating: match.positiveRating,
            productsCount: s._count?.products || s.productsCount || match.productsCount,
            followers: s.followers || match.followers,
            badge: match.badge,
            previewProducts: match.previewProducts,
          };
        })
      : fallbackStores;

  return (
    <section className="w-full py-4 space-y-4 select-none">
      <Carousel
        setApi={setApi}
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        {/* Section Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-6 bg-slate-900 dark:bg-white rounded-full" />
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                {t(title)}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={shopMoreLink}
              className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white flex items-center gap-1 transition-colors"
            >
              {t("explore_stores", "See All Stores")}
              <ChevronRight className="w-4 h-4" />
            </Link>

            <div className="flex items-center gap-1.5 ml-1">
              <button
                onClick={() => api?.scrollPrev()}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-black shadow-2xs flex items-center justify-center cursor-pointer active:scale-95 transition-all"
                aria-label="Previous stores"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => api?.scrollNext()}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-black shadow-2xs flex items-center justify-center cursor-pointer active:scale-95 transition-all"
                aria-label="Next stores"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Store Cards Carousel */}
        <CarouselContent className="-ml-3 sm:-ml-4">
          {displayStores.map((store) => (
            <CarouselItem
              key={store.id}
              className="pl-3 sm:pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
            >
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-xs hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 group flex flex-col justify-between h-full">
                <div>
                  {/* Top Cover Banner */}
                  <div className="relative h-28 sm:h-32 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <Image
                      src={store.banner}
                      alt={store.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent" />

                    {/* Verified/Official Glass Badge */}
                    <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-slate-950/70 backdrop-blur-md text-white font-bold text-[10px] tracking-wide shadow-sm flex items-center gap-1 border border-white/20">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      <span>{store.badge}</span>
                    </div>

                    {/* Subtle Category indicator on top left of banner */}
                    <div className="absolute bottom-2 left-20 z-10">
                      <span className="text-[10px] font-semibold text-slate-200 tracking-wide drop-shadow-xs">
                        {store.category}
                      </span>
                    </div>
                  </div>

                  {/* Card Main Info */}
                  <div className="p-4 pt-0">
                    {/* Store Logo & Rating Row */}
                    <div className="-mt-8 mb-3 relative z-10 flex items-end justify-between">
                      <div className="w-15 h-15 rounded-2xl border-2 border-white dark:border-slate-900 overflow-hidden relative shadow-md bg-white ring-2 ring-black/5 shrink-0">
                        <Image
                          src={store.logo}
                          alt={store.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 px-2.5 py-1 rounded-full text-xs font-black border border-amber-200/80 dark:border-amber-800/50 shadow-2xs">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{store.rating}</span>
                        <span className="text-[10px] text-amber-600/80 dark:text-amber-400/80 font-bold ml-0.5">({store.positiveRating})</span>
                      </div>
                    </div>

                    {/* Store Name & Stats */}
                    <div className="space-y-1 mb-3">
                      <h3 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base line-clamp-1 group-hover:text-black dark:group-hover:text-slate-100 transition-colors">
                        {store.name}
                      </h3>
                      <div className="flex items-center gap-2.5 text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                        <span className="flex items-center gap-1">
                          <Package className="w-3 h-3 text-slate-400" />
                          {store.productsCount} Products
                        </span>
                        <span>&bull;</span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3 text-slate-400" />
                          {store.followers} Fans
                        </span>
                      </div>
                    </div>

                    {/* 3 Mini Product Preview Gallery */}
                    <div className="grid grid-cols-3 gap-2 py-2 border-t border-slate-100 dark:border-slate-800/80">
                      {store.previewProducts.map((prod) => (
                        <div
                          key={prod.id}
                          className="relative aspect-square bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden flex items-center justify-center p-1 group/thumb"
                        >
                          <Image
                            src={prod.image}
                            alt={prod.alt}
                            fill
                            className="object-contain p-1 transition-transform duration-300 group-hover/thumb:scale-110"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom CTA Button */}
                <div className="px-4 pb-4">
                  <Link
                    href={`/store/${store.id}`}
                    className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-black active:scale-[0.98] text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs group-hover:shadow-md"
                  >
                    <span>{t("visit_store")}</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Carousel Pagination Dots */}
        {count > 1 && (
          <div className="flex items-center justify-center gap-1.5 pt-3">
            {[...Array(count)].map((_, i) => (
              <button
                key={i}
                onClick={() => api?.scrollTo(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`transition-all duration-300 rounded-full h-1.5 ${
                  current === i
                    ? "w-6 bg-slate-900 dark:bg-white"
                    : "w-1.5 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400"
                }`}
              />
            ))}
          </div>
        )}
      </Carousel>
    </section>
  );
}
