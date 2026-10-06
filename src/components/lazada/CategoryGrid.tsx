"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

import electronicsImg from "@/assets/categories/electronics.png";
import fashionImg from "@/assets/categories/fashion.png";
import beautyImg from "@/assets/categories/beauty.png";
import watchesImg from "@/assets/categories/watches.png";
import laptopsImg from "@/assets/categories/laptops.png";

interface CategoryGridProps {
  categories: any[];
}

const CategoryGrid = ({ categories = [] }: CategoryGridProps) => {
  const [api, setApi] = useState<CarouselApi | null>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const defaultEcommerceCategories = [
    {
      id: "electronics",
      name: "Electronics",
      image: electronicsImg.src,
      link: "/products?category=electronics",
    },
    {
      id: "fashion",
      name: "Fashion & Apparel",
      image: fashionImg.src,
      link: "/products?category=fashion",
    },
    {
      id: "watches",
      name: "Watches & Jewelry",
      image: watchesImg.src,
      link: "/products?category=watches",
    },
    {
      id: "laptops",
      name: "Laptops & Tech",
      image: laptopsImg.src,
      link: "/products?category=laptops",
    },
    {
      id: "beauty",
      name: "Beauty & Skincare",
      image: beautyImg.src,
      link: "/products?category=beauty",
    },
    {
      id: "gadgets",
      name: "Mobiles & Gadgets",
      image: electronicsImg.src,
      link: "/products?category=gadgets",
    },
    {
      id: "shoes",
      name: "Footwear & Shoes",
      image: fashionImg.src,
      link: "/products?category=shoes",
    },
    {
      id: "smartwatches",
      name: "Smart Watches",
      image: watchesImg.src,
      link: "/products?category=smartwatches",
    },
    {
      id: "computers",
      name: "Computers & Office",
      image: laptopsImg.src,
      link: "/products?category=computers",
    },
    {
      id: "perfumes",
      name: "Fragrance & Care",
      image: beautyImg.src,
      link: "/products?category=perfumes",
    },
    {
      id: "audio",
      name: "Headphones & Audio",
      image: electronicsImg.src,
      link: "/products?category=audio",
    },
    {
      id: "sports",
      name: "Sports & Fitness",
      image: fashionImg.src,
      link: "/products?category=sports",
    },
  ];

  const assetList = [
    electronicsImg.src,
    fashionImg.src,
    watchesImg.src,
    laptopsImg.src,
    beautyImg.src,
  ];

  const categoriesToRender =
    categories.length > 0
      ? categories.map((cat, index) => {
          let photoSrc = cat.photo;
          if (!photoSrc || photoSrc.includes("store-media") || photoSrc.includes("unsplash")) {
            photoSrc = assetList[index % assetList.length];
          } else if (!photoSrc.startsWith("/") && !photoSrc.startsWith("http")) {
            photoSrc = `/img/categories/${photoSrc}`;
          }

          return {
            id: cat.id || `cat-${index}`,
            name: cat.name || "Category",
            image: photoSrc,
            link: `/products?category=${cat.id}`,
          };
        })
      : defaultEcommerceCategories;

  const displayList =
    categoriesToRender.length < 12
      ? [
          ...categoriesToRender,
          ...defaultEcommerceCategories.slice(categoriesToRender.length),
        ]
      : categoriesToRender;

  useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
    };

    onSelect();
    api.on("select", onSelect);
    api.on("reInit", onSelect);

    return () => {
      api.off("select", onSelect);
      api.off("reInit", onSelect);
    };
  }, [api]);

  return (
    <section className="w-full mt-4 sm:mt-6 mb-4">
      <Carousel
        setApi={setApi}
        opts={{
          align: "start",
          loop: true,
          dragFree: true,
        }}
        className="w-full"
      >
        {/* Header Section with Title & Slide Buttons */}
        <div className="flex items-center justify-between mb-3.5 px-1 select-none">
          <div>
            <h2 className="text-lg sm:text-2xl font-extrabold text-[#1e1e38] tracking-tight">
              Shop by Category
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              What are you looking for today
            </p>
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

        {/* Category Cards Carousel Slider (Responsive Cards) */}
        <CarouselContent className="-ml-2 sm:-ml-2.5">
          {displayList.map((category, index) => (
            <CarouselItem
              key={`${category.id}-${index}`}
              className="pl-2 sm:pl-2.5 basis-[29%] min-[480px]:basis-[22%] sm:basis-[16.66%] md:basis-[14.28%] lg:basis-[11.11%] xl:basis-[9.09%]"
            >
              <Link
                href={category.link || `/products?category=${category.id}`}
                className="group flex flex-col justify-between bg-white rounded-xl border border-slate-100 dark:border-slate-800 hover:border-blue-200 hover:shadow-sm transition-all duration-300 overflow-hidden select-none h-full"
              >
                {/* Top Image Container */}
                <div className="w-full aspect-square p-2 sm:p-2.5 flex items-center justify-center bg-[#f8fafc] dark:bg-slate-800/40 relative overflow-hidden">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.src = assetList[index % assetList.length];
                    }}
                  />
                </div>

                {/* Bottom Category Name */}
                <div className="py-1.5 px-1 text-center w-full bg-white dark:bg-slate-900 flex items-center justify-center min-h-[32px] sm:min-h-[36px]">
                  <span className="text-[11px] sm:text-xs font-bold text-[#1e1e38] dark:text-slate-200 group-hover:text-blue-600 transition-colors line-clamp-1 leading-snug">
                    {category.name}
                  </span>
                </div>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  );
};

export default CategoryGrid;
