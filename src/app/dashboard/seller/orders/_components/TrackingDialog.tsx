"use client";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateOrderTracking } from "../_action";
import { toast } from "sonner";

export default function TrackingDialog({ open, setOpen, order }: { open: boolean, setOpen: any, order: any }) {
  const [trackingCode, setTrackingCode] = useState("");
  const [courierName, setCourierName] = useState("");
  const [status, setStatus] = useState("Processing");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (order) {
      setTrackingCode(order.trackingCode || "");
      setCourierName(order.courierName || "");
      setStatus(order.status || "Processing");
    }
  }, [order, open]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    const res = await updateOrderTracking(order.id, trackingCode, courierName, status);
    setLoading(false);
    if (res) {
      toast.success("Order tracking updated");
      setOpen(false);
    } else {
      toast.error("Update failed");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Fulfillment & Tracking</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Order Status</label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Processing">Processing</SelectItem>
                <SelectItem value="Shipped">Shipped</SelectItem>
                <SelectItem value="Delivered">Delivered</SelectItem>
                <SelectItem value="Return">Return</SelectItem>
                <SelectItem value="Canceled">Canceled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Courier Name</label>
            <Input value={courierName} onChange={e => setCourierName(e.target.value)} placeholder="e.g. RedX, Pathao, eCourier" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Tracking Code / Link</label>
            <Input value={trackingCode} onChange={e => setTrackingCode(e.target.value)} placeholder="Enter tracking code" />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Updating..." : "Save Changes"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
