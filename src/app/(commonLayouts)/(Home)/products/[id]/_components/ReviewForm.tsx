"use client";
import { useState } from "react";
import { Star, MessageSquare, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { submitReview } from "../_action";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function ReviewForm({ productId }: { productId: string }) {
  const { data: session } = useSession();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const userType = (session?.user as any)?.type?.toLowerCase();
  const isCustomer = userType === "customer";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) {
      toast.error("Please login as a customer to review this product.");
      return;
    }

    if (!isCustomer) {
      toast.error("Only registered customers can write product reviews.");
      return;
    }

    if (!comment || comment.trim().length < 3) {
      toast.error("Please provide a comment with at least 3 characters.");
      return;
    }

    setLoading(true);
    const res = await submitReview(productId, rating, comment);
    setLoading(false);

    if (res?.success) {
      toast.success(res.message || "Review submitted successfully!");
      setComment("");
      setRating(5);
    } else {
      toast.error(res?.message || "Failed to submit review.");
    }
  };

  if (!session?.user) {
    return (
      <div className="bg-[#fafafa] dark:bg-slate-800/50 p-6 rounded-2xl border border-[#e0e0e0] dark:border-slate-700 text-center space-y-3">
        <MessageSquare className="w-8 h-8 text-slate-400 mx-auto" />
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Want to share your experience with this product?
        </p>
        <Link href="/auth/customer/login">
          <Button size="sm" className="bg-[#1E60ED] hover:bg-blue-600 text-white rounded-xl text-xs font-bold">
            Login as Customer to Review
          </Button>
        </Link>
      </div>
    );
  }

  if (!isCustomer) {
    return (
      <div className="bg-amber-50/60 dark:bg-amber-950/20 p-4 rounded-2xl border border-amber-200 dark:border-amber-800/50 flex items-center gap-3 text-amber-800 dark:text-amber-300 text-xs">
        <AlertCircle className="w-5 h-5 shrink-0 text-amber-600" />
        <p>Product reviews can only be submitted by registered Customer accounts.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
      <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
        <MessageSquare className="w-4 h-4 text-[#1E60ED]" />
        Write a Product Review
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            Your Rating
          </label>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                className="focus:outline-none transition-transform hover:scale-110"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
              >
                <Star
                  className={`w-6 h-6 ${
                    (hoverRating || rating) >= star
                      ? "fill-amber-400 text-amber-400"
                      : "text-slate-200 dark:text-slate-700"
                  }`}
                />
              </button>
            ))}
            <span className="text-xs font-bold text-slate-500 ml-2">
              {hoverRating || rating} out of 5 Stars
            </span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            Your Feedback / Comment
          </label>
          <Textarea
            placeholder="Describe product quality, delivery experience, packaging, or sizing..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            className="rounded-xl border-slate-200 text-xs"
            required
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="bg-[#1E60ED] hover:bg-blue-600 text-white rounded-xl font-bold text-xs px-5"
        >
          {loading ? "Submitting Review..." : "Submit Review"}
        </Button>
      </form>
    </div>
  );
}
