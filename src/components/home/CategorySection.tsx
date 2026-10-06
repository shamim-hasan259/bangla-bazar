"use client";

import React, { useState, useEffect } from "react";
import ProductCard from "./ProductCard";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import axios from "axios";
import { useLanguage } from "@/context/LanguageContext";

interface CategorySectionProps {
  title: string;
  categoryKey: string;
  shopMoreLink?: string;
  products?: any[];
}

const CategorySection: React.FC<CategorySectionProps> = ({
  title,
  categoryKey,
  shopMoreLink,
  products,
}) => {
  const { t } = useLanguage();
  const [api, setApi] = useState<CarouselApi | null>(null);
  const [fetchedProducts, setFetchedProducts] = useState<any[]>(products || []);
  const [loading, setLoading] = useState<boolean>(!products || products.length === 0);

  useEffect(() => {
    if (products && products.length > 0) {
      setFetchedProducts(products);
      setLoading(false);
      return;
    }

    let isMounted = true;
    const fetchCategoryProducts = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/products?category=${encodeURIComponent(categoryKey)}&limit=12`);
        if (isMounted) {
          if (Array.isArray(res.data) && res.data.length > 0) {
            setFetchedProducts(res.data);
          } else {
            // Fallback: general products
            const fallbackRes = await axios.get(`/api/products?limit=8`);
            if (isMounted && Array.isArray(fallbackRes.data)) {
              setFetchedProducts(fallbackRes.data);
            }
          }
        }
      } catch (err) {
        console.error(`Error loading category products for ${categoryKey}:`, err);
        try {
          const fallbackRes = await axios.get(`/api/products?limit=8`);
          if (isMounted && Array.isArray(fallbackRes.data) && fallbackRes.data.length > 0) {
            setFetchedProducts(fallbackRes.data);
          }
        } catch (fallbackErr) {
          // ignore
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCategoryProducts();

    return () => {
      isMounted = false;
    };
  }, [categoryKey]); // Only depend on categoryKey to prevent infinite loop



  const link = shopMoreLink || `/products?category=${categoryKey.toLowerCase()}`;

  // Format products consistently for ProductCard
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
      rating: p.averageRating || 4.7,
      reviews: p.reviewCount ? `${p.reviewCount}` : "25",
      stock: p.stock ?? 50,
      slug: p.slug,
    };
  });

  if (!loading && displayProducts.length === 0) {
    return null;
  }

  return (
    <div className="w-full mt-6 mb-8 select-none">
      <Carousel
        setApi={setApi}
        opts={{ align: "start", loop: true, dragFree: true }}
        className="w-full"
      >
        {/* Section Header with Title & Top Slide Buttons */}
        <div className="flex items-center justify-between mb-4 px-1 select-none">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-6 bg-slate-900 dark:bg-white rounded-full" />
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
              {t(title)}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={link}
              className="hidden sm:inline-flex text-[10px] font-bold text-slate-900 dark:text-slate-100 hover:text-black px-3 py-1.5 border border-slate-900 dark:border-slate-700 rounded-sm transition-all uppercase tracking-wider hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {t("shop_all", "Shop All")}
            </Link>

            {/* Prev / Next Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => api?.scrollPrev()}
                className="p-1.5 sm:p-2 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-xs cursor-pointer active:scale-95 transition-all"
                aria-label="Previous products"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => api?.scrollNext()}
                className="p-1.5 sm:p-2 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-xs cursor-pointer active:scale-95 transition-all"
                aria-label="Next products"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Product Cards Carousel Slider */}
        {loading ? (
          <div className="h-56 w-full flex items-center justify-center py-4">
            <Loader2 className="w-8 h-8 animate-spin text-[#1E60ED]" />
          </div>
        ) : (
          <CarouselContent className="-ml-3 sm:-ml-4">
            {displayProducts.map((product: any, idx: number) => (
              <CarouselItem
                key={`${product.id}-${idx}`}
                className="pl-3 sm:pl-4 basis-[48%] min-[420px]:basis-[45%] sm:basis-[33.33%] md:basis-[25%] lg:basis-[20%]"
              >
                <ProductCard product={product} />
              </CarouselItem>
            ))}
          </CarouselContent>
        )}
      </Carousel>

    </div>
  );
};

export default CategorySection;
