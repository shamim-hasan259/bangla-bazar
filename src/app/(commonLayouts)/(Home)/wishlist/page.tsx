"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Heart, Trash2, ArrowLeft, ShoppingCart, Sparkles } from "lucide-react";
import { RootState } from "@/app/redux-store/store";
import { removeFromWishlist, clearWishlist } from "@/app/redux-store/Slice/WishlistSlice";
import { addToCart } from "@/app/redux-store/Slice/CartSlice";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import ProductCard from "@/components/home/ProductCard";

export default function WishlistPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const dispatch = useDispatch();
  const wishlistItems = useSelector((state: RootState) => state.wishlist?.items || []);

  useEffect(() => {
    setMounted(true);
    if (status !== "loading" && !session?.user) {
      toast.error("Please log in to view your wishlist!");
      router.push("/auth/customer/login?callbackUrl=/wishlist");
    }
  }, [session, status, router]);

  if (!mounted || status === "loading" || !session?.user) {
    return (
      <div className="min-h-[500px] flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded mb-2"></div>
          <div className="h-3 w-48 bg-slate-200 dark:bg-slate-800 rounded"></div>
        </div>
      </div>
    );
  }

  const handleClearAll = () => {
    dispatch(clearWishlist());
    toast.success("Wishlist cleared");
  };

  return (
    <div className="bg-[#f8f9fa] dark:bg-slate-950 min-h-screen py-8">
      <div className="max-w-[1200px] mx-auto px-4">
        {/* Heading */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
              <Heart className="w-8 h-8 text-rose-500 fill-rose-500" />
              My Wishlist
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {wishlistItems.length} {wishlistItems.length === 1 ? "item" : "items"} saved to your personal wishlist
            </p>
          </div>
          {wishlistItems.length > 0 && (
            <Button
              variant="outline"
              onClick={handleClearAll}
              className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-950/30 dark:text-red-400 dark:hover:bg-red-950/20 text-xs py-1.5 h-8 flex items-center gap-1.5 shadow-none transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear Wishlist
            </Button>
          )}
        </div>

        {wishlistItems.length === 0 ? (
          /* Empty State */
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 rounded-2xl p-12 text-center flex flex-col items-center max-w-2xl mx-auto shadow-sm">
            <div className="w-20 h-20 bg-rose-50 dark:bg-rose-950/20 rounded-full flex items-center justify-center mb-6">
              <Heart className="w-10 h-10 text-rose-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Your Wishlist is Empty
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mt-2 mb-8 leading-relaxed">
              Explore our products and tap the heart icon to save your favorite items for later!
            </p>
            <Button asChild className="bg-slate-900 hover:bg-black text-white flex gap-2 tracking-wide font-bold px-6 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer">
              <Link href="/products">
                <ArrowLeft className="w-4 h-4" />
                Explore Products
              </Link>
            </Button>
          </div>
        ) : (
          /* Products Grid */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
            {wishlistItems.map((product) => (
              <ProductCard key={product.id} product={product as any} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
