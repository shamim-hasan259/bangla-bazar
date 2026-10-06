"use client";

import { useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { approveReturnOrder, disputeReturnOrder } from "../../_action";

export default function ReturnSettlementActions({ orderId }: { orderId: string }) {
  const [loading, setLoading] = useState<"approve" | "dispute" | null>(null);

  const handleApprove = async () => {
    if (!confirm("Are you sure you want to approve this return claim and credit the buyer?")) {
      return;
    }
    setLoading("approve");
    try {
      const res = await approveReturnOrder(orderId);
      if (res?.success) {
        toast.success("Return claim approved and buyer credited successfully.");
      } else {
        toast.error(res?.message || "Failed to approve return claim.");
      }
    } catch (error) {
      toast.error("An error occurred while processing approval.");
    } finally {
      setLoading(null);
    }
  };

  const handleDispute = async () => {
    if (!confirm("Are you sure you want to dispute this return claim?")) {
      return;
    }
    setLoading("dispute");
    try {
      const res = await disputeReturnOrder(orderId);
      if (res?.success) {
        toast.success("Return claim disputed successfully.");
      } else {
        toast.error(res?.message || "Failed to dispute return claim.");
      }
    } catch (error) {
      toast.error("An error occurred while processing dispute.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleApprove}
        disabled={loading !== null}
        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer disabled:opacity-55"
      >
        <CheckCircle className="w-3.5 h-3.5" />
        {loading === "approve" ? "Processing..." : "Approve & Credit"}
      </button>
      <button
        onClick={handleDispute}
        disabled={loading !== null}
        className="px-4 py-2 border border-red-200 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-650 font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer disabled:opacity-55"
      >
        <XCircle className="w-3.5 h-3.5" />
        {loading === "dispute" ? "Processing..." : "Dispute Claim"}
      </button>
    </div>
  );
}
