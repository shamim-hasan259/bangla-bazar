"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Calendar, Percent, ArrowLeft, UploadCloud, Bolt } from "lucide-react";
import { toast } from "sonner";
import { createFlashSale } from "../../campaigns/_action";
import { uploadImages } from "../../../seller/store/_action";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function FlashSaleCreateForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [minDiscount, setMinDiscount] = useState(40);
  const [productLimit, setProductLimit] = useState(20);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLaunch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !startDate || !endDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!bannerFile) {
      toast.error("Please upload a flash sale banner image");
      return;
    }

    // Date validations
    if (new Date(startDate) >= new Date(endDate)) {
      toast.error("Start date must be earlier than End date");
      return;
    }

    try {
      setLoading(true);
      
      // 1. Upload Banner file
      const uploadFormData = new FormData();
      uploadFormData.append("files", bannerFile);
      
      const uploadRes = await uploadImages(uploadFormData, "");
      if (!uploadRes.data?.success || !uploadRes.data?.urls?.[0]) {
        toast.error("Failed to upload banner image");
        return;
      }
      
      const uploadedBannerUrl = uploadRes.data.urls[0];

      // 2. Submit Flash Sale
      const res = await createFlashSale({
        name,
        banner: uploadedBannerUrl,
        startDate,
        endDate,
        productLimit,
        minDiscountPercentage: minDiscount,
      });

      if (res.success) {
        toast.success("Flash Sale slot scheduled successfully!");
        router.push("/dashboard/admin/flash-sales");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to schedule flash sale");
      }
    } catch {
      toast.error("An error occurred while scheduling flash sale");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 text-xs font-semibold">
      
      {/* Back button */}
      <Link
        href="/dashboard/admin/flash-sales"
        className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-800 font-bold transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Flash Sales List
      </Link>

      <Card className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg">
        <CardHeader className="border-b pb-5">
          <CardTitle className="text-sm font-black flex items-center gap-2 text-slate-800 dark:text-white">
            <Bolt className="w-4 h-4 text-amber-500 fill-amber-500" />
            Schedule New Flash Sale Event
          </CardTitle>
          <p className="text-[11px] font-normal text-slate-400 mt-1">
            Setup duration windows, set mandatory discount percentages, and limit products count.
          </p>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleLaunch} className="space-y-5">
            
            {/* Event Name */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-650 dark:text-slate-350 block">Flash Sale Title *</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Eid Night Lightning Deals, Weekend Flash Bazaar"
                className="rounded-xl border-slate-200 h-10 text-xs"
                required
              />
            </div>

            {/* Banner Image Uploader */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-650 dark:text-slate-350 block">Banner Image *</label>
              <div className="relative flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100/50 border border-dashed border-slate-200 rounded-2xl p-6 transition-all min-h-[140px]">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setBannerFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                
                {bannerFile ? (
                  <div className="space-y-2 text-center w-full">
                    <div className="max-h-24 overflow-hidden rounded-xl border inline-block max-w-xs mx-auto">
                      <img
                        src={URL.createObjectURL(bannerFile)}
                        alt="Preview"
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <p className="text-slate-550 text-[10px] font-mono truncate max-w-xs mx-auto">
                      {bannerFile.name} ({(bannerFile.size / 1024).toFixed(1)} KB)
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-slate-500 text-center pointer-events-none">
                    <UploadCloud className="w-8 h-8 text-amber-500 mb-2" />
                    <span className="font-bold text-[11px] block">Drag & drop your banner image here</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">Supports PNG, JPG, or WEBP formats</span>
                  </div>
                )}
              </div>
            </div>

            {/* Date Schedules */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-650 dark:text-slate-350 block block">Start Date & Time *</label>
                <Input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="rounded-xl border-slate-200 h-10 text-xs"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="font-bold text-slate-650 dark:text-slate-350 block block">End Date & Time *</label>
                <Input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="rounded-xl border-slate-200 h-10 text-xs"
                  required
                />
              </div>
            </div>

            {/* Numeric Constraints */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-650 dark:text-slate-350 block flex items-center gap-1">
                  <Percent className="w-3.5 h-3.5 text-slate-400" /> Minimum Discount Required (%)
                </label>
                <Input
                  type="number"
                  value={minDiscount}
                  onChange={(e) => setMinDiscount(Math.max(1, Number(e.target.value)))}
                  min={1}
                  max={100}
                  className="rounded-xl border-slate-200 h-10 text-xs"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="font-bold text-slate-650 dark:text-slate-350 block">Max Products / Event</label>
                <Input
                  type="number"
                  value={productLimit}
                  onChange={(e) => setProductLimit(Math.max(1, Number(e.target.value)))}
                  min={1}
                  className="rounded-xl border-slate-200 h-10 text-xs"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-[#1E60ED] hover:bg-blue-600 text-white font-extrabold py-6 text-xs shadow-md shadow-blue-500/10 mt-4 transition-all"
            >
              {loading ? "Uploading files & scheduling..." : "Schedule Flash Sale"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
