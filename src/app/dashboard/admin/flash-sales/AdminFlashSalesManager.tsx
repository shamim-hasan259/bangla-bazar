"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Calendar, Trash2, Check, X, Plus, Bolt } from "lucide-react";
import { toast } from "sonner";
import { createFlashSale, deleteFlashSale, updateFlashSaleProductStatus } from "../campaigns/_action";
import { useRouter } from "next/navigation";

interface AdminFlashSalesManagerProps {
  initialFlashSales: any[];
}

export default function AdminFlashSalesManager({
  initialFlashSales,
}: AdminFlashSalesManagerProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [banner, setBanner] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [minDiscount, setMinDiscount] = useState(40);
  const [productLimit, setProductLimit] = useState(20);
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !banner || !startDate || !endDate) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);
      const res = await createFlashSale({
        name,
        banner,
        startDate,
        endDate,
        productLimit,
        minDiscountPercentage: minDiscount,
      });

      if (res.success) {
        toast.success("Flash Sale created successfully");
        setName("");
        setBanner("");
        setStartDate("");
        setEndDate("");
        setMinDiscount(40);
        setProductLimit(20);
        router.refresh();
      } else {
        toast.error(res.error || "Failed to create flash sale");
      }
    } catch {
      toast.error("Error creating flash sale");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this flash sale?")) return;
    try {
      const res = await deleteFlashSale(id);
      if (res.success) {
        toast.success("Flash sale deleted");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to delete flash sale");
      }
    } catch {
      toast.error("Error deleting flash sale");
    }
  };

  const handleStatusUpdate = async (flashSaleProductId: string, status: string) => {
    try {
      const res = await updateFlashSaleProductStatus(flashSaleProductId, status);
      if (res.success) {
        toast.success(`Product status updated to ${status}`);
        router.refresh();
      } else {
        toast.error(res.error || "Failed to update product status");
      }
    } catch {
      toast.error("Error updating status");
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 text-xs">
      {/* Create Form */}
      <div className="xl:col-span-1">
        <Card className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <CardHeader className="border-b pb-4">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#1E60ED]" />
              Schedule Flash Sale
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-650 dark:text-slate-350">Flash Sale Name *</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Eid Night Lightning, 11.11 Flash"
                  className="rounded-xl border-slate-200"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-650 dark:text-slate-350">Banner Image URL *</label>
                <Input
                  value={banner}
                  onChange={(e) => setBanner(e.target.value)}
                  placeholder="https://example.com/banner.png"
                  className="rounded-xl border-slate-200 font-mono"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-650 dark:text-slate-350">Start Date *</label>
                  <Input
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="rounded-xl border-slate-200"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-650 dark:text-slate-350">End Date *</label>
                  <Input
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="rounded-xl border-slate-200"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-650 dark:text-slate-350">Min Discount (%)</label>
                  <Input
                    type="number"
                    value={minDiscount}
                    onChange={(e) => setMinDiscount(Number(e.target.value))}
                    min={1}
                    max={100}
                    className="rounded-xl border-slate-200"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-650 dark:text-slate-350">Max Product Limit</label>
                  <Input
                    type="number"
                    value={productLimit}
                    onChange={(e) => setProductLimit(Number(e.target.value))}
                    min={1}
                    className="rounded-xl border-slate-200"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#1E60ED] hover:bg-blue-600 text-white font-bold py-5 mt-2"
              >
                {loading ? "Creating..." : "Schedule Event"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Flash Sales list */}
      <div className="xl:col-span-2 space-y-6">
        <Card className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <CardHeader className="border-b pb-4">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Bolt className="w-4 h-4 text-[#1E60ED]" />
              Scheduled Flash Sales ({initialFlashSales.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {initialFlashSales.map((fs) => (
              <div
                key={fs.id}
                className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 space-y-4"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex items-center gap-3">
                    {fs.banner && (
                      <div className="w-12 h-12 rounded-xl overflow-hidden border shrink-0">
                        <img src={fs.banner} alt={fs.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-slate-200">{fs.name}</h4>
                      <p className="text-slate-400 mt-0.5 text-[10px] flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(fs.startDate).toLocaleString()} - {new Date(fs.endDate).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-50/50 text-[#1E60ED] px-2 py-0.5 rounded-full font-bold">
                      Min {fs.minDiscountPercentage}% Off
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(fs.id)}
                      className="text-red-500 hover:bg-red-50 rounded-xl"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Submitted Products requests */}
                <div className="space-y-2">
                  <h5 className="font-bold text-slate-600 dark:text-slate-400">
                    Product Requests ({fs.products?.length || 0})
                  </h5>
                  <div className="space-y-2">
                    {fs.products?.map((req: any) => (
                      <div
                        key={req.id}
                        className="flex justify-between items-center p-3 bg-white dark:bg-slate-900 border rounded-xl"
                      >
                        <div className="min-w-0">
                          <p className="font-bold truncate max-w-xs">{req.product?.name}</p>
                          <p className="text-slate-550 mt-0.5">
                            Original: ৳ {req.product?.price} | Offered:{" "}
                            <span className="text-[#1E60ED] font-bold">
                              ৳ {(req.product?.price - req.product?.price * (req.discountPercentage / 100)).toFixed(1)} ({req.discountPercentage}%)
                            </span>
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            Flash Stock: {req.flashSaleStock} | Limit per Checkout: {req.purchaseLimit}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold uppercase text-[9px] ${
                              req.status === "Approved"
                                ? "bg-green-50 text-green-600"
                                : req.status === "Rejected"
                                ? "bg-red-50 text-red-600"
                                : "bg-blue-50/50 text-[#1E60ED]"
                            }`}
                          >
                            {req.status}
                          </span>
                          {req.status === "Pending" && (
                            <>
                              <Button
                                size="icon"
                                variant="outline"
                                onClick={() => handleStatusUpdate(req.id, "Approved")}
                                className="h-7 w-7 border-green-200 text-green-600 hover:bg-green-50 rounded-lg"
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="outline"
                                onClick={() => handleStatusUpdate(req.id, "Rejected")}
                                className="h-7 w-7 border-red-200 text-red-650 hover:bg-red-50 rounded-lg"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                    {!fs.products?.length && (
                      <p className="text-slate-400 italic">No products submitted for this flash sale yet.</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {!initialFlashSales.length && (
              <div className="text-center py-8 text-slate-400">No flash sales scheduled yet.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
