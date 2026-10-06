"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Star, Trash2, ArrowLeft, GitCompare, ShoppingCart, Check } from "lucide-react";
import { RootState } from "@/app/redux-store/store";
import { removeFromCompare, clearCompare } from "@/app/redux-store/Slice/CompareSlice";
import { addToCart } from "@/app/redux-store/Slice/CartSlice";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function ComparePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const dispatch = useDispatch();
  const compareItems = useSelector((state: RootState) => state.compare?.items || []);
  const cartItems = useSelector((state: RootState) => state.cart?.items || []);

  useEffect(() => {
    setMounted(true);
    if (status !== "loading" && !session?.user) {
      toast.error("Please log in to view product comparison!");
      router.push("/auth/customer/login?callbackUrl=/compare");
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

  // Handle Add To Cart
  const handleAddToCart = (product: any) => {
    if (!session?.user) {
      toast.error("Please log in to add items to cart!");
      router.push("/auth/customer/login");
      return;
    }
    const existingItem = cartItems.find((item) => item.id === product.id);

    let photoUrl = "/placeholder-product.png";
    const photo = product.photo;
    if (Array.isArray(photo) && photo.length > 0) {
      photoUrl = photo[0];
    } else if (typeof photo === "string" && photo.trim() !== "") {
      photoUrl = photo;
    }

    dispatch(
      addToCart({
        id: product.id,
        quantity: 1,
        name: product.name,
        photo: photoUrl,
        price: product.price,
        mrp: product.mrp,
      })
    );

    if (existingItem) {
      toast("Product quantity updated");
    } else {
      toast.success("Product added to cart");
    }
    
    // Track ADD_TO_CART
    if (product?.id) {
      fetch("/api/analytics/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType: "ADD_TO_CART",
          productId: product.id,
          sellerId: product.sellerId || product.supplierId || undefined,
        }),
      }).catch(err => console.error("Analytics tracking failed:", err));
    }
  };

  const handleRemove = (id: string) => {
    dispatch(removeFromCompare(id));
    toast.success("Product removed from comparison");
  };

  const handleClearAll = () => {
    dispatch(clearCompare());
    toast.success("Comparison cleared");
  };

  // Helper to extract image source
  const getProductImage = (photo: any) => {
    if (Array.isArray(photo) && photo.length > 0) {
      return photo[0];
    }
    if (typeof photo === "string" && photo.trim() !== "") {
      return photo;
    }
    return "/placeholder-product.png";
  };

  // Calculate rating/reviews (matching ProductCard's formula)
  const getRatingInfo = (id: string) => {
    const rating = Number((((id?.charCodeAt(0) || 1) % 5) * 0.1 + 4.4).toFixed(1));
    const reviews = ((id?.charCodeAt(1) || 1) % 200) + 12;
    return { rating, reviews };
  };

  // Highlight lowest price & highest rating
  const prices = compareItems.map((item) => item.price);
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;

  const ratings = compareItems.map((item) => getRatingInfo(item.id).rating);
  const maxRating = ratings.length > 0 ? Math.max(...ratings) : 0;

  // Custom Scoring System: Rating (40%), Price (30%), Reviews (20%), Features (10%)
  const getCompareScores = () => {
    if (compareItems.length === 0) return [];

    const reviewsList = compareItems.map((item) => getRatingInfo(item.id).reviews);
    const maxReviews = Math.max(...reviewsList);

    return compareItems.map((product) => {
      const { rating, reviews } = getRatingInfo(product.id);

      // 1. Rating Score (Weight: 40%) - Normalized out of 5 to 100 points
      const ratingScore = (rating / 5.0) * 100;
      const weightedRating = ratingScore * 0.40;

      // 2. Reviews Score (Weight: 20%) - Normalized against max reviews in list
      const reviewScore = maxReviews > 0 ? (reviews / maxReviews) * 100 : 0;
      const weightedReviews = reviewScore * 0.20;

      // 3. Price Value Score (Weight: 30%) - Cheaper gets more points (minPrice / productPrice)
      const priceScore = product.price > 0 ? (minPrice / product.price) * 100 : 0;
      const weightedPrice = priceScore * 0.30;

      // 4. Feature Count Score (Weight: 10%) - Counts populated specs (out of 7)
      let populatedFeatures = 0;
      if (product.model && product.model !== "N/A" && product.model.trim() !== "") populatedFeatures++;
      if (product.weight && product.weight > 0) populatedFeatures++;
      if (product.color && product.color !== "N/A" && product.color.trim() !== "") populatedFeatures++;
      if (product.brand?.name) populatedFeatures++;
      if (product.category?.name) populatedFeatures++;
      if (product.description && product.description.trim() !== "") populatedFeatures++;
      if (product.specification && product.specification.trim() !== "") populatedFeatures++;
      
      const featureScore = (populatedFeatures / 7) * 100;
      const weightedFeatures = featureScore * 0.10;

      const totalScore = Number((weightedRating + weightedReviews + weightedPrice + weightedFeatures).toFixed(1));

      return {
        id: product.id,
        name: product.name,
        weightedRating: Number(weightedRating.toFixed(1)),
        weightedReviews: Number(weightedReviews.toFixed(1)),
        weightedPrice: Number(weightedPrice.toFixed(1)),
        weightedFeatures: Number(weightedFeatures.toFixed(1)),
        totalScore,
      };
    });
  };

  const scores = getCompareScores();
  const maxScore = scores.length > 0 ? Math.max(...scores.map((s) => s.totalScore)) : 0;
  const winner = scores.find((s) => s.totalScore === maxScore && maxScore > 0);

  return (
    <div className="bg-[#f5f5f5] dark:bg-slate-950 min-h-screen py-8">
      <div className="max-w-[1200px] mx-auto px-4">
       

        {/* Heading */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2.5">
              <GitCompare className="w-8 h-8 text-[#f85606]" />
              Product Comparison
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Compare prices, specs, and reviews side-by-side to make the best choice.
            </p>
          </div>
          {compareItems.length > 0 && (
            <Button
              variant="outline"
              onClick={handleClearAll}
              className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-950/30 dark:text-red-400 dark:hover:bg-red-950/20 text-xs py-1.5 h-8 flex items-center gap-1.5 shadow-none transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear All
            </Button>
          )}
        </div>

        {/* Recommendation Winner Summary (Shown if 2 or more products are compared) */}
        {mounted && compareItems.length >= 2 && winner && (
          <div className="bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent border border-orange-500/20 dark:border-orange-500/10 rounded-xl p-5 mb-8 flex flex-col md:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-400 dark:bg-amber-500 text-slate-900 rounded-full flex items-center justify-center text-2xl shadow-md shrink-0 select-none">
                🏆
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                  Smart Choice Recommendation
                </h2>
                <p className="text-sm text-slate-650 dark:text-slate-350 mt-1">
                  Based on rating, price value (cheapest first), reviews, and specifications, we recommend <span className="font-bold text-[#f85606]">{winner.name}</span> as the best choice!
                </p>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-orange-500/30 dark:border-orange-500/20 px-4 py-2 rounded-lg flex items-center gap-2 shadow-xs shrink-0 select-none">
              <span className="text-xs text-slate-500 dark:text-slate-450 font-medium">Smart Score:</span>
              <span className="text-lg font-black text-[#f85606]">{winner.totalScore} / 100</span>
            </div>
          </div>
        )}

        {compareItems.length === 0 ? (
          /* Empty State */
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 rounded-xl p-12 text-center flex flex-col items-center max-w-2xl mx-auto shadow-sm">
            <div className="w-16 h-16 bg-orange-50 dark:bg-orange-950/20 rounded-full flex items-center justify-center mb-6">
              <GitCompare className="w-8 h-8 text-[#f85606]" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
              Your Comparison List is Empty
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mt-2 mb-8 leading-relaxed">
              Add products from the browse page to compare their specs, values, and features side-by-side.
            </p>
            <Button asChild className="bg-[#f85606] hover:bg-[#d84a05] text-white flex gap-2 tracking-wide font-bold px-6 py-2.5 rounded shadow hover:shadow-md transition-all active:scale-95 cursor-pointer">
              <Link href="/products">
                <ArrowLeft className="w-4 h-4" />
                Browse Products to Compare
              </Link>
            </Button>
          </div>
        ) : (
          /* Compare Layout */
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 rounded-xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse table-fixed min-w-[700px] md:min-w-[900px]">
                <thead>
                  <tr className="border-b border-slate-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
                    {/* Header Label Column */}
                    <th className="w-[180px] p-4 text-left font-bold text-xs uppercase tracking-wider text-slate-455 select-none">
                      Product Info
                    </th>
                    {/* Product Columns */}
                    {compareItems.map((product) => {
                      const { rating } = getRatingInfo(product.id);
                      const isBestPrice = product.price === minPrice;
                      const isBestRating = rating === maxRating && maxRating > 0;
                      const scoreInfo = scores.find((s) => s.id === product.id);
                      const isWinner = scoreInfo && scoreInfo.totalScore === maxScore && maxScore > 0 && compareItems.length >= 2;

                      return (
                        <th key={product.id} className="p-4 align-top relative border-l border-slate-150 dark:border-slate-800 w-[240px]">
                          {/* Remove Button */}
                          <button
                            onClick={() => handleRemove(product.id)}
                            className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer flex items-center justify-center"
                            title="Remove from comparison"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                          {/* Highlights */}
                          <div className="flex flex-wrap gap-1 mb-2.5">
                            {isWinner && (
                              <span className="bg-gradient-to-r from-amber-500 to-[#f85606] text-white font-extrabold text-[8px] uppercase px-1.5 py-0.5 rounded tracking-wide leading-none shadow-sm animate-pulse">
                                🏆 Recommended
                              </span>
                            )}
                            {isBestPrice && (
                              <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400 font-extrabold text-[8px] uppercase px-1.5 py-0.5 rounded tracking-wide leading-none shadow-3xs">
                                Best Price
                              </span>
                            )}
                            {isBestRating && (
                              <span className="bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400 font-extrabold text-[8px] uppercase px-1.5 py-0.5 rounded tracking-wide leading-none shadow-3xs">
                                Top Rated
                              </span>
                            )}
                          </div>

                          {/* Product Header details */}
                          <div className="flex flex-col items-center text-center">
                            <div className="relative aspect-square w-24 h-24 sm:w-28 sm:h-28 overflow-hidden rounded border border-slate-100 dark:border-slate-805 bg-slate-50 dark:bg-slate-950 mb-3 shadow-3xs">
                              <Image
                                src={getProductImage(product.photo)}
                                alt={product.name}
                                fill
                                className="object-cover"
                                sizes="112px"
                              />
                            </div>
                            <h3 className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 line-clamp-2 leading-tight uppercase min-h-[2.5rem] px-2">
                              {product.name}
                            </h3>
                          </div>
                        </th>
                      );
                    })}
                    {/* Fill columns to 4 */}
                    {Array.from({ length: 4 - compareItems.length }).map((_, idx) => (
                      <th key={`empty-col-${idx}`} className="p-4 align-middle border-l border-slate-150 dark:border-slate-800 text-center w-[240px]">
                        <div className="flex flex-col items-center justify-center py-6 text-slate-350 dark:text-slate-700">
                          <GitCompare className="w-8 h-8 stroke-[1.25] mb-2 opacity-50 text-slate-400" />
                          <span className="text-xs italic font-medium">Slot Empty</span>
                          <Link href="/products" className="text-[10px] text-[#f85606] hover:underline font-bold mt-1">
                            Add product
                          </Link>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* Price Row */}
                  <tr className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/20 dark:hover:bg-slate-800/10">
                    <td className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-50/30 dark:bg-slate-950/10">
                      Price
                    </td>
                    {compareItems.map((product) => (
                      <td key={product.id} className="p-4 border-l border-slate-100 dark:border-slate-800 font-mono text-center">
                        <span className="text-[#f85606] font-bold text-base">
                          ৳{product.price}
                        </span>
                        {product.mrp && product.mrp > product.price && (
                          <div className="text-[10px] text-slate-400 line-through">
                            ৳{product.mrp}
                          </div>
                        )}
                      </td>
                    ))}
                    {Array.from({ length: 4 - compareItems.length }).map((_, idx) => (
                      <td key={`empty-price-${idx}`} className="p-4 border-l border-slate-100 dark:border-slate-800 text-center text-slate-400 dark:text-slate-650 text-xs italic">-</td>
                    ))}
                  </tr>

                  {/* Rating & Reviews Row */}
                  <tr className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/20 dark:hover:bg-slate-800/10">
                    <td className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-50/30 dark:bg-slate-950/10">
                      Ratings
                    </td>
                    {compareItems.map((product) => {
                      const { rating, reviews } = getRatingInfo(product.id);
                      return (
                        <td key={product.id} className="p-4 border-l border-slate-100 dark:border-slate-800 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <div className="flex text-amber-400">
                              <Star className="w-3 h-3 fill-current" />
                            </div>
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                              {rating}
                            </span>
                            <span className="text-[10px] text-slate-450 dark:text-slate-400">
                              ({reviews} reviews)
                            </span>
                          </div>
                        </td>
                      );
                    })}
                    {Array.from({ length: 4 - compareItems.length }).map((_, idx) => (
                      <td key={`empty-rating-${idx}`} className="p-4 border-l border-slate-100 dark:border-slate-800 text-center text-slate-400 dark:text-slate-650 text-xs italic">-</td>
                    ))}
                  </tr>

                  {/* Brand Row */}
                  <tr className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/20 dark:hover:bg-slate-800/10">
                    <td className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-50/30 dark:bg-slate-950/10">
                      Brand
                    </td>
                    {compareItems.map((product) => (
                      <td key={product.id} className="p-4 border-l border-slate-100 dark:border-slate-800 text-xs font-medium text-slate-800 dark:text-slate-200 text-center uppercase">
                        {product.brand?.name || "Bangla Bazar"}
                      </td>
                    ))}
                    {Array.from({ length: 4 - compareItems.length }).map((_, idx) => (
                      <td key={`empty-brand-${idx}`} className="p-4 border-l border-slate-100 dark:border-slate-800 text-center text-slate-405 dark:text-slate-650 text-xs italic">-</td>
                    ))}
                  </tr>

                  {/* Category Row */}
                  <tr className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/20 dark:hover:bg-slate-800/10">
                    <td className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-50/30 dark:bg-slate-950/10">
                      Category
                    </td>
                    {compareItems.map((product) => (
                      <td key={product.id} className="p-4 border-l border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 text-center">
                        {product.category?.name || "General"}
                      </td>
                    ))}
                    {Array.from({ length: 4 - compareItems.length }).map((_, idx) => (
                      <td key={`empty-cat-${idx}`} className="p-4 border-l border-slate-100 dark:border-slate-800 text-center text-slate-405 dark:text-slate-650 text-xs italic">-</td>
                    ))}
                  </tr>

                  {/* Model Row */}
                  <tr className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/20 dark:hover:bg-slate-800/10">
                    <td className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-50/30 dark:bg-slate-950/10">
                      Model
                    </td>
                    {compareItems.map((product) => (
                      <td key={product.id} className="p-4 border-l border-slate-100 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 text-center">
                        {product.model || "N/A"}
                      </td>
                    ))}
                    {Array.from({ length: 4 - compareItems.length }).map((_, idx) => (
                      <td key={`empty-model-${idx}`} className="p-4 border-l border-slate-100 dark:border-slate-800 text-center text-slate-405 dark:text-slate-650 text-xs italic">-</td>
                    ))}
                  </tr>

                  {/* Weight Row */}
                  <tr className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/20 dark:hover:bg-slate-800/10">
                    <td className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-50/30 dark:bg-slate-950/10">
                      Weight
                    </td>
                    {compareItems.map((product) => (
                      <td key={product.id} className="p-4 border-l border-slate-100 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 text-center font-mono">
                        {product.weight ? `${product.weight}g` : "N/A"}
                      </td>
                    ))}
                    {Array.from({ length: 4 - compareItems.length }).map((_, idx) => (
                      <td key={`empty-weight-${idx}`} className="p-4 border-l border-slate-100 dark:border-slate-800 text-center text-slate-405 dark:text-slate-650 text-xs italic">-</td>
                    ))}
                  </tr>

                  {/* Color Row */}
                  <tr className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/20 dark:hover:bg-slate-800/10">
                    <td className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-50/30 dark:bg-slate-950/10">
                      Color
                    </td>
                    {compareItems.map((product) => (
                      <td key={product.id} className="p-4 border-l border-slate-100 dark:border-slate-800 text-xs text-slate-850 dark:text-slate-250 text-center font-medium capitalize">
                        {product.color || "N/A"}
                      </td>
                    ))}
                    {Array.from({ length: 4 - compareItems.length }).map((_, idx) => (
                      <td key={`empty-color-${idx}`} className="p-4 border-l border-slate-100 dark:border-slate-800 text-center text-slate-405 dark:text-slate-650 text-xs italic">-</td>
                    ))}
                  </tr>

                  {/* Stock Status Row */}
                  <tr className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/20 dark:hover:bg-slate-800/10">
                    <td className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-50/30 dark:bg-slate-950/10">
                      Availability
                    </td>
                    {compareItems.map((product) => {
                      const isAvailable = (product.stock || 0) > 0 || (product.availableQty || 0) > 0;
                      return (
                        <td key={product.id} className="p-4 border-l border-slate-100 dark:border-slate-800 text-xs text-center font-bold">
                          {isAvailable ? (
                            <span className="text-green-600 dark:text-green-400">✓ In Stock</span>
                          ) : (
                            <span className="text-red-500 dark:text-red-400">✗ Out of Stock</span>
                          )}
                        </td>
                      );
                    })}
                    {Array.from({ length: 4 - compareItems.length }).map((_, idx) => (
                      <td key={`empty-avail-${idx}`} className="p-4 border-l border-slate-100 dark:border-slate-800 text-center text-slate-400 dark:text-slate-650 text-xs italic">-</td>
                    ))}
                  </tr>

                  {/* Smart Score Breakdown Section */}
                  {compareItems.length >= 2 && (
                    <>
                      <tr className="border-t-2 border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30">
                        <td className="p-4 text-xs font-black text-slate-700 dark:text-slate-200">
                          Smart Scoring Matrix
                        </td>
                        <td colSpan={4} className="p-4 text-[10px] text-slate-400 font-bold tracking-wider uppercase select-none">
                          Formula Weights: Rating (40%), Price (30%), Reviews (20%), Features (10%)
                        </td>
                      </tr>

                      {/* Rating Points */}
                      <tr className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/20 dark:hover:bg-slate-800/10">
                        <td className="p-4 pl-6 text-xs text-slate-500 dark:text-slate-400 bg-slate-50/10 dark:bg-slate-950/5">
                          • Rating Score (Max 40)
                        </td>
                        {compareItems.map((product) => {
                          const scoreInfo = scores.find((s) => s.id === product.id);
                          return (
                            <td key={product.id} className="p-4 border-l border-slate-100 dark:border-slate-800 text-center font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
                              {scoreInfo ? `${scoreInfo.weightedRating} pts` : "-"}
                            </td>
                          );
                        })}
                        {Array.from({ length: 4 - compareItems.length }).map((_, idx) => (
                          <td key={`empty-rs-${idx}`} className="p-4 border-l border-slate-100 dark:border-slate-800 text-center text-slate-400 dark:text-slate-600 text-xs italic">-</td>
                        ))}
                      </tr>

                      {/* Price Points */}
                      <tr className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/20 dark:hover:bg-slate-800/10">
                        <td className="p-4 pl-6 text-xs text-slate-500 dark:text-slate-400 bg-slate-50/10 dark:bg-slate-950/5">
                          • Price Value (Max 30)
                        </td>
                        {compareItems.map((product) => {
                          const scoreInfo = scores.find((s) => s.id === product.id);
                          return (
                            <td key={product.id} className="p-4 border-l border-slate-100 dark:border-slate-800 text-center font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
                              {scoreInfo ? `${scoreInfo.weightedPrice} pts` : "-"}
                            </td>
                          );
                        })}
                        {Array.from({ length: 4 - compareItems.length }).map((_, idx) => (
                          <td key={`empty-ps-${idx}`} className="p-4 border-l border-slate-100 dark:border-slate-800 text-center text-slate-400 dark:text-slate-650 text-xs italic">-</td>
                        ))}
                      </tr>

                      {/* Reviews Points */}
                      <tr className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/20 dark:hover:bg-slate-800/10">
                        <td className="p-4 pl-6 text-xs text-slate-500 dark:text-slate-400 bg-slate-50/10 dark:bg-slate-950/5">
                          • Popularity Score (Max 20)
                        </td>
                        {compareItems.map((product) => {
                          const scoreInfo = scores.find((s) => s.id === product.id);
                          return (
                            <td key={product.id} className="p-4 border-l border-slate-100 dark:border-slate-800 text-center font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
                              {scoreInfo ? `${scoreInfo.weightedReviews} pts` : "-"}
                            </td>
                          );
                        })}
                        {Array.from({ length: 4 - compareItems.length }).map((_, idx) => (
                          <td key={`empty-revs-${idx}`} className="p-4 border-l border-slate-100 dark:border-slate-800 text-center text-slate-400 dark:text-slate-600 text-xs italic">-</td>
                        ))}
                      </tr>

                      {/* Features Points */}
                      <tr className="border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50/20 dark:hover:bg-slate-800/10">
                        <td className="p-4 pl-6 text-xs text-slate-500 dark:text-slate-400 bg-slate-50/10 dark:bg-slate-950/5">
                          • Specs Score (Max 10)
                        </td>
                        {compareItems.map((product) => {
                          const scoreInfo = scores.find((s) => s.id === product.id);
                          return (
                            <td key={product.id} className="p-4 border-l border-slate-100 dark:border-slate-800 text-center font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
                              {scoreInfo ? `${scoreInfo.weightedFeatures} pts` : "-"}
                            </td>
                          );
                        })}
                        {Array.from({ length: 4 - compareItems.length }).map((_, idx) => (
                          <td key={`empty-feats-${idx}`} className="p-4 border-l border-slate-100 dark:border-slate-800 text-center text-slate-400 dark:text-slate-600 text-xs italic">-</td>
                        ))}
                      </tr>

                      {/* Overall Smart Score Row */}
                      <tr className="border-b border-slate-200 dark:border-slate-800 bg-orange-500/5 dark:bg-orange-500/10 hover:bg-orange-500/10">
                        <td className="p-4 text-xs font-black text-slate-805 dark:text-slate-100 bg-orange-500/10 dark:bg-orange-500/20">
                          Overall Smart Score
                        </td>
                        {compareItems.map((product) => {
                          const scoreInfo = scores.find((s) => s.id === product.id);
                          const isWinner = scoreInfo && scoreInfo.totalScore === maxScore && maxScore > 0;
                          return (
                            <td key={product.id} className="p-4 border-l border-slate-150 dark:border-slate-800 text-center bg-orange-500/5 dark:bg-orange-500/10">
                              <span className={`font-mono font-black text-sm ${isWinner ? 'text-[#f85606] text-base' : 'text-slate-700 dark:text-slate-300'}`}>
                                {scoreInfo ? `${scoreInfo.totalScore} / 100` : "-"}
                              </span>
                            </td>
                          );
                        })}
                        {Array.from({ length: 4 - compareItems.length }).map((_, idx) => (
                          <td key={`empty-tot-${idx}`} className="p-4 border-l border-slate-150 dark:border-slate-800 text-center text-slate-400 dark:text-slate-600 text-xs italic">-</td>
                        ))}
                      </tr>
                    </>
                  )}

                  {/* Description / Highlight Row */}
                  <tr className="border-b border-slate-150 dark:border-slate-800 hover:bg-slate-50/20 dark:hover:bg-slate-800/10">
                    <td className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-50/30 dark:bg-slate-950/10 bg-slate-50/30 dark:bg-slate-955/10">
                      Summary
                    </td>
                    {compareItems.map((product) => (
                      <td key={product.id} className="p-4 border-l border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 text-left leading-relaxed font-normal align-top min-h-[100px]">
                        <div className="line-clamp-6 overflow-hidden">
                          {product.description || "No description provided."}
                        </div>
                      </td>
                    ))}
                    {Array.from({ length: 4 - compareItems.length }).map((_, idx) => (
                      <td key={`empty-desc-${idx}`} className="p-4 border-l border-slate-100 dark:border-slate-800 text-center text-slate-400 dark:text-slate-600 text-xs italic">-</td>
                    ))}
                  </tr>

                  {/* Actions Row */}
                  <tr className="bg-slate-50/30 dark:bg-slate-950/10">
                    <td className="p-4 text-xs font-bold text-slate-400 bg-slate-50/30 dark:bg-slate-950/10">
                      Actions
                    </td>
                    {compareItems.map((product) => (
                      <td key={product.id} className="p-4 border-l border-slate-150 dark:border-slate-800 text-center">
                        <Button
                          onClick={() => {
                            handleAddToCart(product);
                            router.push("/checkout");
                          }}
                          className="w-full bg-[#f85606] hover:bg-[#d84a05] text-white flex items-center justify-center gap-1.5 text-xs py-2 px-3 h-9 rounded font-bold transition-all active:scale-95 shadow cursor-pointer"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>Buy Now</span>
                        </Button>
                      </td>
                    ))}
                    {Array.from({ length: 4 - compareItems.length }).map((_, idx) => (
                      <td key={`empty-action-${idx}`} className="p-4 border-l border-slate-150 dark:border-slate-800 text-center text-slate-400 dark:text-slate-650 text-xs italic">-</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
