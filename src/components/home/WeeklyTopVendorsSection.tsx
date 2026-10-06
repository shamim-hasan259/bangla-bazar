"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Star, ChevronRight, Store, ArrowRight, Loader2 } from "lucide-react";
import axios from "axios";
import { useLanguage } from "@/context/LanguageContext";

interface VendorProduct {
  id: string;
  name: string;
  image: string;
}

interface VendorCard {
  id: string;
  name: string;
  rating: number;
  reviews: number;
  slug: string;
  logo?: string;
  products: VendorProduct[];
}

export default function WeeklyTopVendorsSection() {
  const { t } = useLanguage();
  const [vendors, setVendors] = useState<VendorCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchVendors = async () => {
      try {
        setLoading(true);
        const res = await axios.get("/api/store?includeProducts=true&limit=6");
        let storeData = (Array.isArray(res.data) && res.data.length > 0) ? res.data : [];
        if (storeData.length === 0) {
          const fallbackRes = await axios.get("/api/store?limit=6");
          if (Array.isArray(fallbackRes.data)) storeData = fallbackRes.data;
        }

        if (isMounted && storeData.length > 0) {
          const mapped: VendorCard[] = storeData.map((store: any, idx: number) => {
            const storeProducts: VendorProduct[] = (store.products || []).map((p: any) => {
              let photoUrl = "/flashsale/plant.jpg";
              if (p.photo && typeof p.photo === "string") photoUrl = p.photo;
              else if (Array.isArray(p.photo) && p.photo.length > 0) photoUrl = p.photo[0];

              return {
                id: p.id,
                name: p.name,
                image: photoUrl,
              };
            });

            return {
              id: store.id,
              name: store.storeNameEn || store.storeNameBn || store.storeName || `Top Vendor ${idx + 1}`,
              rating: 4.8,
              reviews: store._count?.products || 25,
              slug: `/store/${store.slug}`,
              logo: store.storeLogo,
              products: storeProducts,
            };
          });

          setVendors(mapped);
        }
      } catch (err) {
        console.error("Failed to load top vendors:", err);
        try {
          const fallbackRes = await axios.get("/api/store?limit=6");
          if (isMounted && Array.isArray(fallbackRes.data) && fallbackRes.data.length > 0) {
            const mapped = fallbackRes.data.map((store: any, idx: number) => ({
              id: store.id,
              name: store.storeNameEn || store.storeNameBn || store.storeName || `Top Vendor ${idx + 1}`,
              rating: 4.8,
              reviews: store._count?.products || 25,
              slug: `/store/${store.slug}`,
              logo: store.storeLogo,
              products: [],
            }));
            setVendors(mapped);
          }
        } catch (e) {
          // ignore
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchVendors();

    return () => {
      isMounted = false;
    };
  }, []);

  if (!loading && vendors.length === 0) {
    return null;
  }

  return (
    <section className="w-full py-4 space-y-4 select-none">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-6 bg-slate-900 dark:bg-white rounded-full" />
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
            {t("weekly_top_vendors")}
          </h2>
        </div>
        <Link
          href="/products"
          className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white flex items-center gap-1 transition-colors"
        >
          {t("view_all_short")}
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Main Container Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 sm:gap-6">
        {/* Left Promo Banner (1 Column) */}
        <div className="lg:col-span-1 relative rounded-2xl overflow-hidden shadow-xs border border-slate-200 dark:border-slate-800 min-h-[360px] flex flex-col justify-between p-6 group">
          {/* Background Image & Overlay */}
          <Image
            src="/flashsale/vendor_banner.jpg"
            alt="Weekly Vendors Special Sale"
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/50 to-teal-900/40" />

          {/* Top Badge */}
          <div className="relative z-10">
            <span className="inline-flex items-center gap-1 bg-red-600 text-white font-black text-[10px] tracking-wider uppercase px-3 py-1 rounded-full shadow-sm">
              50% {t("off")}
            </span>
          </div>

          {/* Bottom Banner Content */}
          <div className="relative z-10 space-y-2 text-white">
            <p className="text-xs font-bold text-teal-300 uppercase tracking-widest">
              {t("special_offer", "Special Offer")}
            </p>
            <h3 className="text-xl sm:text-2xl font-black uppercase leading-tight tracking-tight drop-shadow-md">
              {t("sale", "SALE")}
            </h3>
            <p className="text-xs text-slate-200 line-clamp-2">
              {t("discover_top_sellers", "Discover top-rated sellers & exclusive deals this week.")}
            </p>
            <div className="pt-2">
              <Link
                href="/products?sort=deals"
                className="inline-flex items-center gap-1.5 bg-black hover:bg-slate-800 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition-all shadow-md active:scale-95"
              >
                <span>{t("shop_now")}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Right 3x2 Vendor Cards Grid (3 Columns) */}
        {loading ? (
          <div className="lg:col-span-3 h-44 w-full flex items-center justify-center py-4">
            <Loader2 className="w-8 h-8 animate-spin text-[#1E60ED]" />
          </div>
        ) : (
          <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
            {vendors.map((vendor) => (
              <div
                key={vendor.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between gap-3 group"
              >
                {/* Top Row: Store Icon + Vendor Info + Arrow Link */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center shrink-0 border border-slate-200/60 dark:border-slate-700 overflow-hidden">
                      {vendor.logo && vendor.logo.startsWith("http") ? (
                        <img
                          src={vendor.logo}
                          alt={vendor.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Store className="w-5 h-5 text-slate-800 dark:text-slate-200" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-black dark:group-hover:text-slate-200 transition-colors">
                        {vendor.name}
                      </h4>
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        <div className="flex items-center text-amber-400">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                        <span className="font-semibold text-slate-700 dark:text-slate-300 ml-0.5">
                          {vendor.rating}/5
                        </span>
                        <span>({vendor.reviews} products)</span>
                      </div>
                    </div>
                  </div>

                  <Link
                    href={vendor.slug}
                    className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 hover:bg-slate-900 hover:text-white text-slate-600 dark:text-slate-300 flex items-center justify-center transition-all shrink-0 border border-slate-200 dark:border-slate-700 shadow-2xs"
                    aria-label={`View ${vendor.name}`}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>

                {/* Bottom Row: Featured Product Thumbnails */}
                <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                  {vendor.products.length > 0
                    ? vendor.products.map((prod) => (
                        <Link
                          key={prod.id}
                          href={`/products/${prod.id}`}
                          className="relative aspect-square bg-slate-50 dark:bg-slate-800/40 rounded-xl p-1.5 border border-slate-100 dark:border-slate-800 overflow-hidden flex items-center justify-center group/item"
                        >
                          <img
                            src={prod.image}
                            alt={prod.name}
                            className="w-full h-full object-contain p-1 transition-transform duration-300 group-hover/item:scale-110"
                          />
                        </Link>
                      ))
                    : [1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="relative aspect-square bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-center"
                        >
                          <Store className="w-4 h-4 text-slate-300" />
                        </div>
                      ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
