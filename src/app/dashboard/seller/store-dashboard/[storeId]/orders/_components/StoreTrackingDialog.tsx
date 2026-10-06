"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateOrderTracking } from "../../../../orders/_action";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface StoreTrackingDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  order: any;
}

export default function StoreTrackingDialog({
  open,
  setOpen,
  order,
}: StoreTrackingDialogProps) {
  const [courier, setCourier] = useState(order.courierName || "");
  const [trackingCode, setTrackingCode] = useState(order.trackingCode || "");
  const [status, setStatus] = useState(order.status || "Pending");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSave = async () => {
    try {
      setLoading(true);
      const res = await updateOrderTracking(order.id, trackingCode, courier, status);
      if (res) {
        toast.success("Order tracking and status updated successfully");
        setOpen(false);
        router.refresh();
      } else {
        toast.error("Failed to update tracking details");
      }
    } catch {
      toast.error("Error occurred while saving tracking details");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
        <DialogHeader>
          <DialogTitle className="text-sm font-bold text-slate-800 dark:text-white">
            Update Courier & Fulfillment
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4 text-xs">
          <div className="space-y-1.5">
            <Label htmlFor="courier" className="font-bold text-slate-600 dark:text-slate-400">
              Courier Name
            </Label>
            <Input
              id="courier"
              value={courier}
              onChange={(e) => setCourier(e.target.value)}
              placeholder="e.g. Pathao, Steadfast"
              className="rounded-xl border-slate-200"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tracking" className="font-bold text-slate-600 dark:text-slate-400">
              Tracking Reference Code
            </Label>
            <Input
              id="tracking"
              value={trackingCode}
              onChange={(e) => setTrackingCode(e.target.value)}
              placeholder="e.g. TRK-990823"
              className="rounded-xl border-slate-200 font-mono"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="status" className="font-bold text-slate-600 dark:text-slate-400">
              Fulfillment Status
            </Label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2 text-xs focus:outline-none"
            >
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Complete">Complete</option>
              <option value="Return">Return</option>
              <option value="Canceled">Canceled</option>
            </select>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button
            variant="ghost"
            onClick={() => setOpen(false)}
            className="rounded-xl text-slate-500"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading}
            className="rounded-xl bg-[#1E60ED] hover:bg-blue-600 text-white"
          >
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
