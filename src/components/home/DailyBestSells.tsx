"use client";

import React, { useState } from "react";
import ProductCard from "./ProductCard";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

import headphoneImg from "@/assets/banner/headphone.png";
import watchesImg from "@/assets/banner/watches.png";
import techBundleImg from "@/assets/banner/tech_bundle.png";
import electronicsImg from "@/assets/categories/electronics.png";
import fashionImg from "@/assets/categories/fashion.png";
import beautyImg from "@/assets/categories/beauty.png";
import laptopsImg from "@/assets/categories/laptops.png";
import watch__img from "@/assets/smart-watch.png";

interface DailyBestSellsProps {
  products: any[];
  title?: string;
  subTitle?: string;
  shopMoreLink?: string;
}

const DailyBestSells: React.FC<DailyBestSellsProps> = ({
  products,
  title = "Flash Sale",
  subTitle = "On Sale Now",
  shopMoreLink = "/flash-sales",
}) => {
  const [api, setApi] = useState<CarouselApi | null>(null);

  const fallbackProducts = [
    { id: "fs-1", name: "Foldable Mobile Stand for Smartphones..", price: 8.00, mrp: 10.00, photo: techBundleImg.src, rating: 4.5, reviews: "21k" },
    { id: "fs-2", name: "HBS-730 In the Ear Bluetooth Neckband..", price: 19.00, mrp: 25.00, photo: electronicsImg.src, rating: 4.5, reviews: "21k" },
    { id: "fs-3", name: "Zeb-Duke 2 Wireless Headphone That..", price: 24.00, mrp: 30.00, photo: headphoneImg.src, rating: 4.5, reviews: "21k" },
    { id: "fs-4", name: "Power Bank 20000mAh for Smartphones", price: 15.00, mrp: 20.00, photo: techBundleImg.src, rating: 4.5, reviews: "21k" },
    { id: "fs-5", name: "Aura Nocturne Eau De Parfum 100ml", price: 45.00, mrp: 60.00, photo: beautyImg.src, rating: 4.8, reviews: "15k" },
    { id: "fs-6", name: "Pro Slim Silver Laptop 15.6 Inch", price: 599.00, mrp: 750.00, photo: laptopsImg.src, rating: 4.9, reviews: "32k" },
    { id: "fs-7", name: "Luxury Chronograph Leather Watch", price: 120.00, mrp: 160.00, photo: watchesImg.src, rating: 4.7, reviews: "18k" },
    { id: "fs-8", name: "Pro Athletic Running Sneakers", price: 65.00, mrp: 90.00, photo: fashionImg.src, rating: 4.6, reviews: "24k" },
    { id: "fs-9", name: "Smart Watch Series 8 Bluetooth", price: 49.00, mrp: 70.00, photo: watch__img.src, rating: 4.7, reviews: "12k" },
    { id: "fs-10", name: "Studio Pro Noise Cancelling Headset", price: 189.00, mrp: 250.00, photo: headphoneImg.src, rating: 4.9, reviews: "40k" },
    { id: "fs-11", name: "Wireless Magnetic Fast Charger 20W", price: 29.00, mrp: 40.00, photo: techBundleImg.src, rating: 4.6, reviews: "19k" },
    { id: "fs-12", name: "True Wireless Earbuds IPX7 Waterproof", price: 39.00, mrp: 55.00, photo: electronicsImg.src, rating: 4.8, reviews: "27k" },
  ];

  const filtered =
    title === "Flash Sale"
      ? products.filter((p) => p.mrp && p.mrp > p.price)
      : products;

  const displayProducts =
    filtered.length > 0
      ? filtered.map((p, idx) => {
        const match = fallbackProducts[idx % fallbackProducts.length];
        return {
          id: p.id || match.id,
          name: p.name && !p.name.toLowerCase().includes("t-shirt") ? p.name : match.name,
          price: p.price || match.price,
          mrp: p.mrp || match.mrp,
          photo: p.photo && !p.photo.includes("placeholder") ? p.photo : match.photo,
          rating: match.rating,
          reviews: match.reviews,
        };
      })
      : fallbackProducts;

  return (
    <div className="w-full mt-6 mb-8 select-none">
      <Carousel
        setApi={setApi}
        opts={{
          align: "start",
          loop: true,
          dragFree: true,
        }}
        className="w-full"
      >
        {/* Section Header */}
        <div className="flex items-center justify-between mb-4 px-1 select-none">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-6 bg-slate-900 dark:bg-white rounded-full" />
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
              {title}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Shop More Link */}
            <Link
              href={shopMoreLink}
              className="text-[10px] sm:text-xs font-bold text-slate-900 dark:text-slate-100 hover:text-black px-3.5 py-1.5 border border-slate-900 dark:border-slate-700 rounded-sm transition-all uppercase tracking-wider bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              SHOP ALL
            </Link>

            {/* Slide Navigation Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => api?.scrollPrev()}
                className="p-1.5 sm:p-2 rounded-full border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 shadow-sm cursor-pointer active:scale-95 transition-all"
                aria-label="Previous products"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => api?.scrollNext()}
                className="p-1.5 sm:p-2 rounded-full border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 shadow-sm cursor-pointer active:scale-95 transition-all"
                aria-label="Next products"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Product Cards */}
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

    </div>
  );
};

export default DailyBestSells;
