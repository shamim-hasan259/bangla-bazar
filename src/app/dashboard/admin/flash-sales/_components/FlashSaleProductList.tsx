"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Check, X, Calendar, Percent, ShieldAlert, ArrowLeft, ShoppingBag, Bolt } from "lucide-react";
import { toast } from "sonner";
import { updateFlashSaleProductStatus } from "../../campaigns/_action";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface FlashSaleProductListProps {
  flashSale: any;
}

export default function FlashSaleProductList({ flashSale }: FlashSaleProductListProps) {
  const router = useRouter();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleStatusUpdate = async (flashSaleProductId: string, status: string) => {
    try {
      setUpdatingId(flashSaleProductId);
      const res = await updateFlashSaleProductStatus(flashSaleProductId, status);
      if (res.success) {
        toast.success(`Product request ${status.toLowerCase()} successfully`);
        router.refresh();
      } else {
        toast.error(res.error || "Failed to update product status");
      }
    } catch {
      toast.error("Error updating status");
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-green-50 text-green-600 border-green-100";
      case "Rejected":
        return "bg-red-50 text-red-600 border-red-100";
      default:
        return "bg-blue-50/50 text-[#1E60ED] border-blue-105";
    }
  };

  return (
    <div className="space-y-6 text-xs font-semibold">
      
      {/* Back button */}
      <Link
        href="/dashboard/admin/flash-sales"
        className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-800 font-bold transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Flash Sales List
      </Link>

      {/* Flash Sale Details Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs relative">
        <div className="h-48 sm:h-64 relative bg-slate-50 border-b flex items-center justify-center">
          {flashSale.banner ? (
            <img src={flashSale.banner} alt={flashSale.name} className="w-full h-full object-cover" />
          ) : (
            <Bolt className="w-16 h-16 text-slate-350" />
          )}
          {/* Status overlay */}
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-slate-200 shadow-2xs">
            <span className="font-extrabold text-slate-700">Flash Sale Details</span>
          </div>
        </div>

        <div className="p-6 md:p-8 space-y-4">
          <div className="space-y-2">
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-800 dark:text-white">{flashSale.name}</h1>
            <p className="text-slate-400 font-bold flex items-center gap-1 text-[10px]">
              <Calendar className="w-4 h-4" />
              {new Date(flashSale.startDate).toLocaleString()} - {new Date(flashSale.endDate).toLocaleString()}
            </p>
          </div>

          {/* Details specs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
            <div className="border border-slate-100 p-4 rounded-2xl bg-white text-center">
              <span className="text-slate-400 text-[9px] uppercase tracking-wider block font-bold">Min Discount Constraint</span>
              <span className="text-base font-black text-slate-800 mt-1 block">{flashSale.minDiscountPercentage}% Off</span>
            </div>
            <div className="border border-slate-100 p-4 rounded-2xl bg-white text-center">
              <span className="text-slate-400 text-[9px] uppercase tracking-wider block font-bold">Max Submissions / Event</span>
              <span className="text-base font-black text-slate-800 mt-1 block">{flashSale.productLimit} products</span>
            </div>
            <div className="border border-slate-100 p-4 rounded-2xl bg-white text-center">
              <span className="text-slate-400 text-[9px] uppercase tracking-wider block font-bold">Total Products Registered</span>
              <span className="text-base font-black text-amber-600 mt-1 block">{flashSale.products?.length || 0} items</span>
            </div>
            <div className="border border-slate-100 p-4 rounded-2xl bg-white text-center">
              <span className="text-slate-400 text-[9px] uppercase tracking-wider block font-bold">Pending Moderation</span>
              <span className="text-base font-black text-[#1E60ED] mt-1 block">
                {flashSale.products?.filter((p: any) => p.status === "Pending").length || 0} items
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Enrolled Products Section */}
      <Card className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <CardHeader className="border-b pb-4">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-amber-500" />
            Seller Submitted Products ({flashSale.products?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {flashSale.products?.map((req: any) => {
              const discountedPrice = req.product?.price - req.product?.price * (req.discountPercentage / 100);
              return (
                <div
                  key={req.id}
                  className="flex flex-col sm:flex-row justify-between sm:items-center p-4 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800 rounded-2xl gap-4 hover:border-slate-200 transition-colors"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    {/* Product Photo */}
                    <div className="w-12 h-12 bg-white border rounded-xl overflow-hidden shrink-0 flex items-center justify-center">
                      {req.product?.photo?.[0] ? (
                        <img src={req.product.photo[0]} alt={req.product.name} className="w-full h-full object-cover" />
                      ) : (
                        <ShoppingBag className="w-5 h-5 text-slate-300" />
                      )}
                    </div>
                    
                    <div className="min-w-0 space-y-0.5">
                      <p className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-sm sm:max-w-md">{req.product?.name}</p>
                      <div className="text-slate-450 text-[10px] space-y-0.5">
                        <p>
                          Original Price: ৳{req.product?.price} | Offered Deal:{" "}
                          <span className="text-[#1E60ED] font-black text-xs">
                            ৳{discountedPrice.toFixed(1)} ({req.discountPercentage}% Off)
                          </span>
                        </p>
                        <p className="text-slate-400">
                          Flash Pool Stock: <span className="font-bold text-slate-700">{req.flashSaleStock} units</span> | Limit / Order:{" "}
                          <span className="font-bold text-slate-700">{req.purchaseLimit} units</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Status Badge */}
                  <div className="flex items-center gap-3 justify-end shrink-0">
                    <span className={`px-3 py-1 rounded-full font-bold uppercase text-[9px] border ${getStatusClass(req.status)}`}>
                      {req.status}
                    </span>
                    
                    {req.status === "Pending" && (
                      <div className="flex items-center gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          disabled={updatingId === req.id}
                          onClick={() => handleStatusUpdate(req.id, "Approved")}
                          className="h-8 w-8 border-green-200 text-green-600 hover:bg-green-50 rounded-xl"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          disabled={updatingId === req.id}
                          onClick={() => handleStatusUpdate(req.id, "Rejected")}
                          className="h-8 w-8 border-red-200 text-red-650 hover:bg-red-50 rounded-xl"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {!flashSale.products?.length && (
              <div className="text-center py-12 text-slate-400">
                <ShieldAlert className="w-8 h-8 mx-auto mb-2 opacity-35" />
                <p className="italic">No products enrolled in this flash sale event yet.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
