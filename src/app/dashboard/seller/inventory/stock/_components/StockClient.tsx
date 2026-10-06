"use client";

import React, { useState, useTransition } from "react";
import Image from "next/image";
import { Search, Edit2, AlertCircle, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { updateStockInline } from "../../_action";
import { toast } from "sonner";

interface Variant {
  id: string;
  sku: string;
  color: string | null;
  size: string | null;
  price: number;
  mrp: number | null;
  stock: number;
  availability: boolean;
}

interface Product {
  id: string;
  name: string;
  photo: any;
  price: number;
  mrp: number | null;
  stock: number;
  hasVariants: boolean;
  variantsList: Variant[];
}

interface StockClientProps {
  initialProducts: Product[];
}

export default function StockClient({ initialProducts }: StockClientProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK">("ALL");

  // Inline edit state
  const [editingItem, setEditingItem] = useState<{
    productId: string;
    variantId: string | null;
    currentStock: number;
    name: string;
    sku: string;
  } | null>(null);
  const [newStock, setNewStock] = useState<number>(0);
  const [adjustmentNote, setAdjustmentNote] = useState("");
  const [isPending, startTransition] = useTransition();

  // Helper to extract photos
  const getPhotoUrl = (photoField: any) => {
    if (!photoField) return "/img/placeholder.png";
    if (typeof photoField === "string") return photoField;
    if (Array.isArray(photoField) && photoField.length > 0) return photoField[0];
    if (typeof photoField === "object") {
      if (photoField.url) return photoField.url;
      const keys = Object.keys(photoField);
      if (keys.length > 0 && typeof photoField[keys[0]] === "string") {
        return photoField[keys[0]];
      }
    }
    return "/img/placeholder.png";
  };

  // Flatten products and variants for grid viewing
  const flatItems = React.useMemo(() => {
    const list: any[] = [];
    products.forEach((p) => {
      if (p.hasVariants && p.variantsList && p.variantsList.length > 0) {
        p.variantsList.forEach((v) => {
          list.push({
            productId: p.id,
            variantId: v.id,
            name: p.name,
            photo: getPhotoUrl(p.photo),
            sku: v.sku,
            attributes: `${v.color || ""} ${v.size ? `/ ${v.size}` : ""}`.trim() || "N/A",
            price: v.price,
            mrp: v.mrp || p.mrp,
            stock: v.stock,
            hasVariants: true,
          });
        });
      } else {
        list.push({
          productId: p.id,
          variantId: null,
          name: p.name,
          photo: getPhotoUrl(p.photo),
          sku: `${p.id.substring(18, 24).toUpperCase()}`,
          attributes: "Default",
          price: p.price,
          mrp: p.mrp,
          stock: p.stock,
          hasVariants: false,
        });
      }
    });
    return list;
  }, [products]);

  // Compute KPI Counts
  const kpis = React.useMemo(() => {
    let totalStockItems = flatItems.length;
    let outOfStock = flatItems.filter((i) => i.stock === 0).length;
    let lowStock = flatItems.filter((i) => i.stock > 0 && i.stock <= 5).length;
    let inStock = flatItems.filter((i) => i.stock > 5).length;
    return { totalStockItems, outOfStock, lowStock, inStock };
  }, [flatItems]);

  // Filter Items
  const filteredItems = React.useMemo(() => {
    return flatItems.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.sku.toLowerCase().includes(search.toLowerCase());

      if (!matchSearch) return false;

      if (statusFilter === "OUT_OF_STOCK") return item.stock === 0;
      if (statusFilter === "LOW_STOCK") return item.stock > 0 && item.stock <= 5;
      if (statusFilter === "IN_STOCK") return item.stock > 5;
      return true;
    });
  }, [flatItems, search, statusFilter]);

  // Handle Quick Edit Save
  const handleSaveStock = () => {
    if (!editingItem) return;
    if (newStock < 0) {
      toast.error("Stock count cannot be negative");
      return;
    }

    startTransition(async () => {
      const res = await updateStockInline(
        editingItem.productId,
        editingItem.variantId,
        newStock,
        adjustmentNote || "Manual quick update"
      );

      if (res.success) {
        toast.success("Stock updated successfully");
        // Update local state
        setProducts((prev) =>
          prev.map((p) => {
            if (p.id === editingItem.productId) {
              if (editingItem.variantId) {
                const updatedVariants = p.variantsList.map((v) =>
                  v.id === editingItem.variantId ? { ...v, stock: newStock } : v
                );
                const newTotal = updatedVariants.reduce((sum, v) => sum + v.stock, 0);
                return { ...p, variantsList: updatedVariants, stock: newTotal };
              } else {
                return { ...p, stock: newStock };
              }
            }
            return p;
          })
        );
        setEditingItem(null);
        setAdjustmentNote("");
      } else {
        toast.error(res.error || "Failed to update stock");
      }
    });
  };

  return (
    <div className="w-full space-y-6">
      {/* ── KPI Stat Cards (Matching Sidebar Guidelines) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total SKU items */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total SKU Items</p>
          <h3 className="text-3xl font-bold text-slate-800 dark:text-white mt-2">{kpis.totalStockItems}</h3>
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full mt-3">
            ↗ Active
          </span>
        </div>

        {/* Card 2: In Stock */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Adequate Stock</p>
          <h3 className="text-3xl font-bold text-slate-800 dark:text-white mt-2">{kpis.inStock}</h3>
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full mt-3">
            <CheckCircle className="w-3 h-3" /> Healthy Level
          </span>
        </div>

        {/* Card 3: Low Stock */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Low Stock (≤ 5)</p>
          <h3 className="text-3xl font-bold text-slate-800 dark:text-white mt-2">{kpis.lowStock}</h3>
          <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full mt-3 ${
            kpis.lowStock > 0 
              ? "text-amber-600 bg-amber-50 dark:bg-amber-950/30" 
              : "text-slate-400 bg-slate-50 dark:bg-slate-700"
          }`}>
            <AlertCircle className="w-3 h-3" /> Needs Refill
          </span>
        </div>

        {/* Card 4: Out of Stock */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Out of Stock</p>
          <h3 className="text-3xl font-bold text-slate-800 dark:text-white mt-2">{kpis.outOfStock}</h3>
          <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full mt-3 ${
            kpis.outOfStock > 0 
              ? "text-rose-600 bg-rose-50 dark:bg-rose-950/30 animate-pulse" 
              : "text-slate-400 bg-slate-50 dark:bg-slate-700"
          }`}>
            <XCircle className="w-3 h-3" /> Critical Attention
          </span>
        </div>
      </div>

      {/* ── Search & Filter Options (Royal Blue Active States) ── */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-450" />
          <input
            type="text"
            placeholder="Search by Name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E60ED] focus:border-[#1E60ED] transition"
          />
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {(["ALL", "IN_STOCK", "LOW_STOCK", "OUT_OF_STOCK"] as const).map((filter) => {
            const labels = {
              ALL: "All SKUs",
              IN_STOCK: "Adequate Stock",
              LOW_STOCK: "Low Stock",
              OUT_OF_STOCK: "Out of Stock",
            };
            const active = statusFilter === filter;
            return (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer select-none ${
                  active
                    ? "bg-[#1E60ED] text-white shadow-sm"
                    : "bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                }`}
              >
                {labels[filter]}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Inventory List Table ── */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-700">
                <th className="py-4 px-6">Product</th>
                <th className="py-4 px-6">SKU Code</th>
                <th className="py-4 px-6">Variant Info</th>
                <th className="py-4 px-6 text-right">Price</th>
                <th className="py-4 px-6 text-center">Available Stock</th>
                <th className="py-4 px-6 text-center">Status</th>
                <th className="py-4 px-6 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-sm text-slate-700 dark:text-slate-200">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                    No matching stock items found.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item, idx) => {
                  let statusLabel = "In Stock";
                  let statusClass = "text-emerald-700 bg-emerald-50 dark:bg-emerald-950/20";
                  if (item.stock === 0) {
                    statusLabel = "Out of Stock";
                    statusClass = "text-rose-700 bg-rose-50 dark:bg-rose-950/20";
                  } else if (item.stock <= 5) {
                    statusLabel = "Low Stock";
                    statusClass = "text-amber-700 bg-amber-50 dark:bg-amber-950/20";
                  }

                  return (
                    <tr key={`${item.productId}-${item.variantId || idx}`} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                      {/* Product Thumbnail & Name */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 relative rounded-lg border overflow-hidden bg-slate-50 shrink-0">
                            <Image
                              src={item.photo}
                              alt=""
                              fill
                              className="object-cover"
                            />
                          </div>
                          <span className="font-bold text-slate-800 dark:text-white line-clamp-2">{item.name}</span>
                        </div>
                      </td>

                      {/* SKU */}
                      <td className="py-4 px-6 font-mono text-xs font-semibold tracking-wide text-slate-500 dark:text-slate-400">
                        {item.sku}
                      </td>

                      {/* Attribute attributes */}
                      <td className="py-4 px-6">
                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                          item.attributes === "Default"
                            ? "bg-slate-100 dark:bg-slate-900 text-slate-500"
                            : "bg-blue-50 dark:bg-blue-950/30 text-[#1E60ED]"
                        }`}>
                          {item.attributes}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-4 px-6 text-right font-semibold">
                        ৳{item.price.toFixed(2)}
                      </td>

                      {/* Available Qty */}
                      <td className="py-4 px-6 text-center font-bold text-slate-800 dark:text-white">
                        {item.stock}
                      </td>

                      {/* Status Badges */}
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${statusClass}`}>
                          {statusLabel}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => {
                            setEditingItem({
                              productId: item.productId,
                              variantId: item.variantId,
                              currentStock: item.stock,
                              name: item.name,
                              sku: item.sku,
                            });
                            setNewStock(item.stock);
                          }}
                          className="inline-flex items-center justify-center p-2 rounded-lg bg-slate-100 hover:bg-[#1E60ED] hover:text-white text-slate-600 dark:bg-slate-900 dark:text-slate-350 dark:hover:text-white transition cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Quick Edit Dialog Modal ── */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl border border-slate-100 dark:border-slate-700 shadow-2xl overflow-hidden p-6 space-y-5 animate-scale-up">
            <div>
              <h4 className="text-base font-bold text-slate-950 dark:text-white">Quick Stock Update</h4>
              <p className="text-xs text-slate-400 mt-1 truncate">{editingItem.name}</p>
              <p className="text-[11px] font-mono text-slate-400 mt-0.5">SKU: {editingItem.sku}</p>
            </div>

            <div className="space-y-4">
              {/* Stock Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Available Stock Quantity</label>
                <input
                  type="number"
                  min="0"
                  value={newStock}
                  onChange={(e) => setNewStock(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E60ED] transition font-bold"
                />
              </div>

              {/* Adjustment Note */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Adjustment Note / Reason</label>
                <input
                  type="text"
                  placeholder="e.g. Weekly restocking, Damage adjustment"
                  value={adjustmentNote}
                  onChange={(e) => setAdjustmentNote(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E60ED] transition"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-2">
              <button
                disabled={isPending}
                onClick={() => {
                  setEditingItem(null);
                  setAdjustmentNote("");
                }}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={isPending}
                onClick={handleSaveStock}
                className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold bg-[#1E60ED] hover:bg-blue-600 text-white rounded-xl shadow-sm transition disabled:opacity-50 cursor-pointer"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" /> Saving...
                  </>
                ) : (
                  "Save Stock"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
