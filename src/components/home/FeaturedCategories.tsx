"use client";

import React, { useState, useEffect, useMemo } from "react";
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

import electronicsImg from "@/assets/categories/electronics.png";
import fashionImg from "@/assets/categories/fashion.png";
import beautyImg from "@/assets/categories/beauty.png";
import watchesImg from "@/assets/categories/watches.png";
import laptopsImg from "@/assets/categories/laptops.png";

interface SubCategoryItem {
  id: string;
  name: string;
  link: string;
}

interface CategoryItem {
  id: string;
  name: string;
  image: string;
  link: string;
  subcategories?: SubCategoryItem[];
}

interface FeaturedCategoriesProps {
  categories?: any[];
}

function CategoryCardItem({
  category,
  imgSrc,
}: {
  category: CategoryItem;
  imgSrc: string;
}) {
  const { t } = useLanguage();
  return (
    <Link
      href={category.link || `/products?category=${category.id}`}
      className="group flex flex-col justify-between bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-md transition-all duration-300 overflow-hidden select-none h-full relative z-10"
    >
      {/* Top Image Container */}
      <div className="w-full aspect-square p-2 sm:p-2.5 flex items-center justify-center bg-[#f8fafc] dark:bg-slate-800/40 relative overflow-hidden">
        <img
          src={imgSrc}
          alt={category.name}
          className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = electronicsImg.src;
          }}
        />
      </div>

      {/* Bottom Category Name */}
      <div className="py-1.5 px-1 text-center w-full bg-white dark:bg-slate-900 flex items-center justify-center min-h-[32px] sm:min-h-[36px]">
        <span className="text-[11px] sm:text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1 leading-snug">
          {t(category.name)}
        </span>
      </div>
    </Link>
  );
}

const FeaturedCategories = ({ categories: initialCategories }: FeaturedCategoriesProps) => {
  const { t } = useLanguage();
  const [api, setApi] = useState<CarouselApi | null>(null);
  const [categories, setCategories] = useState<any[]>(initialCategories || []);
  const [loading, setLoading] = useState<boolean>(!initialCategories || initialCategories.length === 0);

  useEffect(() => {
    const hasValidSubcategories =
      initialCategories &&
      initialCategories.length > 0 &&
      initialCategories.some((c: any) => c.subcategories && c.subcategories.length > 0);

    if (hasValidSubcategories) {
      setCategories(initialCategories);
      setLoading(false);
      return;
    }

    let isMounted = true;
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const res = await axios.get("/api/category");
        if (isMounted && Array.isArray(res.data)) {
          setCategories(res.data);
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCategories();

    return () => {
      isMounted = false;
    };
  }, [initialCategories]);

  const assetList = [
    electronicsImg.src,
    fashionImg.src,
    watchesImg.src,
    laptopsImg.src,
    beautyImg.src,
  ];

  const categoriesToRender: CategoryItem[] = useMemo(() => {
    return categories.map((cat, index) => {
      let photoSrc = cat.photo;
      if (!photoSrc || photoSrc.includes("store-media") || photoSrc.includes("unsplash")) {
        photoSrc = assetList[index % assetList.length];
      } else if (photoSrc.startsWith("/") || photoSrc.startsWith("http")) {
        photoSrc = photoSrc;
      } else {
        photoSrc = `/img/categories/${photoSrc}`;
      }

      const subList = (cat.subcategories || []).map((sub: any) => ({
        id: sub.id || sub.code,
        name: sub.name,
        link: `/products?category=${sub.id || sub.code}`,
      }));

      return {
        id: cat.id || `cat-${index}`,
        name: cat.name || "Category",
        image: photoSrc,
        link: `/products?category=${cat.id}`,
        subcategories: subList,
      };
    });
  }, [categories]);

  // Ensure plenty of slides for seamless full-width coverage and loop sliding
  const displayCategories = useMemo(() => {
    if (categoriesToRender.length === 0) return [];
    let list = [...categoriesToRender];
    while (list.length < 20) {
      list = [...list, ...categoriesToRender];
    }
    return list;
  }, [categoriesToRender]);

  if (!loading && categoriesToRender.length === 0) {
    return null;
  }

  return (
    <section className="w-full mt-4 sm:mt-6 mb-4 select-none">
      <Carousel
        setApi={setApi}
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        {/* Header Section with Title & Slide Buttons */}
        <div className="flex items-center justify-between mb-3.5 px-1 select-none">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-6 bg-slate-900 dark:bg-white rounded-full" />
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
              {t("shop_by_category")}
            </h2>
          </div>

          {/* Top Slide Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => api?.scrollPrev()}
              className="p-1.5 sm:p-2 rounded-full border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 hover:border-slate-300 shadow-sm cursor-pointer active:scale-95 transition-all"
              aria-label="Previous categories"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => api?.scrollNext()}
              className="p-1.5 sm:p-2 rounded-full border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 hover:border-slate-300 shadow-sm cursor-pointer active:scale-95 transition-all"
              aria-label="Next categories"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Category Cards Carousel Slider */}
        {loading ? (
          <div className="h-28 w-full flex items-center justify-center py-2">
            <Loader2 className="w-7 h-7 animate-spin text-[#1E60ED]" />
          </div>
        ) : (
          <CarouselContent className="-ml-2 sm:-ml-2.5">
            {displayCategories.map((category, index) => (
              <CarouselItem
                key={`${category.id}-${index}`}
                className="pl-2 sm:pl-2.5 basis-[28%] min-[480px]:basis-[22%] sm:basis-[16.66%] md:basis-[14.28%] lg:basis-[11.11%] xl:basis-[10%] 2xl:basis-[8.33%]"
              >
                <CategoryCardItem category={category} imgSrc={category.image} />
              </CarouselItem>
            ))}
          </CarouselContent>
        )}
      </Carousel>
    </section>
  );
};

export default FeaturedCategories;
