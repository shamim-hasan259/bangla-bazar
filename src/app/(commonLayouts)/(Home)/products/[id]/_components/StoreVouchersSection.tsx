"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Award, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { collectVoucher } from "@/app/dashboard/seller/marketing/_action";
import { useRouter } from "next/navigation";

interface StoreVouchersSectionProps {
  vouchers: any[];
  customerId: string;
}

export default function StoreVouchersSection({
  vouchers = [],
  customerId,
}: StoreVouchersSectionProps) {
  const router = useRouter();
  const [loadingMap, setLoadingMap] = useState<{ [key: string]: boolean }>({});

  const handleCollect = async (voucherId: string) => {
    if (!customerId) {
      toast.error("Please login to collect vouchers");
      router.push("/auth/customer/login");
      return;
    }

    try {
      setLoadingMap((prev) => ({ ...prev, [voucherId]: true }));
      const res = await collectVoucher(voucherId, customerId);
      if (res.success) {
        toast.success("Voucher collected successfully! View it in your account wallet.");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to collect voucher");
      }
    } catch {
      toast.error("An error occurred during collection");
    } finally {
      setLoadingMap((prev) => ({ ...prev, [voucherId]: false }));
    }
  };

  if (vouchers.length === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-xs space-y-4 text-xs">
      <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
        <Award className="w-5 h-5 text-[#1E60ED]" />
        Available Vouchers & Offers
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {vouchers.map((v) => {
          const isLoading = loadingMap[v.id] || false;
          return (
            <div
              key={v.id}
              className="flex justify-between items-center border border-dashed border-blue-200 dark:border-blue-900 bg-blue-50/10 dark:bg-blue-950/5 p-4 rounded-xl gap-4"
            >
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded text-[10px]">
                    {v.code}
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {v.name}
                  </span>
                </div>
                <p className="text-slate-450 mt-1 text-[11px]">
                  Value:{" "}
                  <span className="font-bold text-blue-600">
                    {v.discountType === "Percentage" ? `${v.discountValue}%` : `৳ ${v.discountValue}`}
                  </span>{" "}
                  • Min Order: ৳ {v.minOrderAmount}
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => handleCollect(v.id)}
                disabled={isLoading}
                className="bg-[#1E60ED] hover:bg-blue-600 text-white font-bold rounded-xl px-4 shrink-0"
              >
                {isLoading ? "Collecting..." : "Collect"}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
