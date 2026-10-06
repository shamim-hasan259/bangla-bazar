"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { submitReview, submitReviewFeedback } from "../_action";
import {
  Star,
  ThumbsUp,
  MessageCircle,
  Camera,
  X,
  Loader2,
  Check,
  Truck,
  RotateCcw,
  ShieldCheck,
  MapPin,
  PlayCircle,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import axios from "axios";
import Image from "next/image";

const tabs = [
  { id: "description", label: "Product Description" },
  { id: "specs", label: "Specifications" },
  { id: "ratings", label: "Product Review" },
  { id: "shipping", label: "Shipping Returns" },
  { id: "qa", label: "Questions" },
];

interface Reviewer {
  name: string;
  photo?: string;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  images?: string[];
  createdAt: string;
  verifiedPurchase?: boolean;
  customer?: Reviewer;
}

const ProductDetails = ({
  product,
  initialReviews = [],
}: {
  product: any;
  initialReviews?: any[];
}) => {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("description");

  // Review states
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [loadingReviews, setLoadingReviews] = useState(false);

  // Review form states
  const [formRating, setFormRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Interaction states
  const [zoomImage, setZoomImage] = useState<string | null>(null);
  const [helpfulReviews, setHelpfulReviews] = useState<
    Record<string, { count: number; clicked: boolean }>
  >({});

  const {
    id: productId,
    specification,
    description,
    highlight,
    name,
    stock,
    weight,
    model: productModel,
    hsCode,
    picsInPackage,
    photo,
    video,
  } = product || {};

  const userRole = String(
    (session?.user as any)?.role || (session?.user as any)?.type || ""
  ).toLowerCase();
  const isAdmin = userRole === "admin" || userRole === "manager" || userRole === "stuff";

  // Extract gallery photos for description showcase
  const productPhotos: string[] = [];
  if (Array.isArray(photo)) {
    photo.forEach((p: any) => {
      if (typeof p === "string" && p.trim()) productPhotos.push(p);
    });
  } else if (typeof photo === "string" && photo.trim()) {
    productPhotos.push(photo);
  }

  // Fetch reviews client-side
  const fetchReviews = async () => {
    if (!productId) return;
    setLoadingReviews(true);
    try {
      const res = await axios.get(`/api/products/${productId}/reviews`);
      setReviews(res.data);
    } catch (err) {
      console.error("Failed to load reviews:", err);
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    if (initialReviews.length > 0) {
      setReviews(initialReviews);
    } else {
      fetchReviews();
    }
  }, [initialReviews, productId]);

  const totalReviews = reviews.length;
  const averageRating =
    totalReviews > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
      : "4.6";

  const starsBreakdown = {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  };

  if (totalReviews > 0) {
    reviews.forEach((r) => {
      const rating = r.rating as 1 | 2 | 3 | 4 | 5;
      if (starsBreakdown[rating] !== undefined) {
        starsBreakdown[rating]++;
      }
    });
  }

  const getPercentage = (count: number) => {
    if (totalReviews === 0) return 0;
    return Math.round((count / totalReviews) * 100);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (uploadedImages.length + files.length > 3) {
      toast.error("You can upload a maximum of 3 images.");
      return;
    }

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }

    setUploading(true);
    try {
      const res = await axios.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.success && res.data?.urls) {
        setUploadedImages((prev) => [...prev, ...res.data.urls]);
        toast.success("Images uploaded successfully.");
      } else {
        toast.error(res.data?.message || "Upload failed.");
      }
    } catch (err) {
      console.error("Image upload error:", err);
      toast.error("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const removeUploadedImage = (indexToRemove: number) => {
    setUploadedImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.user) {
      toast.error("Please login to submit a review.");
      return;
    }

    if (isAdmin) {
      toast.error("Admins cannot submit reviews!");
      return;
    }

    if (formRating === 0) {
      toast.error("Please select a rating (1 to 5 stars).");
      return;
    }

    if (comment.trim().length < 3) {
      toast.error("Please write a comment with at least 3 characters.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await submitReview(
        productId,
        formRating,
        comment.trim(),
        uploadedImages
      );

      if (res?.success) {
        toast.success(res.message || "Thank you! Your review has been submitted.");
        setFormRating(0);
        setComment("");
        setUploadedImages([]);
        await fetchReviews();
      } else {
        toast.error(res?.message || "Failed to submit review.");
      }
    } catch (err: any) {
      console.error("Submit review error:", err);
      toast.error(err?.message || "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleHelpfulClick = async (reviewId: string) => {
    if (helpfulReviews[reviewId]?.clicked) return;

    setHelpfulReviews((prev) => ({
      ...prev,
      [reviewId]: {
        count: (prev[reviewId]?.count || 0) + 1,
        clicked: true,
      },
    }));

    try {
      await submitReviewFeedback(reviewId);
    } catch (err) {
      console.error("Helpful feedback error:", err);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs">
      {/* Tabs Navigation Header matching the screenshot */}
      <div className="flex items-center gap-6 sm:gap-10 border-b border-slate-150 dark:border-slate-800 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "pb-3.5 text-xs sm:text-sm font-bold transition-all relative shrink-0 cursor-pointer",
                isActive
                  ? "text-[#2563eb] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#2563eb]"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              {tab.label}
              {tab.id === "ratings" && totalReviews > 0 && ` (${totalReviews})`}
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div className="pt-6">
        {/* Tab 1: Product Description */}
        {activeTab === "description" && (
          <div className="space-y-6 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              Product Description of {name}
            </h3>

            {description ? (
              <div
                className="prose prose-sm dark:prose-invert max-w-none space-y-3"
                dangerouslySetInnerHTML={{ __html: description }}
              />
            ) : (
              <p className="text-slate-600 dark:text-slate-400">
                Premium brushed cotton fleece with dropped shoulders, kangaroo pocket, and double-layered ribbed hood. Designed for maximum comfort, durability, and standard modern fit.
              </p>
            )}

            {highlight && (
              <div className="pt-2">
                <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-2 text-xs uppercase tracking-wide">
                  Key Features & Highlights:
                </h4>
                <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-line text-slate-600 dark:text-slate-400">
                  {highlight}
                </div>
              </div>
            )}

            {/* Embedded Gallery Images */}
            {productPhotos.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3">
                {productPhotos.slice(0, 2).map((img, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-4/3 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-800 border border-slate-150 dark:border-slate-800"
                  >
                    <Image
                      src={img}
                      alt={`${name} feature photo ${idx + 1}`}
                      fill
                      sizes="(max-width: 768px) 100vw, 500px"
                      className="object-contain p-4"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Video preview if available */}
            {video && (
              <div className="pt-4">
                <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-2 text-xs uppercase tracking-wide">
                  Product Video:
                </h4>
                <div className="aspect-video w-full max-w-2xl rounded-xl overflow-hidden bg-black shadow-md">
                  {video.includes("youtube.com") || video.includes("youtu.be") ? (
                    <iframe
                      src={
                        video.includes("watch?v=")
                          ? video.replace("watch?v=", "embed/")
                          : video
                      }
                      title="Product Video"
                      className="w-full h-full border-0"
                      allowFullScreen
                    />
                  ) : (
                    <video src={video} controls className="w-full h-full object-contain" />
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Specifications */}
        {activeTab === "specs" && (
          <div className="space-y-4 text-xs sm:text-sm">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              Specifications of {name}
            </h3>

            {specification ? (
              <div
                className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-line text-slate-700 dark:text-slate-300"
                dangerouslySetInnerHTML={{ __html: specification }}
              />
            ) : null}

            {/* Structured Specifications Grid */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-150 dark:divide-slate-800">
                <div className="p-4 space-y-2.5">
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Brand</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {product?.brand?.name || "BanglaBazar"}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">SKU</span>
                    <span className="font-semibold text-slate-900 dark:text-white uppercase">
                      {productId ? productId.slice(-8) : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Category</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {product?.category?.name || "Apparel & Lifestyle"}
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-2.5">
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Weight</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {weight ? `${weight} kg` : "Standard"}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Model</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {productModel || "2026 Edition"}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Stock Availability</span>
                    <span className="font-semibold text-emerald-600">
                      {stock && stock > 0 ? `${stock} In Stock` : "Available"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Product Review */}
        {activeTab === "ratings" && (
          <div className="space-y-6">
            {/* Rating Summary Card */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center p-5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-150 dark:border-slate-800">
              <div className="md:col-span-4 text-center border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-700 pb-4 md:pb-0 md:pr-4">
                <div className="text-4xl font-black text-slate-900 dark:text-white">
                  {averageRating}
                </div>
                <div className="flex items-center justify-center gap-1 my-1.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(Number(averageRating))
                          ? "fill-amber-400 text-amber-400"
                          : "fill-slate-200 text-slate-200 dark:fill-slate-700 dark:text-slate-700"
                      }`}
                    />
                  ))}
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  Based on {totalReviews} review{totalReviews !== 1 ? "s" : ""}
                </div>
              </div>

              <div className="md:col-span-8 space-y-1.5 text-xs">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = (starsBreakdown as any)[star] || 0;
                  const percent = getPercentage(count);
                  return (
                    <div key={star} className="flex items-center gap-2">
                      <span className="w-12 text-slate-600 dark:text-slate-300 font-medium flex items-center gap-1">
                        {star} <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      </span>
                      <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full transition-all"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <span className="w-8 text-right text-slate-400 font-medium">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Submit Review Form */}
            <form
              onSubmit={handleSubmitReview}
              className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3.5 shadow-2xs"
            >
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wide">
                Write a Product Review
              </h4>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500">Your Rating:</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="cursor-pointer"
                    >
                      <Star
                        className={`w-5 h-5 transition-colors ${
                          star <= (hoverRating || formRating)
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-300 dark:text-slate-600"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your detailed feedback about quality, delivery, and satisfaction..."
                rows={3}
                className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 p-3 resize-none focus:outline-none focus:ring-2 focus:ring-amber-400"
              />

              {/* Photos preview */}
              {uploadedImages.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  {uploadedImages.map((img, idx) => (
                    <div key={idx} className="relative w-12 h-12 rounded-lg border overflow-hidden">
                      <Image src={img} alt="review preview" fill className="object-cover" />
                      <button
                        type="button"
                        onClick={() => removeUploadedImage(idx)}
                        className="absolute top-0 right-0 bg-black/70 text-white rounded-bl p-0.5 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer">
                  <Camera className="w-4 h-4 text-amber-500" />
                  <span>{uploading ? "Uploading..." : "Add Photos (Max 3)"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={uploading || uploadedImages.length >= 3}
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>

                <button
                  type="submit"
                  disabled={submitting || uploading}
                  className="px-5 py-2.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer shadow-2xs"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Submit Review</span>
                </button>
              </div>
            </form>

            {/* Reviews List */}
            <div className="space-y-3 pt-2">
              {loadingReviews ? (
                <div className="py-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-[#2563eb]" />
                  <span>Loading reviews...</span>
                </div>
              ) : reviews.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 bg-slate-50/50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                  No reviews yet for this product. Be the first to write a review!
                </div>
              ) : (
                reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 rounded-xl border border-slate-150 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold text-xs flex items-center justify-center border border-amber-200 dark:border-amber-900/40">
                          {rev.customer?.name ? rev.customer.name.slice(0, 1).toUpperCase() : "U"}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                              {rev.customer?.name || "Verified Customer"}
                            </span>
                            {rev.verifiedPurchase && (
                              <span className="flex items-center gap-0.5 text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded font-semibold border border-emerald-200">
                                <Check className="w-2.5 h-2.5" /> Verified Purchase
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-0.5 mt-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${
                                  i < rev.rating
                                    ? "fill-amber-400 text-amber-400"
                                    : "fill-slate-200 text-slate-200 dark:fill-slate-700 dark:text-slate-700"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {formatDate(rev.createdAt)}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                      {rev.comment}
                    </p>

                    {rev.images && rev.images.length > 0 && (
                      <div className="flex items-center gap-2 pt-1">
                        {rev.images.map((img, idx) => (
                          <div
                            key={idx}
                            onClick={() => setZoomImage(img)}
                            className="relative w-14 h-14 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden cursor-pointer hover:opacity-85 shadow-2xs"
                          >
                            <Image src={img} alt="review image" fill className="object-cover" />
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-end pt-1">
                      <button
                        onClick={() => handleHelpfulClick(rev.id)}
                        className={`flex items-center gap-1.5 text-xs font-medium transition-colors cursor-pointer px-2 py-1 rounded border ${
                          helpfulReviews[rev.id]?.clicked
                            ? "text-[#2563eb] border-blue-200 bg-blue-50/50"
                            : "text-slate-500 border-slate-200 dark:border-slate-700 hover:text-slate-800"
                        }`}
                      >
                        <ThumbsUp className="w-3 h-3" />
                        <span>Helpful ({helpfulReviews[rev.id]?.count || 0})</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Shipping Returns */}
        {activeTab === "shipping" && (
          <div className="space-y-5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              Shipping & Return Policies
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 flex items-center justify-center">
                  <Truck className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white text-xs">
                  Fast Nationwide Delivery
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Inside Dhaka: 2-3 business days. Outside Dhaka: 3-5 business days via standard courier partners.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 flex items-center justify-center">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white text-xs">
                  7 Days Easy Return
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Return undamaged items in original packaging within 7 days of delivery for product defect or wrong item.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white text-xs">
                  100% Authentic Guarantee
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  All products are verified authentic and checked before shipment with official warranty coverage.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2 mt-4 text-xs">
              <h4 className="font-bold text-slate-900 dark:text-white">
                Cash on Delivery (COD) Available
              </h4>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                You can inspect the parcel packaging at the time of delivery before paying cash to the courier representative.
              </p>
            </div>
          </div>
        )}

        {/* Tab 5: Questions */}
        {activeTab === "qa" && (
          <div className="space-y-5 text-xs sm:text-sm">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Customer Questions & Answers
              </h3>
              <a
                href={
                  product?.store?.id
                    ? `/dashboard/customer/chat?storeId=${product.store.id}${
                        productId ? `&productId=${productId}` : ""
                      }`
                    : `/dashboard/customer/chat`
                }
                className="text-xs text-[#2563eb] hover:underline font-bold flex items-center gap-1 cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                Ask Seller Directly
              </a>
            </div>

            <div className="space-y-3">
              <div className="bg-slate-50/60 dark:bg-slate-800/40 rounded-xl p-4 border border-slate-150 dark:border-slate-800 space-y-2">
                <p className="font-semibold text-slate-900 dark:text-white text-xs">
                  <span className="text-[#2563eb] font-bold mr-1.5">Q:</span>
                  Is this product authentic and original?
                </p>
                <p className="text-slate-600 dark:text-slate-300 text-xs pl-4">
                  <span className="text-emerald-600 font-bold mr-1.5">A:</span>
                  Yes, all items listed on BanglaBazar are 100% verified genuine and original products directly sourced from verified sellers.
                </p>
                <p className="text-[10px] text-slate-400 pl-4 pt-1">
                  Answered by Verified Seller • 1 week ago
                </p>
              </div>

              <div className="bg-slate-50/60 dark:bg-slate-800/40 rounded-xl p-4 border border-slate-150 dark:border-slate-800 space-y-2">
                <p className="font-semibold text-slate-900 dark:text-white text-xs">
                  <span className="text-[#2563eb] font-bold mr-1.5">Q:</span>
                  What is the return policy if there is any issue?
                </p>
                <p className="text-slate-600 dark:text-slate-300 text-xs pl-4">
                  <span className="text-emerald-600 font-bold mr-1.5">A:</span>
                  We provide a 7-day hassle-free return guarantee for damaged, defective, or incorrect items.
                </p>
                <p className="text-[10px] text-slate-400 pl-4 pt-1">
                  Answered by Seller • 3 days ago
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Zoom Modal */}
      {zoomImage && (
        <div
          onClick={() => setZoomImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-4 cursor-pointer"
        >
          <div className="relative max-w-3xl max-h-[85vh] w-full aspect-square bg-slate-900 rounded-2xl overflow-hidden shadow-2xl">
            <button
              onClick={() => setZoomImage(null)}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 text-white hover:bg-rose-600 transition-colors z-10 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <Image
              src={zoomImage}
              alt="zoomed review"
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
