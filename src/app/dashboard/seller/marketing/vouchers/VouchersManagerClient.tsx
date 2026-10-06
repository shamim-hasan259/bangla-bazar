"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Award, Plus, Trash2, Calendar, ShoppingBag, Settings2 } from "lucide-react";
import { toast } from "sonner";
import { createVoucher, deleteVoucher } from "../_action";
import { useRouter } from "next/navigation";

interface VouchersManagerClientProps {
  vouchers: any[];
  stores: any[];
  products: any[];
  categories: any[];
  sellerId: string;
}

export default function VouchersManagerClient({
  vouchers,
  stores,
  products,
  categories,
  sellerId,
}: VouchersManagerClientProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState("Percentage");
  const [discountValue, setDiscountValue] = useState(10);
  const [minOrder, setMinOrder] = useState(500);
  const [maxDiscount, setMaxDiscount] = useState<number | "">("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [usageLimit, setUsageLimit] = useState(100);
  const [selectedStoreId, setSelectedStoreId] = useState("");
  const [applicableProductIds, setApplicableProductIds] = useState<string[]>([]);
  const [applicableCategoryIds, setApplicableCategoryIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code || !startDate || !endDate) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);
      const res = await createVoucher({
        name,
        code,
        discountType,
        discountValue,
        minOrderAmount: minOrder,
        maxDiscountAmount: maxDiscount === "" ? undefined : maxDiscount,
        startDate,
        endDate,
        usageLimit,
        perCustomerLimit: 1,
        applicableProductIds,
        applicableCategoryIds,
        storeId: selectedStoreId && selectedStoreId !== "all-stores" ? selectedStoreId : undefined,
        sellerId,
      });

      if (res.success) {
        toast.success("Voucher created successfully!");
        setName("");
        setCode("");
        setDiscountType("Percentage");
        setDiscountValue(10);
        setMinOrder(500);
        setMaxDiscount("");
        setStartDate("");
        setEndDate("");
        setUsageLimit(100);
        setSelectedStoreId("");
        setApplicableProductIds([]);
        setApplicableCategoryIds([]);
        router.refresh();
      } else {
        toast.error(res.error || "Failed to create voucher");
      }
    } catch {
      toast.error("An error occurred during voucher creation");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this voucher?")) return;
    try {
      const res = await deleteVoucher(id);
      if (res.success) {
        toast.success("Voucher deleted");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to delete voucher");
      }
    } catch {
      toast.error("Error deleting voucher");
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
              Create Custom Voucher
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-650 dark:text-slate-350">Voucher Name *</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Eid Bonanza 100, New Customer Promo"
                  className="rounded-xl border-slate-200"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-650 dark:text-slate-350">Promo Code *</label>
                <Input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. EID100, BG50"
                  className="rounded-xl border-slate-200 font-mono font-bold uppercase"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-650 dark:text-slate-350">Discount Type</label>
                  <Select value={discountType} onValueChange={setDiscountType}>
                    <SelectTrigger className="rounded-xl border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-100">
                      <SelectItem value="Percentage">Percentage (%)</SelectItem>
                      <SelectItem value="Fixed">Fixed Amount (৳)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-650 dark:text-slate-350">Discount Value *</label>
                  <Input
                    type="number"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    min={1}
                    className="rounded-xl border-slate-200 font-bold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-650 dark:text-slate-350">Min Order Total (৳)</label>
                  <Input
                    type="number"
                    value={minOrder}
                    onChange={(e) => setMinOrder(Number(e.target.value))}
                    min={0}
                    className="rounded-xl border-slate-200"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-650 dark:text-slate-350">Max Discount (৳)</label>
                  <Input
                    type="number"
                    value={maxDiscount}
                    onChange={(e) => setMaxDiscount(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="e.g. 200 (Optional)"
                    className="rounded-xl border-slate-200"
                  />
                </div>
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

              <div className="space-y-1.5">
                <label className="font-bold text-slate-650 dark:text-slate-350">Usage Limit (Times)</label>
                <Input
                  type="number"
                  value={usageLimit}
                  onChange={(e) => setUsageLimit(Number(e.target.value))}
                  min={1}
                  className="rounded-xl border-slate-200"
                  required
                />
              </div>

              {stores.length > 0 && (
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-650 dark:text-slate-350">Link to Store</label>
                  <Select value={selectedStoreId} onValueChange={setSelectedStoreId}>
                    <SelectTrigger className="rounded-xl border-slate-200">
                      <SelectValue placeholder="All stores / seller context" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-100">
                      <SelectItem value="all-stores">Universal Seller Scope</SelectItem>
                      {stores.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.storeNameEn}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#1E60ED] hover:bg-blue-600 text-white font-bold py-5 mt-2"
              >
                {loading ? "Creating..." : "Save Voucher"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Vouchers Table */}
      <div className="xl:col-span-2 space-y-6">
        <Card className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <CardHeader className="border-b pb-4">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Award className="w-4 h-4 text-[#1E60ED]" />
              Active storefront vouchers ({vouchers.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {vouchers.map((v) => (
                <div
                  key={v.id}
                  className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 flex flex-col md:flex-row justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded border border-blue-200">
                        {v.code}
                      </span>
                      <h4 className="font-bold text-slate-800 dark:text-slate-200">{v.name}</h4>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1 text-[10px] text-slate-500">
                      <p className="flex items-center gap-1">
                        <ShoppingBag className="w-3.5 h-3.5" />
                        Min Order: ৳ {v.minOrderAmount}
                      </p>
                      <p className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-350">
                        <Award className="w-3.5 h-3.5" />
                        Value: {v.discountType === "Percentage" ? `${v.discountValue}%` : `৳ ${v.discountValue}`}
                      </p>
                      <p className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        Ends: {new Date(v.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-3 md:pt-0">
                    <div className="flex gap-4 text-center shrink-0">
                      <div>
                        <p className="text-[10px] text-slate-400 font-extrabold uppercase">Collected</p>
                        <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{v.collectedCount}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-extrabold uppercase">Used</p>
                        <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{v.usedCount}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-extrabold uppercase">Limit</p>
                        <p className="font-bold text-slate-850 dark:text-slate-300 mt-0.5">{v.usageLimit}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(v.id)}
                      className="text-red-500 hover:bg-red-50 rounded-xl"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {!vouchers.length && (
                <div className="text-center py-12 text-slate-400">No active storefront vouchers created.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
