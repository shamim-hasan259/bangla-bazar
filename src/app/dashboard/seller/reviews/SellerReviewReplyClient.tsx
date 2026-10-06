"use client";

import React, { useState } from "react";
import { Star, MessageSquare, Send } from "lucide-react";
import { toast } from "sonner";

export default function SellerReviewReplyClient({ initialReviews, sellerId }: { initialReviews: any[]; sellerId: string }) {
  const [reviews, setReviews] = useState(initialReviews);
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleReplySubmit = async (reviewId: string) => {
    const text = replyInputs[reviewId];
    if (!text || !text.trim()) return;

    try {
      setLoadingId(reviewId);
      const res = await fetch(`/api/reviews/${reviewId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sellerId, reply: text }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Reply submitted successfully!");
        setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, reply: text } : r));
      } else {
        toast.error(data.error || "Failed to submit reply");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setLoadingId(null);
    }
  };

  if (reviews.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center text-slate-400 text-xs">
        No customer reviews written for your products yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((rev) => {
        const img = Array.isArray(rev.product.photo) ? rev.product.photo[0] : typeof rev.product.photo === "string" ? rev.product.photo : null;

        return (
          <div key={rev.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-xl overflow-hidden shrink-0 border">
                  {img ? <img src={img} alt={rev.product.name} className="w-full h-full object-cover" /> : <MessageSquare className="w-5 h-5 m-2 text-slate-400" />}
                </div>
                <div>
                  <span className="font-bold text-sm text-slate-800 dark:text-white block">{rev.product.name}</span>
                  <span className="text-xs text-slate-400">Buyer: {rev.customer?.name || "Verified Customer"}</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-3.5 h-3.5 ${i < rev.rating ? "text-amber-400 fill-amber-400" : "text-slate-200"}`} />
                ))}
              </div>
            </div>

            {rev.comment && <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl">{rev.comment}</p>}

            {rev.reply ? (
              <div className="bg-blue-50/50 border border-blue-100 p-3 rounded-2xl text-xs text-blue-900">
                <span className="font-bold block text-[11px] mb-0.5">Your Response:</span>
                {rev.reply}
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Write an official response..."
                  value={replyInputs[rev.id] || ""}
                  onChange={(e) => setReplyInputs(prev => ({ ...prev, [rev.id]: e.target.value }))}
                  className="flex-1 px-4 py-2 border rounded-xl text-xs bg-slate-50 border-slate-200"
                />
                <button
                  onClick={() => handleReplySubmit(rev.id)}
                  disabled={loadingId === rev.id}
                  className="px-4 py-2 bg-[#1E60ED] text-white rounded-xl text-xs font-bold flex items-center gap-1"
                >
                  <Send className="w-3.5 h-3.5" /> Reply
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
