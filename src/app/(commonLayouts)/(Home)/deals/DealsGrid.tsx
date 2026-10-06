"use client";

import React, { useState } from "react";
import ProductCard from "@/components/home/ProductCard";

interface DealsGridProps {
  products: any[];
}

export default function DealsGrid({ products }: DealsGridProps) {
  const [limit, setLimit] = useState(10);
  const visibleProducts = products.slice(0, limit);
  const hasMore = products.length > limit;

  const handleShowMore = () => {
    setLimit(products.length); // Show all products
  };

  return (
    <div className="flex flex-col items-center w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 w-full">
        {visibleProducts.map((product) => (
          <div
            key={product.id}
            className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800/80 shadow-2xs hover:shadow-md transition-all duration-200"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center mt-10">
          <button
            onClick={handleShowMore}
            className="px-8 py-2.5 bg-gradient-to-r from-[#F85606] to-[#ff7e36] hover:opacity-95 text-white font-bold rounded-xl transition-all shadow-xs cursor-pointer text-xs sm:text-sm uppercase tracking-wider border-none outline-none"
          >
            Show More
          </button>
        </div>
      )}
    </div>
  );
}
