"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Percent, Plus, ArrowLeft, CheckCircle2, ChevronRight, Info, PlusCircle, Store } from "lucide-react";
import { toast } from "sonner";
import { submitCampaignProduct } from "../_action";
import { useRouter } from "next/navigation";

interface CampaignEnrollmentClientProps {
  campaigns: any[];
  stores: any[];
  products: any[];
  sellerId: string;
}

export default function CampaignEnrollmentClient({
  campaigns,
  stores,
  products,
  sellerId,
}: CampaignEnrollmentClientProps) {
  const router = useRouter();
  const [activeCampaign, setActiveCampaign] = useState<any | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [selectedStoreId, setSelectedStoreId] = useState<string>(stores[0]?.id || "");
  const [discountInputs, setDiscountInputs] = useState<{ [key: string]: number }>({});
  const [loadingProductId, setLoadingProductId] = useState<string | null>(null);

  // Filter products by selected store context
  const filteredProducts = products.filter((prod) => {
    if (selectedStoreId && prod.storeId !== selectedStoreId) {
      return false;
    }
    // Filter out products already enrolled in the active campaign
    const isEnrolled = activeCampaign?.products?.some((p: any) => p.productId === prod.id);
    if (isEnrolled) return false;

    // Filter by category eligibility if defined
    if (activeCampaign?.eligibleCategoryIds?.length > 0) {
      const isEligible =
        (prod.categoryId && activeCampaign.eligibleCategoryIds.includes(prod.categoryId)) ||
        (prod.masterCategoryId && activeCampaign.eligibleCategoryIds.includes(prod.masterCategoryId));
      if (!isEligible) return false;
    }
    return true;
  });

  const handleEnrollProduct = async (productId: string, price: number) => {
    if (!activeCampaign) return;

    const discountPercentage = discountInputs[productId] || activeCampaign.minDiscountPercentage;

    if (discountPercentage < activeCampaign.minDiscountPercentage) {
      toast.error(`Minimum discount for this campaign is ${activeCampaign.minDiscountPercentage}%`);
      return;
    }

    try {
      setLoadingProductId(productId);
      const res = await submitCampaignProduct({
        campaignId: activeCampaign.id,
        productId,
        storeId: selectedStoreId || undefined,
        sellerId,
        discountPercentage,
      });

      if (res.success) {
        toast.success("Product enrolled successfully. Awaiting admin approval.");
        
        // Dynamic client-side optimistic state update
        const newProductRef = products.find(p => p.id === productId);
        const updatedActiveCampaign = {
          ...activeCampaign,
          products: [
            ...(activeCampaign.products || []),
            {
              id: res.campaignProduct.id,
              productId,
              discountPercentage,
              status: "Pending",
              product: newProductRef
            }
          ]
        };

        // Update target campaign inside the lists as well
        setActiveCampaign(updatedActiveCampaign);
        setDiscountInputs(prev => {
          const updated = { ...prev };
          delete updated[productId];
          return updated;
        });

        setIsAddingProduct(false);
        router.refresh();
      } else {
        toast.error(res.error || "Enrollment failed");
      }
    } catch {
      toast.error("An error occurred during enrollment");
    } finally {
      setLoadingProductId(null);
    }
  };

  // SCREEN 3: Add Product View (Select Store + Store Products Grid cards)
  if (activeCampaign && isAddingProduct) {
    return (
      <div className="space-y-6 text-xs">
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsAddingProduct(false)}
              className="rounded-xl border-slate-200"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-white">
                Add Products to {activeCampaign.name}
              </h2>
              <p className="text-slate-500 mt-0.5">
                Minimum required discount: {activeCampaign.minDiscountPercentage}%
              </p>
            </div>
          </div>
        </div>

        {/* Store Selection Dropdown */}
        {stores.length > 0 && (
          <Card className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-[#1E60ED]" />
                <span className="font-bold text-slate-700">Filter Products by Store</span>
              </div>
              <Select value={selectedStoreId} onValueChange={setSelectedStoreId}>
                <SelectTrigger className="rounded-xl border-slate-200 max-w-xs bg-white">
                  <SelectValue placeholder="Choose store context" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-100">
                  {stores.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.storeNameEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        )}

        {/* Products Grid cards with inputs & plus buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((p) => {
            const currentDiscount = discountInputs[p.id] || activeCampaign.minDiscountPercentage;
            let img = "";
            if (p.photo) {
              if (Array.isArray(p.photo) && p.photo.length > 0) {
                img = p.photo[0];
              } else if (typeof p.photo === "string") {
                img = p.photo;
              }
            }

            return (
              <Card
                key={p.id}
                className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="h-32 w-full bg-slate-50 relative border-b">
                    {img ? (
                      <img src={img} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        No Image Available
                      </div>
                    )}
                  </div>
                  <div className="p-4 space-y-2">
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 truncate">{p.name}</h4>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Regular Price:</span>
                      <span className="font-bold text-slate-850">৳ {p.price}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 border-t space-y-3 bg-slate-50/50">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-450 font-bold">Campaign Discount (%)</label>
                    <Input
                      type="number"
                      value={currentDiscount}
                      onChange={(e) =>
                        setDiscountInputs((prev) => ({
                          ...prev,
                          [p.id]: Number(e.target.value),
                        }))
                      }
                      min={activeCampaign.minDiscountPercentage}
                      max={100}
                      className="rounded-xl border-slate-200 bg-white font-bold text-center"
                    />
                  </div>
                  <Button
                    onClick={() => handleEnrollProduct(p.id, p.price)}
                    disabled={loadingProductId === p.id}
                    className="w-full bg-[#1E60ED] hover:bg-blue-600 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 py-4 shadow-sm shadow-blue-500/10"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>{loadingProductId === p.id ? "Adding..." : "Add to Campaign"}</span>
                  </Button>
                </div>
              </Card>
            );
          })}
          {filteredProducts.length === 0 && (
            <div className="col-span-full py-16 text-center border border-dashed rounded-3xl text-slate-400 bg-slate-50/20">
              No eligible products available in this store to add.
            </div>
          )}
        </div>
      </div>
    );
  }

  // SCREEN 2: Campaign Detail Sub-page (Shows Banners & Enrolled Products Cards list)
  if (activeCampaign) {
    const enrolledProducts = activeCampaign.products || [];

    return (
      <div className="space-y-6 text-xs">
        {/* Sub-header */}
        <div className="flex items-center justify-between border-b pb-4 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setActiveCampaign(null)}
              className="rounded-xl border-slate-200"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-white">
                {activeCampaign.name}
              </h2>
              <p className="text-slate-500 mt-0.5">
                {new Date(activeCampaign.startDate).toLocaleDateString()} - {new Date(activeCampaign.endDate).toLocaleDateString()}
              </p>
            </div>
          </div>

          <Button
            onClick={() => setIsAddingProduct(true)}
            className="bg-[#1E60ED] hover:bg-blue-600 text-white rounded-xl font-bold px-6 py-4 flex items-center gap-1.5 shadow-md shadow-blue-500/10 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </Button>
        </div>

        {/* Campaign Banner backdrop */}
        {activeCampaign.banner && (
          <div className="relative h-44 w-full rounded-3xl overflow-hidden shadow-xs border">
            <img src={activeCampaign.banner} alt={activeCampaign.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent flex flex-col justify-center p-6 text-white">
              <span className="bg-blue-500 text-white w-fit px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase mb-2">
                Requirements Applied
              </span>
              <p className="text-xs text-slate-200 mt-1 max-w-lg line-clamp-2">
                {activeCampaign.description || "Link eligible store categories to grab promotional slots."}
              </p>
            </div>
          </div>
        )}

        {/* Enrolled Products Cards List */}
        <div>
          <h3 className="font-bold text-slate-700 mb-4 text-xs uppercase tracking-wider">
            Your Enrolled Products ({enrolledProducts.length})
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {enrolledProducts.map((ep: any) => {
              const p = ep.product;
              if (!p) return null;
              let img = "";
              if (p.photo) {
                if (Array.isArray(p.photo) && p.photo.length > 0) {
                  img = p.photo[0];
                } else if (typeof p.photo === "string") {
                  img = p.photo;
                }
              }

              return (
                <Card
                  key={ep.id}
                  className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    <div className="h-32 w-full bg-slate-50 relative border-b">
                      {img ? (
                        <img src={img} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-350">
                          No Image
                        </div>
                      )}
                      <span
                        className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[8px] font-extrabold uppercase shadow-sm ${
                          ep.status === "Approved"
                            ? "bg-green-500 text-white"
                            : ep.status === "Rejected"
                            ? "bg-red-500 text-white"
                            : "bg-[#1E60ED] text-white"
                        }`}
                      >
                        {ep.status}
                      </span>
                    </div>
                    <div className="p-4 space-y-2">
                      <h4 className="font-bold text-slate-850 dark:text-slate-200 truncate">
                        {p.name}
                      </h4>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-450">Base Price:</span>
                        <span className="font-bold text-slate-700">৳ {p.price}</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-450">Discount Applied:</span>
                        <span className="font-bold text-blue-600">{ep.discountPercentage}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border-t bg-slate-50/50 flex justify-between items-center text-[10px]">
                    <span className="text-slate-400">Promo Price:</span>
                    <span className="font-extrabold text-sm text-[#1E60ED]">
                      ৳ {(p.price - p.price * (ep.discountPercentage / 100)).toFixed(1)}
                    </span>
                  </div>
                </Card>
              );
            })}
            {enrolledProducts.length === 0 && (
              <div className="col-span-full py-16 text-center border border-dashed rounded-3xl text-slate-400 bg-slate-50/20 flex flex-col items-center justify-center">
                <Info className="w-6 h-6 mb-2 text-slate-350" />
                <p className="font-bold">No products have been added to this campaign yet.</p>
                <Button
                  onClick={() => setIsAddingProduct(true)}
                  variant="outline"
                  className="rounded-xl mt-3"
                >
                  Join & Add First Product
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // SCREEN 1: Campaigns list grid
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
      {campaigns.map((camp) => {
        const enrolledCount = camp.products?.length || 0;
        return (
          <Card
            key={camp.id}
            className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden transition-all duration-200 hover:border-slate-200"
          >
            <div className="relative h-32 w-full overflow-hidden bg-slate-50 border-b">
              {camp.banner ? (
                <img src={camp.banner} alt={camp.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300">
                  <Percent className="w-8 h-8" />
                </div>
              )}
              {enrolledCount > 0 && (
                <span className="absolute top-3 right-3 bg-green-500 text-white font-extrabold px-2.5 py-1 rounded-full text-[9px] uppercase flex items-center gap-1 shadow-sm">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Enrolled ({enrolledCount})
                </span>
              )}
            </div>
            <CardContent className="p-5 space-y-3">
              <div>
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">{camp.name}</h3>
                {camp.description && (
                  <p className="text-slate-400 mt-1 line-clamp-2 text-[10px] leading-relaxed">
                    {camp.description}
                  </p>
                )}
              </div>

              <div className="space-y-1 text-[10px] text-slate-500">
                <p className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Timeline: {new Date(camp.startDate).toLocaleDateString()} - {new Date(camp.endDate).toLocaleDateString()}
                </p>
                <p className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-350">
                  <Percent className="w-3.5 h-3.5 text-[#1E60ED]" />
                  Min. Discount: {camp.minDiscountPercentage}% Required
                </p>
              </div>

              <Button
                onClick={() => {
                  setActiveCampaign(camp);
                  setIsAddingProduct(false);
                }}
                className={`w-full rounded-xl py-4 flex items-center justify-center gap-1.5 font-bold ${
                  enrolledCount > 0
                    ? "bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-white"
                    : "bg-[#1E60ED] hover:bg-blue-600 text-white shadow-md shadow-blue-500/10"
                }`}
              >
                <span>{enrolledCount > 0 ? "Manage Enrolled Products" : "Join Campaign"}</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        );
      })}
      {campaigns.length === 0 && (
        <div className="col-span-2 text-center py-12 border border-dashed rounded-3xl text-slate-400">
          No active megacampaigns are available to join at this time.
        </div>
      )}
    </div>
  );
}
