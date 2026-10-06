"use client";

import React from "react";
import ProductCard from "@/components/home/ProductCard";
import { AllProductProps } from "@/types/interface";

const FlashSalesClient: React.FC<AllProductProps> = ({ products }) => {
  return (
    <div className="bg-[#F5F5F5] dark:bg-slate-950 min-h-screen py-4 sm:py-6">
      <div className="container mx-auto px-4 max-w-[1200px]">
        {/* Title outside the box */}
        <h1 className="text-xl sm:text-2xl font-medium text-slate-800 dark:text-slate-200 mb-3 px-1">
          Flash Sale
        </h1>

        <div className="w-full bg-white dark:bg-slate-900 rounded-sm p-4 sm:p-5 border border-slate-100 dark:border-slate-800 shadow-xs">
          {/* Header inside the box */}
          <div className="flex items-center justify-between gap-2 pb-3 mb-6 border-b border-slate-100 dark:border-slate-800 flex-wrap">
            <div className="text-sm sm:text-base font-bold text-[#f85606]">
              On Sale Now
            </div>
          </div>

          {/* Grid of Flash Sale Products */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
            {products.map((product, index) => (
              <ProductCard key={product.id || index} product={product} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlashSalesClient;
