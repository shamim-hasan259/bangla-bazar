"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { requestOrderReturn } from "./_action";
import { Toaster } from "@/components/ui/sonner";

export default function ReturnOrderDialog({ orderId, status }: { orderId: string, status: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  if (status !== "Delivered") {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error("Please provide a reason for the return.");
      return;
    }

    setLoading(true);
    const res = await requestOrderReturn(orderId, reason);
    setLoading(false);

    if (res?.success) {
      toast.success("Return request submitted successfully.");
      setOpen(false);
    } else {
      toast.error(res?.message || "Failed to submit request.");
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="destructive" className="mt-4 w-full md:w-auto">
            Request Return / Refund
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Return & Refund</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Reason for Return</label>
              <Textarea
                placeholder="Please tell us why you are returning this item..."
                value={reason}
                onChange={e => setReason(e.target.value)}
                rows={4}
              />
            </div>
            <p className="text-xs text-gray-500">
              Note: Once requested, our support team will contact you. Your item must be in its original condition.
            </p>
            <Button type="submit" disabled={loading} variant="destructive" className="w-full">
              {loading ? "Submitting..." : "Submit Return Request"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
      <Toaster />
    </>
  );
}
