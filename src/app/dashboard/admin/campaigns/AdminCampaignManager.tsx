"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Calendar, Percent, Trash2, Check, X, Plus } from "lucide-react";
import { toast } from "sonner";
import { createCampaign, deleteCampaign, updateCampaignProductStatus } from "./_action";
import { useRouter } from "next/navigation";

interface AdminCampaignManagerProps {
  categories: any[];
  initialCampaigns: any[];
}

export default function AdminCampaignManager({
  categories,
  initialCampaigns,
}: AdminCampaignManagerProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [banner, setBanner] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [minDiscount, setMinDiscount] = useState(10);
  const [maxProducts, setMaxProducts] = useState(50);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleCategoryToggle = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !banner || !startDate || !endDate) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);
      const res = await createCampaign({
        name,
        banner,
        description,
        startDate,
        endDate,
        eligibleCategoryIds: selectedCategories,
        maxProductLimit: maxProducts,
        minDiscountPercentage: minDiscount,
      });

      if (res.success) {
        toast.success("Campaign created successfully");
        setName("");
        setBanner("");
        setDescription("");
        setStartDate("");
        setEndDate("");
        setMinDiscount(10);
        setMaxProducts(50);
        setSelectedCategories([]);
        router.refresh();
      } else {
        toast.error(res.error || "Failed to create campaign");
      }
    } catch {
      toast.error("Error creating campaign");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this campaign?")) return;
    try {
      const res = await deleteCampaign(id);
      if (res.success) {
        toast.success("Campaign deleted");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to delete campaign");
      }
    } catch {
      toast.error("Error deleting campaign");
    }
  };

  const handleStatusUpdate = async (campaignProductId: string, status: string) => {
    try {
      const res = await updateCampaignProductStatus(campaignProductId, status);
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
              Create Campaign Event
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-650 dark:text-slate-350">Campaign Name *</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Eid Mega Sale, Winter Discount"
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

              <div className="space-y-1.5">
                <label className="font-bold text-slate-650 dark:text-slate-350">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Campaign details and promo code rules..."
                  className="w-full min-h-[60px] rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent px-3 py-2 focus:outline-none"
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
                    value={maxProducts}
                    onChange={(e) => setMaxProducts(Number(e.target.value))}
                    min={1}
                    className="rounded-xl border-slate-200"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-650 dark:text-slate-350">Eligible Categories</label>
                <div className="grid grid-cols-2 gap-2 max-h-[120px] overflow-y-auto border border-slate-100 rounded-xl p-3">
                  {categories.map((cat) => (
                    <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat.id)}
                        onChange={() => handleCategoryToggle(cat.id)}
                        className="rounded"
                      />
                      <span className="truncate">{cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#1E60ED] hover:bg-blue-600 text-white font-bold py-5 mt-2"
              >
                {loading ? "Creating..." : "Launch Campaign"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns list & enrolled products */}
      <div className="xl:col-span-2 space-y-6">
        <Card className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <CardHeader className="border-b pb-4">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Percent className="w-4 h-4 text-[#1E60ED]" />
              Active campaigns ({initialCampaigns.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {initialCampaigns.map((camp) => (
              <div
                key={camp.id}
                className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 space-y-4"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex items-center gap-3">
                    {camp.banner && (
                      <div className="w-12 h-12 rounded-xl overflow-hidden border shrink-0">
                        <img src={camp.banner} alt={camp.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-slate-200">{camp.name}</h4>
                      <p className="text-slate-400 mt-0.5 text-[10px] flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(camp.startDate).toLocaleDateString()} - {new Date(camp.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold">
                      Min {camp.minDiscountPercentage}% Off
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(camp.id)}
                      className="text-red-500 hover:bg-red-50 rounded-xl"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {camp.description && (
                  <p className="text-slate-550 italic leading-relaxed">{camp.description}</p>
                )}

                {/* Enrolled Products requests */}
                <div className="space-y-2">
                  <h5 className="font-bold text-slate-600 dark:text-slate-400">
                    Product Requests ({camp.products?.length || 0})
                  </h5>
                  <div className="space-y-2">
                    {camp.products?.map((req: any) => (
                      <div
                        key={req.id}
                        className="flex justify-between items-center p-3 bg-white dark:bg-slate-900 border rounded-xl"
                      >
                        <div className="min-w-0">
                          <p className="font-bold truncate max-w-xs">{req.product?.name}</p>
                          <p className="text-slate-500 mt-0.5">
                            Original: ৳{req.product?.price} | Offered:{" "}
                            <span className="text-blue-600 font-bold">
                              ৳{(req.product?.price - req.product?.price * (req.discountPercentage / 100)).toFixed(1)} ({req.discountPercentage}%)
                            </span>
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
                    {!camp.products?.length && (
                      <p className="text-slate-400 italic">No products submitted for this campaign yet.</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {!initialCampaigns.length && (
              <div className="text-center py-8 text-slate-400">No campaigns launched yet.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
