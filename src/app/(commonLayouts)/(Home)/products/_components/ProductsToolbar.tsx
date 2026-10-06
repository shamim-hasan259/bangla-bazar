"use client";

import React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PiSortAscendingLight } from "react-icons/pi";
import { Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

interface ProductsToolbarProps {
  currentPerPage: number;
  categoryId?: string;
  totalCount?: number;
}

const ProductsToolbar = ({
  currentPerPage,
  categoryId,
  totalCount,
}: ProductsToolbarProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search");

  const handlePerPageChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("perPage", value);
    params.set("page", "1");
    router.push(`/products?${params.toString()}`);
  };

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", value);
    params.set("page", "1");
    router.push(`/products?${params.toString()}`);
  };

  const clearSearch = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("search");
    params.set("page", "1");
    router.push(`/products?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-6 p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/70 dark:border-slate-800 shadow-xs">
      
      {/* Left: Active Filter / Search Indicator */}
      <div className="flex items-center gap-2 px-2 flex-wrap">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Results:
        </span>

        {searchQuery ? (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-black text-white dark:bg-white dark:text-black rounded-full text-xs font-bold shadow-2xs">
            <Search className="w-3 h-3" />
            <span>Keyword: &ldquo;{searchQuery}&rdquo;</span>
            <button
              onClick={clearSearch}
              title="Clear search"
              className="p-0.5 rounded-full hover:bg-white/20 dark:hover:bg-black/20 transition-colors ml-1 cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            All Products
          </span>
        )}
      </div>

      {/* Right: Items per page & Sorting Dropdowns */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Items Per Page */}
        <Select
          value={currentPerPage.toString()}
          onValueChange={handlePerPageChange}
        >
          <SelectTrigger className="w-[115px] h-8.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80">
            <SelectValue placeholder={`Show: ${currentPerPage}`} />
          </SelectTrigger>
          <SelectContent className="rounded-xl shadow-xl">
            <SelectGroup>
              <SelectItem value="12">12 per page</SelectItem>
              <SelectItem value="20">20 per page</SelectItem>
              <SelectItem value="40">40 per page</SelectItem>
              <SelectItem value="60">60 per page</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        {/* Sort Order */}
        <Select onValueChange={handleSortChange}>
          <SelectTrigger className="w-[145px] h-8.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80">
            <PiSortAscendingLight size={15} className="mr-1.5 text-slate-500" />
            <SelectValue placeholder="Sort: Newest" />
          </SelectTrigger>
          <SelectContent className="rounded-xl shadow-xl">
            <SelectGroup>
              <SelectLabel className="text-slate-400 text-[10px] font-extrabold uppercase">
                Order By
              </SelectLabel>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="low">Price: Low to High</SelectItem>
              <SelectItem value="high">Price: High to Low</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default ProductsToolbar;
