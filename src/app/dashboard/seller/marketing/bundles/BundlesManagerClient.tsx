"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Layers, Plus, Trash2, Search, Check, AlertCircle, Package } from "lucide-react";
import { toast } from "sonner";
import { createProductBundle, deleteBundle } from "../_action";
import { useRouter } from "next/navigation";

interface BundlesManagerClientProps {
  bundles: any[];
  stores: any[];
  products: any[];
  sellerId: string;
}

export default function BundlesManagerClient({
  bundles,
  stores,
  products,
  sellerId,
}: BundlesManagerClientProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [discountValue, setDiscountValue] = useState<number>(50);
  const [selectedStoreId, setSelectedStoreId] = useState<string>("all");
  const [productSearch, setProductSearch] = useState("");
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Filter products by selected store and search term
  const filteredProducts = products.filter((prod) => {
    // Store filter
    if (selectedStoreId && selectedStoreId !== "all") {
      if (prod.storeId && prod.storeId !== selectedStoreId) {
        return false;
      }
    }
    // Search query filter
    if (productSearch.trim()) {
      const q = productSearch.toLowerCase();
      if (!prod.name?.toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  const handleProductToggle = (id: string) => {
    setSelectedProductIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      } else {
        if (prev.length >= 5) {
          toast.error("You can select a maximum of 5 products for a bundle");
          return prev;
        }
        return [...prev, id];
      }
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter a bundle name");
      return;
    }
    if (selectedProductIds.length < 2) {
      toast.error("Please select at least 2 products for the bundle");
      return;
    }

    try {
      setLoading(true);
      const res = await createProductBundle({
        name: name.trim(),
        description: description.trim() || undefined,
        discountValue: Number(discountValue) || 0,
        productIds: selectedProductIds,
        storeId: selectedStoreId && selectedStoreId !== "all" ? selectedStoreId : undefined,
        sellerId,
      });

      if (res.success) {
        toast.success("Product bundle created successfully!");
        setName("");
        setDescription("");
        setDiscountValue(50);
        setSelectedProductIds([]);
        setProductSearch("");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to create bundle");
      }
    } catch {
      toast.error("An error occurred during bundle creation");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this bundle?")) return;
    try {
      const res = await deleteBundle(id);
      if (res.success) {
        toast.success("Bundle deleted successfully");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to delete bundle");
      }
    } catch {
      toast.error("Error deleting bundle");
    }
  };

  // Calculate prices for the selected products
  const selectedProductsList = products.filter((p) => selectedProductIds.includes(p.id));
  const baseTotal = selectedProductsList.reduce((sum, p) => sum + (p.price || 0), 0);
  const bundleTotal = Math.max(0, baseTotal - (discountValue || 0));

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 text-xs">
      {/* Create Form */}
      <div className="xl:col-span-1">
        <Card className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <CardHeader className="border-b pb-4">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-800 dark:text-slate-100">
              <Plus className="w-4 h-4 text-[#1E60ED]" />
              Create Product Bundle
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">Bundle Name *</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Winter Clothes Combo, Mobile + Adapter"
                  className="rounded-xl border-slate-200"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">Description</label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Buy together and save ৳50!"
                  className="rounded-xl border-slate-200"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">Fixed Discount (৳) *</label>
                <Input
                  type="number"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(Number(e.target.value))}
                  min={1}
                  className="rounded-xl border-slate-200 font-bold"
                  required
                />
              </div>

              {stores.length > 0 && (
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Link to Store</label>
                  <Select value={selectedStoreId} onValueChange={setSelectedStoreId}>
                    <SelectTrigger className="rounded-xl border-slate-200 bg-white dark:bg-slate-950">
                      <SelectValue placeholder="All stores" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-100">
                      <SelectItem value="all">All Stores ({products.length} Products)</SelectItem>
                      {stores.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.storeNameEn || s.storeNameBn}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Product Selection List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Select Products (2 to 5) *
                  </label>
                  <span className="text-[11px] font-bold text-[#1E60ED] bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-full">
                    {selectedProductIds.length} / 5 selected
                  </span>
                </div>

                {/* Search Bar for products */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search product by name..."
                    className="pl-8 h-8 text-xs rounded-xl border-slate-200 bg-slate-50/50 dark:bg-slate-950"
                  />
                </div>

                <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-2 max-h-[180px] overflow-y-auto space-y-1.5 bg-slate-50/30">
                  {filteredProducts.map((p) => {
                    const isSelected = selectedProductIds.includes(p.id);
                    let imgUrl = "";
                    if (p.photo) {
                      if (Array.isArray(p.photo) && p.photo.length > 0) {
                        imgUrl = p.photo[0];
                      } else if (typeof p.photo === "string") {
                        imgUrl = p.photo;
                      }
                    }

                    return (
                      <div
                        key={p.id}
                        onClick={() => handleProductToggle(p.id)}
                        className={`flex items-center gap-2.5 p-2 rounded-lg cursor-pointer transition-all ${
                          isSelected
                            ? "bg-blue-50/80 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900 shadow-2xs"
                            : "hover:bg-white dark:hover:bg-slate-800/60 border border-transparent"
                        }`}
                      >
                        <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border ${
                          isSelected ? "bg-[#1E60ED] border-[#1E60ED] text-white" : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                        }`}>
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>

                        {imgUrl ? (
                          <img src={imgUrl} alt={p.name} className="w-7 h-7 rounded-md object-cover border shrink-0" />
                        ) : (
                          <div className="w-7 h-7 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-[9px] text-slate-400">
                            <Package className="w-3.5 h-3.5" />
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-800 dark:text-slate-200 truncate text-[11px] leading-tight">
                            {p.name}
                          </p>
                          <p className="text-[10px] text-slate-400 font-medium">৳ {p.price}</p>
                        </div>
                      </div>
                    );
                  })}

                  {filteredProducts.length === 0 && (
                    <div className="py-6 text-center text-slate-400 flex flex-col items-center justify-center">
                      <AlertCircle className="w-5 h-5 mb-1 text-slate-300" />
                      <p className="text-[11px]">No active products found.</p>
                      {productSearch && (
                        <button
                          type="button"
                          onClick={() => setProductSearch("")}
                          className="text-[10px] text-[#1E60ED] underline mt-1"
                        >
                          Clear search filter
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Pricing Summary */}
              {selectedProductIds.length >= 2 && (
                <div className="p-3.5 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 rounded-2xl space-y-1.5 animate-in fade-in">
                  <div className="flex justify-between text-slate-500">
                    <span>Products selected:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {selectedProductIds.length} items
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Original Price Total:</span>
                    <span className="line-through">৳ {baseTotal.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Fixed Discount:</span>
                    <span className="font-bold text-emerald-600">- ৳ {discountValue || 0}</span>
                  </div>
                  <div className="flex justify-between font-bold text-xs pt-1 border-t border-blue-100 dark:border-blue-900">
                    <span className="text-slate-800 dark:text-slate-100">Bundle Price:</span>
                    <span className="text-[#1E60ED] text-sm">৳ {bundleTotal.toFixed(0)}</span>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading || selectedProductIds.length < 2 || !name.trim()}
                className="w-full rounded-xl bg-[#1E60ED] hover:bg-blue-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-5 mt-2 transition-all shadow-sm"
              >
                {loading ? "Creating Bundle..." : "Save Product Bundle"}
              </Button>

              {selectedProductIds.length < 2 && (
                <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium text-center">
                  * Select at least 2 products to enable the bundle save button.
                </p>
              )}
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Bundles List */}
      <div className="xl:col-span-2 space-y-6">
        <Card className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <CardHeader className="border-b pb-4">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-800 dark:text-slate-100">
              <Layers className="w-4 h-4 text-[#1E60ED]" />
              Active product bundles ({bundles.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {bundles.map((b) => {
                // Find products in this bundle
                const bundleProducts = products.filter((p) => b.productIds?.includes(p.id));
                const regularPrice = bundleProducts.reduce((sum, p) => sum + (p.price || 0), 0);
                const finalBundlePrice = Math.max(0, regularPrice - (b.discountValue || 0));

                return (
                  <div
                    key={b.id}
                    className="p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 flex flex-col md:flex-row justify-between gap-4 transition-all hover:border-slate-200"
                  >
                    <div className="space-y-3 flex-1 min-w-0">
                      <div>
                        <h4 className="font-bold text-slate-850 dark:text-slate-100 text-sm">{b.name}</h4>
                        {b.description && (
                          <p className="text-slate-500 italic mt-0.5 text-xs">{b.description}</p>
                        )}
                      </div>

                      {/* Display items */}
                      <div className="space-y-1.5">
                        <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
                          Grouped Products ({bundleProducts.length}):
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {bundleProducts.map((p) => {
                            let pImg = "";
                            if (p.photo) {
                              if (Array.isArray(p.photo) && p.photo.length > 0) pImg = p.photo[0];
                              else if (typeof p.photo === "string") pImg = p.photo;
                            }

                            return (
                              <div key={p.id} className="flex items-center gap-2 bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                                {pImg ? (
                                  <img src={pImg} alt={p.name} className="w-8 h-8 rounded-lg object-cover border shrink-0" />
                                ) : (
                                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-[10px] text-slate-400">
                                    <Package className="w-4 h-4" />
                                  </div>
                                )}
                                <div className="min-w-0 flex-1">
                                  <p className="text-slate-700 dark:text-slate-300 font-semibold text-[11px] truncate">
                                    {p.name}
                                  </p>
                                  <p className="text-[10px] text-slate-400 font-bold">৳ {p.price}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-3 md:pt-0 shrink-0">
                      <div className="space-y-1.5 text-right">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Bundle Pricing</p>
                        <div className="flex items-center gap-2 justify-end">
                          <span className="line-through text-slate-400 text-xs">
                            ৳ {regularPrice}
                          </span>
                          <span className="font-extrabold text-[#1E60ED] text-base">
                            ৳ {finalBundlePrice}
                          </span>
                        </div>
                        <span className="inline-block bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full font-bold text-[10px] border border-emerald-200">
                          Save ৳ {b.discountValue}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(b.id)}
                        className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}

              {!bundles.length && (
                <div className="text-center py-16 border border-dashed rounded-3xl text-slate-400 bg-slate-50/20 flex flex-col items-center justify-center">
                  <Layers className="w-8 h-8 mb-2 text-slate-300 stroke-[1.5]" />
                  <p className="font-bold text-xs">No product bundles created yet.</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Use the form on the left to create your first combo bundle.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
