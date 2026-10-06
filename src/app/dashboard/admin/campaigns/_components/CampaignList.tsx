"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Calendar, Percent, Trash2, ArrowRight, Play, Info, Plus } from "lucide-react";
import { toast } from "sonner";
import { deleteCampaign } from "../_action";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface CampaignListProps {
  initialCampaigns: any[];
}

export default function CampaignList({ initialCampaigns }: CampaignListProps) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const now = new Date();

  // Filter running campaigns
  const runningCampaigns = initialCampaigns.filter((c) => {
    const start = new Date(c.startDate);
    const end = new Date(c.endDate);
    return start <= now && end >= now;
  });

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    e.preventDefault();

    if (!confirm("Are you sure you want to delete this campaign event? All associated product submissions will be lost.")) {
      return;
    }

    try {
      setLoadingId(id);
      const res = await deleteCampaign(id);
      if (res.success) {
        toast.success("Campaign event deleted successfully");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to delete campaign");
      }
    } catch {
      toast.error("An error occurred while deleting the campaign");
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
        <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center gap-1 w-fit animate-pulse">
          <Play className="w-3 h-3 fill-emerald-600" /> Running
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
      
      {/* ── Active Running Campaign Status Alert ── */}
      {runningCampaigns.length > 0 ? (
        <div className="bg-gradient-to-r from-[#1E60ED]/10 to-[#00A2FF]/5 border border-[#1E60ED]/20 rounded-3xl p-5 md:p-6 flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl bg-[#1E60ED] flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
            <Play className="w-5 h-5 text-white fill-white" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">Active Promotion Live</h3>
            <p className="text-slate-550 dark:text-slate-400 leading-relaxed text-[11px]">
              You have <span className="font-bold text-[#1E60ED]">{runningCampaigns.length} campaign(s)</span> currently running live on the marketplace. Customers can view active campaign products and purchase them with discount benefits.
            </p>
            <div className="pt-2 flex flex-wrap gap-2">
              {runningCampaigns.map((c) => (
                <Link
                  key={c.id}
                  href={`/dashboard/admin/campaigns/${c.id}`}
                  className="bg-white hover:bg-slate-50 text-slate-700 font-bold px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-1.5 transition-colors"
                >
                  <span>{c.name}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#1E60ED]" />
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
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">No Active Campaigns</h3>
            <p className="text-slate-500 leading-relaxed text-[11px]">
              There are no promotion events running right now. Click the launch button above to schedule or start a new marketplace campaign.
            </p>
          </div>
        </div>
      )}

      {/* ── Campaigns Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {initialCampaigns.map((camp) => {
          const isRunning = new Date(camp.startDate) <= now && new Date(camp.endDate) >= now;
          return (
            <Link
              key={camp.id}
              href={`/dashboard/admin/campaigns/${camp.id}`}
              className="group block bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs hover:shadow-md hover:border-slate-200 dark:hover:border-slate-700 transition-all cursor-pointer relative"
            >
              {/* Banner Image */}
              <div className="h-40 bg-slate-50 border-b relative overflow-hidden flex items-center justify-center">
                {camp.banner ? (
                  <img
                    src={camp.banner}
                    alt={camp.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <Percent className="w-12 h-12 text-slate-300" />
                )}
                {/* Overlay badge */}
                <div className="absolute top-4 left-4">
                  {getStatusBadge(camp.startDate, camp.endDate)}
                </div>
              </div>

              {/* Card Details */}
              <div className="p-5 space-y-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-850 dark:text-slate-200 group-hover:text-[#1E60ED] transition-colors line-clamp-1">
                    {camp.name}
                  </h4>
                  <p className="text-slate-400 text-[10px] flex items-center gap-1 font-bold">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {new Date(camp.startDate).toLocaleString()} - {new Date(camp.endDate).toLocaleString()}
                  </p>
                </div>

                {camp.description && (
                  <p className="text-slate-550 text-[11px] leading-relaxed line-clamp-2 italic">
                    {camp.description}
                  </p>
                )}

                {/* KPI details */}
                <div className="grid grid-cols-2 gap-2 border-t pt-4 text-center">
                  <div className="bg-slate-50/50 p-2 rounded-xl border border-slate-100">
                    <span className="text-slate-400 text-[9px] uppercase tracking-wider block font-bold">Min Discount</span>
                    <span className="text-sm font-black text-slate-800 mt-0.5 block">{camp.minDiscountPercentage}% Off</span>
                  </div>
                  <div className="bg-slate-50/50 p-2 rounded-xl border border-slate-100">
                    <span className="text-slate-400 text-[9px] uppercase tracking-wider block font-bold">Limit / Seller</span>
                    <span className="text-sm font-black text-slate-800 mt-0.5 block">{camp.maxProductLimit} items</span>
                  </div>
                </div>

                {/* Footer status / Action Row */}
                <div className="flex justify-between items-center pt-2">
                  <span className="font-bold text-[#1E60ED] flex items-center gap-0.5 group-hover:underline">
                    View Enrolled Products ({camp.products?.length || 0})
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={loadingId === camp.id}
                    onClick={(e) => handleDelete(e, camp.id)}
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

      {initialCampaigns.length === 0 && (
        <div className="text-center py-16 text-slate-400 bg-white border border-dashed rounded-3xl">
          <Percent className="w-10 h-10 mx-auto mb-3 opacity-30 text-[#1E60ED]" />
          <p className="text-sm font-bold">No campaigns scheduled or running yet.</p>
          <Link href="/dashboard/admin/campaigns/create" className="mt-4 inline-block">
            <Button className="rounded-xl bg-[#1E60ED] hover:bg-blue-600 text-white font-bold text-xs gap-1.5 px-4 py-2">
              <Plus className="w-4 h-4" /> Launch First Campaign
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
