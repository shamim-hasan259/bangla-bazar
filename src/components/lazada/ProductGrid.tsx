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

interface ProductGridProps {
  products?: any[];
  title?: string;
}

const ProductGrid = ({ products = [], title = "Weekly Best Product" }: ProductGridProps) => {
  const [api, setApi] = useState<CarouselApi | null>(null);

  const ecommerceProducts = [
    {
      id: "prod-1",
      name: "Foldable Mobile Stand for Smartphones..",
      price: 8.00,
      mrp: 10.00,
      photo: techBundleImg.src,
      rating: 4.5,
      reviews: "21k"
    },
    {
      id: "prod-2",
      name: "HBS-730 In the Ear Bluetooth Neckba...",
      price: 19.00,
      mrp: 20.00,
      photo: electronicsImg.src,
      rating: 4.5,
      reviews: "21k"
    },
    {
      id: "prod-3",
      name: "Zeb-Duke 2 Wireless Headphone That...",
      price: 24.00,
      mrp: 25.00,
      photo: headphoneImg.src,
      rating: 4.5,
      reviews: "21k"
    },
    {
      id: "prod-4",
      name: "Power Bank for Smartphones...",
      price: 15.00,
      mrp: 17.00,
      photo: techBundleImg.src,
      rating: 4.5,
      reviews: "21k"
    },
    {
      id: "prod-5",
      name: "Aura Nocturne Eau De Parfum 100ml",
      price: 45.00,
      mrp: 55.00,
      photo: beautyImg.src,
      rating: 4.8,
      reviews: "15k"
    },
    {
      id: "prod-6",
      name: "Pro Slim Silver Laptop 15.6 Inch",
      price: 599.00,
      mrp: 699.00,
      photo: laptopsImg.src,
      rating: 4.9,
      reviews: "32k"
    },
    {
      id: "prod-7",
      name: "Luxury Chronograph Leather Watch",
      price: 120.00,
      mrp: 150.00,
      photo: watchesImg.src,
      rating: 4.7,
      reviews: "18k"
    },
    {
      id: "prod-8",
      name: "Pro Athletic Running Sneakers",
      price: 65.00,
      mrp: 80.00,
      photo: fashionImg.src,
      rating: 4.6,
      reviews: "24k"
    },
    {
      id: "prod-9",
      name: "Smart Watch Series 8 Bluetooth",
      price: 49.00,
      mrp: 65.00,
      photo: watch__img.src,
      rating: 4.7,
      reviews: "12k"
    },
    {
      id: "prod-10",
      name: "Studio Pro Noise Cancelling Headset",
      price: 189.00,
      mrp: 220.00,
      photo: headphoneImg.src,
      rating: 4.9,
      reviews: "40k"
    },
  ];

  const displayProducts =
    products.length > 0
      ? products.map((p, idx) => {
          const match = ecommerceProducts[idx % ecommerceProducts.length];
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
      : ecommerceProducts;



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
        {/* Header Section with Title & Slide Navigation Buttons */}
        <div className="flex items-center justify-between mb-4 px-1 select-none">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#1e1e38] tracking-tight">
              {title}
            </h2>
          </div>

          {/* Top Slide Navigation Buttons */}
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

        {/* Carousel Content */}
        <CarouselContent className="-ml-3 sm:-ml-4">
          {displayProducts.map((product, idx) => (
            <CarouselItem
              key={`${product.id}-${idx}`}
              className="pl-3 sm:pl-4 basis-[46%] min-[420px]:basis-[44%] sm:basis-[31%] md:basis-[23%] lg:basis-[16.2%]"
            >
              <ProductCard product={product} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

    </div>
  );
};

export default ProductGrid;
