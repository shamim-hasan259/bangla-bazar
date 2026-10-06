"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Percent, Plus, ArrowLeft, CheckCircle2, ChevronRight, Info, PlusCircle, Store, Bolt } from "lucide-react";
import { toast } from "sonner";
import { submitFlashSaleProduct } from "../_action";
import { useRouter } from "next/navigation";

interface FlashSalesEnrollmentClientProps {
  flashSales: any[];
  stores: any[];
  products: any[];
  sellerId: string;
}

export default function FlashSalesEnrollmentClient({
  flashSales,
  stores,
  products,
  sellerId,
}: FlashSalesEnrollmentClientProps) {
  const router = useRouter();
  const [activeSlot, setActiveSlot] = useState<any | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [selectedStoreId, setSelectedStoreId] = useState<string>("all");
  
  // Track input fields dynamically per product ID
  const [discountInputs, setDiscountInputs] = useState<{ [key: string]: number }>({});
  const [stockInputs, setStockInputs] = useState<{ [key: string]: number }>({});
  const [limitInputs, setLimitInputs] = useState<{ [key: string]: number }>({});
  const [loadingProductId, setLoadingProductId] = useState<string | null>(null);

  // Filter products by selected store context and flash sale enrollment constraints
  const filteredProducts = products.filter((prod) => {
    if (selectedStoreId && selectedStoreId !== "all" && prod.storeId && prod.storeId !== selectedStoreId) {
      return false;
    }
    // Filter out products already enrolled in the active flash sale
    const isEnrolled = activeSlot?.products?.some((p: any) => p.productId === prod.id);
    if (isEnrolled) return false;

    return true;
  });

  const handleEnrollProduct = async (productId: string, regularPrice: number, availableStock: number) => {
    if (!activeSlot) return;

    const discountPercentage = discountInputs[productId] || activeSlot.minDiscountPercentage;
    const flashSaleStock = stockInputs[productId] ?? Math.min(5, Math.max(1, availableStock));
    const purchaseLimit = limitInputs[productId] || 1;

    if (discountPercentage < activeSlot.minDiscountPercentage) {
      toast.error(`Minimum discount is ${activeSlot.minDiscountPercentage}%`);
      return;
    }

    if (availableStock < flashSaleStock) {
      toast.error(`Available product stock is only ${availableStock}`);
      return;
    }

    try {
      setLoadingProductId(productId);
      const res = await submitFlashSaleProduct({
        flashSaleId: activeSlot.id,
        productId,
        storeId: selectedStoreId && selectedStoreId !== "all" ? selectedStoreId : undefined,
        sellerId,
        discountPercentage,
        flashSaleStock,
        purchaseLimit,
      });

      if (res.success) {
        toast.success("Product enrolled in Flash Sale successfully. Awaiting approval!");
        
        // Optimistic state updates
        const targetProduct = products.find(p => p.id === productId);
        const updatedActiveSlot = {
          ...activeSlot,
          products: [
            ...(activeSlot.products || []),
            {
              id: res.flashProduct?.id,
              productId,
              discountPercentage,
              flashSaleStock,
              purchaseLimit,
              status: "Approved", // Flash sales default approved, or follows backend
              product: targetProduct
            }
          ]
        };

        setActiveSlot(updatedActiveSlot);
        
        // Clear temp inputs
        setDiscountInputs(prev => {
          const u = { ...prev };
          delete u[productId];
          return u;
        });
        setStockInputs(prev => {
          const u = { ...prev };
          delete u[productId];
          return u;
        });
        setLimitInputs(prev => {
          const u = { ...prev };
          delete u[productId];
          return u;
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

  // SCREEN 3: Add Product View (Select Store + Products Grid)
  if (activeSlot && isAddingProduct) {
    return (
      <div className="space-y-6 text-xs font-semibold">
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
                Add Products to {activeSlot.name}
              </h2>
              <p className="text-slate-500 mt-0.5">
                Minimum required discount: {activeSlot.minDiscountPercentage}%
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
                  <SelectItem value="all">All Stores & Products ({products.length})</SelectItem>
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

        {/* Products Grid cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((p) => {
            const currentDiscount = discountInputs[p.id] || activeSlot.minDiscountPercentage;
            const currentStock = stockInputs[p.id] ?? Math.min(5, Math.max(1, p.stock));
            const currentLimit = limitInputs[p.id] || 1;
            
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
                      <div className="w-full h-full flex items-center justify-center text-slate-355">
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
                    <div className="flex justify-between text-slate-400">
                      <span>Available Stock:</span>
                      <span>{p.stock} units</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 border-t space-y-3 bg-slate-50/50">
                  
                  {/* Inputs */}
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-450 font-bold block">Discount Percentage (%)</label>
                      <Input
                        type="number"
                        value={currentDiscount}
                        onChange={(e) =>
                          setDiscountInputs((prev) => ({
                            ...prev,
                            [p.id]: Number(e.target.value),
                          }))
                        }
                        min={activeSlot.minDiscountPercentage}
                        max={100}
                        className="rounded-xl border-slate-200 bg-white font-bold text-center h-8"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-450 font-bold block">Flash Stock</label>
                        <Input
                          type="number"
                          value={currentStock}
                          onChange={(e) =>
                            setStockInputs((prev) => ({
                              ...prev,
                              [p.id]: Number(e.target.value),
                            }))
                          }
                          min={1}
                          max={p.stock}
                          className="rounded-xl border-slate-200 bg-white font-bold text-center h-8"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-450 font-bold block">Order Limit</label>
                        <Input
                          type="number"
                          value={currentLimit}
                          onChange={(e) =>
                            setLimitInputs((prev) => ({
                              ...prev,
                              [p.id]: Number(e.target.value),
                            }))
                          }
                          min={1}
                          className="rounded-xl border-slate-200 bg-white font-bold text-center h-8"
                        />
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleEnrollProduct(p.id, p.price, p.stock)}
                    disabled={loadingProductId === p.id}
                    className="w-full bg-[#1E60ED] hover:bg-blue-600 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 py-4 shadow-sm shadow-blue-500/10"
                  >
                    <PlusCircle className="w-4 h-4 text-white" />
                    <span>{loadingProductId === p.id ? "Adding..." : "Add to Flash"}</span>
                  </Button>
                </div>
              </Card>
            );
          })}
          {filteredProducts.length === 0 && (
            <div className="col-span-full py-16 text-center border border-dashed rounded-3xl text-slate-400 bg-slate-50/20">
              No eligible products available in this store to add to the Flash Sale.
            </div>
          )}
        </div>
      </div>
    );
  }

  // SCREEN 2: Flash Sale Slot Detail View (Shows Enrolled Products Cards list)
  if (activeSlot) {
    const enrolledProducts = activeSlot.products || [];

    return (
      <div className="space-y-6 text-xs font-semibold">
        {/* Header toolbar */}
        <div className="flex items-center justify-between border-b pb-4 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setActiveSlot(null)}
              className="rounded-xl border-slate-200"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-white">
                {activeSlot.name}
              </h2>
              <p className="text-slate-500 mt-0.5">
                {new Date(activeSlot.startDate).toLocaleString()} - {new Date(activeSlot.endDate).toLocaleString()}
              </p>
            </div>
          </div>

          <Button
            onClick={() => setIsAddingProduct(true)}
            className="bg-[#1E60ED] hover:bg-blue-600 text-white rounded-xl font-bold px-6 py-4 flex items-center gap-1.5 shadow-md shadow-blue-500/10 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>Add Product</span>
          </Button>
        </div>

        {/* Banner backdrop */}
        {activeSlot.banner && (
          <div className="relative h-44 w-full rounded-3xl overflow-hidden shadow-xs border">
            <img src={activeSlot.banner} alt={activeSlot.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent flex flex-col justify-center p-6 text-white">
              <span className="bg-amber-500 text-white w-fit px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase mb-2 flex items-center gap-1">
                <Bolt className="w-3.5 h-3.5 fill-white text-white" /> Live Slot Constraints
              </span>
              <p className="text-xs text-slate-200 mt-1 max-w-lg">
                Must maintain minimum of {activeSlot.minDiscountPercentage}% discount. Custom stocks pools will be allocated specifically for this flash duration.
              </p>
            </div>
          </div>
        )}

        {/* Enrolled products cards */}
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
                        className={`absolute top-2 right-2 px-2.5 py-0.5 rounded-full text-[8px] font-extrabold uppercase shadow-sm ${
                          ep.status === "Approved"
                            ? "bg-green-550 text-white"
                            : ep.status === "Rejected"
                            ? "bg-red-500 text-white"
                            : "bg-[#1E60ED] text-white"
                        }`}
                      >
                        {ep.status || "Approved"}
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
                        <span className="font-bold text-[#1E60ED]">{ep.discountPercentage}%</span>
                      </div>
                      <div className="text-[10px] text-slate-400 space-y-0.5 border-t pt-2 mt-2">
                        <p>Flash Stock: <span className="font-bold text-slate-700">{ep.flashSaleStock} units</span></p>
                        <p>Limit / Transaction: <span className="font-bold text-slate-700">{ep.purchaseLimit} units</span></p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border-t bg-slate-50/50 flex justify-between items-center text-[10px]">
                    <span className="text-slate-400">Flash Price:</span>
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
                <p className="font-bold">No products have been added to this slot yet.</p>
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

  // SCREEN 1: Flash Sale Slots Cards Grid
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-semibold">
      {flashSales.map((fs) => {
        const enrolledCount = fs.products?.length || 0;
        return (
          <Card
            key={fs.id}
            className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden transition-all duration-200 hover:border-slate-200"
          >
            <div className="relative h-32 w-full overflow-hidden bg-slate-50 border-b">
              {fs.banner ? (
                <img src={fs.banner} alt={fs.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-350">
                  <Bolt className="w-8 h-8 text-amber-500 fill-amber-500" />
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
                <h3 className="font-bold text-sm text-slate-850 dark:text-slate-200">{fs.name}</h3>
                <p className="text-slate-400 mt-1 text-[10px]">
                  Lightning Slot Event
                </p>
              </div>

              <div className="space-y-1 text-[10px] text-slate-500">
                <p className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Timeline: {new Date(fs.startDate).toLocaleString()} - {new Date(fs.endDate).toLocaleString()}
                </p>
                <p className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-350">
                  <Percent className="w-3.5 h-3.5 text-amber-550" />
                  Min. Discount: {fs.minDiscountPercentage}% Required
                </p>
              </div>

              <Button
                onClick={() => {
                  setActiveSlot(fs);
                  setIsAddingProduct(false);
                }}
                className={`w-full rounded-xl py-4 flex items-center justify-center gap-1.5 font-bold ${
                  enrolledCount > 0
                    ? "bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-white"
                    : "bg-[#1E60ED] hover:bg-blue-600 text-white shadow-md shadow-blue-500/10"
                }`}
              >
                <span>{enrolledCount > 0 ? "Manage Enrolled Products" : "Join Flash Slot"}</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        );
      })}
      {flashSales.length === 0 && (
        <div className="col-span-2 text-center py-12 border border-dashed rounded-3xl text-slate-400">
          No active flash sales slots are available to join at this time.
        </div>
      )}
    </div>
  );
}
