"use client";

import React, { useState } from "react";
import { Star, MessageSquare, Trash2, ExternalLink, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { deleteCustomerReview } from "@/app/(commonLayouts)/(Home)/products/[id]/_action";
import { useRouter } from "next/navigation";

interface ReviewItem {
  id: string;
  rating: number;
  comment: string | null;
  reply: string | null;
  status: string;
  createdAt: string | Date;
  product: {
    id: string;
    name: string;
    photo: any;
    price?: number;
  };
  seller?: {
    name: string;
  } | null;
}

export default function CustomerReviewsClient({
  initialReviews,
}: {
  initialReviews: ReviewItem[];
}) {
  const router = useRouter();
  const [reviews, setReviews] = useState<ReviewItem[]>(initialReviews);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;

    try {
      setDeletingId(reviewId);
      const res = await deleteCustomerReview(reviewId);
      if (res.success) {
        toast.success("Review deleted successfully");
        setReviews((prev) => prev.filter((r) => r.id !== reviewId));
        router.refresh();
      } else {
        toast.error(res.message || "Failed to delete review");
      }
    } catch {
      toast.error("An error occurred while deleting review");
    } finally {
      setDeletingId(null);
    }
  };

  if (reviews.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/20 flex items-center justify-center mx-auto mb-3">
          <Star className="w-6 h-6 text-amber-500" />
        </div>
        <h4 className="text-base font-bold text-slate-800 dark:text-white">No reviews submitted yet</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Once your orders are delivered, rate and review products to share feedback with the community.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((rev) => {
        const photo = rev.product.photo;
        const firstPhoto = Array.isArray(photo) ? photo[0] : photo;
        const img = typeof firstPhoto === "string" ? firstPhoto : null;

        return (
          <div
            key={rev.id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-3 transition-all hover:border-slate-300 dark:hover:border-slate-700"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                  {img ? (
                    <img src={img} alt={rev.product.name} className="w-full h-full object-cover" />
                  ) : (
                    <MessageSquare className="w-5 h-5 text-slate-400" />
                  )}
                </div>
                <div className="min-w-0">
                  <Link
                    href={`/products/${rev.product.id}`}
                    className="font-bold text-sm text-slate-800 dark:text-white hover:text-[#1E60ED] line-clamp-1 flex items-center gap-1"
                  >
                    {rev.product.name}
                    <ExternalLink className="w-3 h-3 shrink-0 opacity-40" />
                  </Link>
                  <div className="flex items-center gap-1 mt-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${i < rev.rating ? "text-amber-400 fill-amber-400" : "text-slate-200 dark:text-slate-700"
                          }`}
                      />
                    ))}
                    <span className="text-[10px] text-slate-400 ml-2">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                    <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                      <ShieldCheck className="w-2.5 h-2.5" /> Verified Review
                    </span>
                  </div>
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                disabled={deletingId === rev.id}
                onClick={() => handleDelete(rev.id)}
                className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl shrink-0"
                title="Delete review"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            {rev.comment && (
              <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl leading-relaxed">
                "{rev.comment}"
              </p>
            )}

            {rev.reply && (
              <div className="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 p-3.5 rounded-2xl text-xs text-blue-900 dark:text-blue-200 space-y-0.5">
                <span className="font-bold block text-[11px] text-[#1E60ED]">
                  Seller Response {rev.seller?.name ? `(${rev.seller.name})` : ""}:
                </span>
                <p className="leading-relaxed">{rev.reply}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
