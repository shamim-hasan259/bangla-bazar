"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Calendar, Trash2, ArrowRight, Play, Info, Plus, Bolt } from "lucide-react";
import { toast } from "sonner";
import { deleteFlashSale } from "../../campaigns/_action";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface FlashSalesListProps {
  initialFlashSales: any[];
}

export default function FlashSalesList({ initialFlashSales }: FlashSalesListProps) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const now = new Date();

  // Filter running flash sales
  const runningFlashSales = initialFlashSales.filter((fs) => {
    const start = new Date(fs.startDate);
    const end = new Date(fs.endDate);
    return start <= now && end >= now;
  });

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    e.preventDefault();

    if (!confirm("Are you sure you want to delete this flash sale slot? All enrolled products will be removed from the flash sale.")) {
      return;
    }

    try {
      setLoadingId(id);
      const res = await deleteFlashSale(id);
      if (res.success) {
        toast.success("Flash sale event slot deleted");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to delete flash sale");
      }
    } catch {
      toast.error("Error occurred while deleting the flash sale slot");
    } finally {
      setLoadingId(null);
    }
  };

  const getStatusBadge = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > now) {
      return (
        <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-[#1E60ED] border border-blue-100 flex items-center gap-1 w-fit">
          <Calendar className="w-3 h-3" /> Upcoming
        </span>
      );
    } else if (start <= now && end >= now) {
      return (
        <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-100 flex items-center gap-1 w-fit animate-pulse">
          <Bolt className="w-3 h-3 fill-amber-500 text-amber-500" /> Live Now
        </span>
      );
    } else {
      return (
        <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200 flex items-center gap-1 w-fit">
          Ended
        </span>
      );
    }
  };

  return (
    <div className="space-y-6 text-xs font-medium">
      
      {/* ── Active Running Flash Sales Status Alert ── */}
      {runningFlashSales.length > 0 ? (
        <div className="bg-gradient-to-r from-amber-500/10 to-[#1E60ED]/5 border border-amber-500/20 rounded-3xl p-5 md:p-6 flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl bg-amber-500 flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20 animate-bounce">
            <Bolt className="w-5 h-5 text-white fill-white" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">Lightning Flash Sale Active</h3>
            <p className="text-slate-550 dark:text-slate-400 leading-relaxed text-[11px]">
              You have <span className="font-bold text-amber-600">{runningFlashSales.length} flash sale slots</span> active right now. Enrolled vendor products are live with custom flash discount rates and inventory limitations.
            </p>
            <div className="pt-2 flex flex-wrap gap-2">
              {runningFlashSales.map((fs) => (
                <Link
                  key={fs.id}
                  href={`/dashboard/admin/flash-sales/${fs.id}`}
                  className="bg-white hover:bg-slate-50 text-slate-700 font-bold px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-1.5 transition-colors"
                >
                  <span>{fs.name}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-amber-600" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 border border-slate-100 rounded-3xl p-5 md:p-6 flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl bg-slate-200 flex items-center justify-center shrink-0">
            <Info className="w-5 h-5 text-slate-500" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">No Live Flash Sales</h3>
            <p className="text-slate-550 dark:text-slate-400 leading-relaxed text-[11px]">
              No flash sale slots are active at the moment. Flash sales have a separate discount threshold constraint (usually higher than campaigns, e.g. 40%+). Click the schedule button above to configure a new slot.
            </p>
          </div>
        </div>
      )}

      {/* ── Flash Sales Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {initialFlashSales.map((fs) => {
          return (
            <Link
              key={fs.id}
              href={`/dashboard/admin/flash-sales/${fs.id}`}
              className="group block bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs hover:shadow-md hover:border-slate-200 dark:hover:border-slate-700 transition-all cursor-pointer relative"
            >
              {/* Banner */}
              <div className="h-40 bg-slate-50 border-b relative overflow-hidden flex items-center justify-center">
                {fs.banner ? (
                  <img
                    src={fs.banner}
                    alt={fs.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <Bolt className="w-12 h-12 text-slate-300" />
                )}
                {/* Overlay Badge */}
                <div className="absolute top-4 left-4">
                  {getStatusBadge(fs.startDate, fs.endDate)}
                </div>
              </div>

              {/* Details */}
              <div className="p-5 space-y-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-850 dark:text-slate-200 group-hover:text-amber-600 transition-colors line-clamp-1">
                    {fs.name}
                  </h4>
                  <p className="text-slate-400 text-[10px] flex items-center gap-1 font-bold">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {new Date(fs.startDate).toLocaleString()} - {new Date(fs.endDate).toLocaleString()}
                  </p>
                </div>

                {/* KPI details */}
                <div className="grid grid-cols-2 gap-2 border-t pt-4 text-center">
                  <div className="bg-slate-50/50 p-2 rounded-xl border border-slate-100">
                    <span className="text-slate-400 text-[9px] uppercase tracking-wider block font-bold">Required Discount</span>
                    <span className="text-sm font-black text-slate-800 mt-0.5 block">{fs.minDiscountPercentage}% Off</span>
                  </div>
                  <div className="bg-slate-50/50 p-2 rounded-xl border border-slate-100">
                    <span className="text-slate-400 text-[9px] uppercase tracking-wider block font-bold">Slot Product Limit</span>
                    <span className="text-sm font-black text-slate-800 mt-0.5 block">{fs.productLimit} items</span>
                  </div>
                </div>

                {/* Action footer */}
                <div className="flex justify-between items-center pt-2">
                  <span className="font-bold text-[#1E60ED] flex items-center gap-0.5 group-hover:underline">
                    View Enrolled Products ({fs.products?.length || 0})
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={loadingId === fs.id}
                    onClick={(e) => handleDelete(e, fs.id)}
                    className="text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {initialFlashSales.length === 0 && (
        <div className="text-center py-16 text-slate-400 bg-white border border-dashed rounded-3xl">
          <Bolt className="w-10 h-10 mx-auto mb-3 opacity-30 text-amber-500" />
          <p className="text-sm font-bold">No flash sales scheduled yet.</p>
          <Link href="/dashboard/admin/flash-sales/create" className="mt-4 inline-block">
            <Button className="rounded-xl bg-[#1E60ED] hover:bg-blue-600 text-white font-bold text-xs gap-1.5 px-4 py-2">
              <Plus className="w-4 h-4" /> Schedule First Flash Sale
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
