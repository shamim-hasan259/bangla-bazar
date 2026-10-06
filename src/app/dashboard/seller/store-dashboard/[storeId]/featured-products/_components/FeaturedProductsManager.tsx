"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Search, Star, StarOff, Package, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toggleFeaturedProduct } from "../_action";
import { toast } from "sonner";

interface IProduct {
  id: string;
  name: string;
  photo: any;
  price: number;
  stock: number;
  isFeatured: boolean;
}

interface FeaturedProductsManagerProps {
  storeId: string;
  initialProducts: IProduct[];
}

export default function FeaturedProductsManager({
  storeId,
  initialProducts,
}: FeaturedProductsManagerProps) {
  const [products, setProducts] = useState<IProduct[]>(initialProducts);
  const [search, setSearch] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const featuredCount = products.filter((p) => p.isFeatured).length;

  const handleToggle = async (productId: string) => {
    try {
      setLoadingId(productId);
      const res = await toggleFeaturedProduct(storeId, productId);
      if (res.success) {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === productId ? { ...p, isFeatured: res.featured ?? false } : p
          )
        );
        toast.success(
          res.featured
            ? "Product highlighted in featured collection!"
            : "Product removed from featured collection."
        );
      } else {
        toast.error(res.error || "Operation failed");
      }
    } catch {
      toast.error("Failed to update featured status");
    } finally {
      setLoadingId(null);
    }
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Overview Stat card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">Featured Collection Manager</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md">
            Highlight up to 20 signature products that will display directly on the "Store" tab of your public landing storefront.
          </p>
        </div>
        <div className="bg-slate-50 dark:bg-slate-950/20 border rounded-2xl px-6 py-3 shrink-0 text-center">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Featured Limit</span>
          <span className="text-lg font-black text-[#1E60ED] mt-0.5 block">{featuredCount} / 20</span>
        </div>
      </div>

      {/* Filter and List Panel */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-6">
        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search store products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#1E60ED]/20 focus:border-[#1E60ED] transition-all"
          />
        </div>

        {/* Product rows list */}
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Package className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-xs font-semibold">No products matched the filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs text-slate-600 dark:text-slate-400">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 pb-3">
                  <th className="pb-3 pr-4">Product Info</th>
                  <th className="pb-3 px-4">Price</th>
                  <th className="pb-3 px-4">Stock</th>
                  <th className="pb-3 pl-4 text-right">Feature on Landing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                {filtered.map((p) => {
                  let imgUrl = "";
                  if (p.photo) {
                    if (Array.isArray(p.photo)) {
                      const first = p.photo[0];
                      imgUrl = typeof first === "string" ? first : (first?.productImg || "");
                    } else if (typeof p.photo === "string") {
                      imgUrl = p.photo;
                    }
                  }

                  const isLoading = loadingId === p.id;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/10 transition-colors">
                      {/* Info */}
                      <td className="py-4 pr-4 flex items-center gap-3">
                        <div className="w-10 h-10 border rounded-lg overflow-hidden shrink-0 bg-slate-50 relative flex items-center justify-center">
                          {imgUrl ? (
                            <img src={imgUrl} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-5 h-5 text-slate-350" />
                          )}
                        </div>
                        <span className="font-bold text-slate-850 dark:text-slate-200 line-clamp-1">{p.name}</span>
                      </td>

                      {/* Price */}
                      <td className="py-4 px-4 font-bold text-slate-800 dark:text-slate-200">
                        ৳ {p.price}
                      </td>

                      {/* Stock */}
                      <td className="py-4 px-4 font-semibold">
                        {p.stock} pcs
                      </td>

                      {/* Toggle switch */}
                      <td className="py-4 pl-4 text-right">
                        <div className="inline-flex items-center gap-3">
                          {isLoading ? (
                            <Loader2 className="w-4 h-4 text-[#1E60ED] animate-spin" />
                          ) : (
                            <Switch
                              checked={p.isFeatured}
                              onCheckedChange={() => handleToggle(p.id)}
                            />
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
