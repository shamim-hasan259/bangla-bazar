"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { createCampaignByCategory, clearCampaign } from "./_action";
import { Toaster } from "@/components/ui/sonner";

export default function CampaignManager({ categories, activeProducts }: { categories: any[], activeProducts: any[] }) {
  const [categoryId, setCategoryId] = useState("");
  const [discount, setDiscount] = useState(10);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId || !discount || !startDate || !endDate) {
      toast.error("Please fill all fields.");
      return;
    }

    setLoading(true);
    const res = await createCampaignByCategory(categoryId, discount, new Date(startDate), new Date(endDate));
    setLoading(false);

    if (res.success) {
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  };

  const handleClear = async (id: string) => {
    const res = await clearCampaign(id);
    if (res.success) toast.success("Removed from campaign");
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Create Campaign Form */}
      <div className="p-6 border rounded-lg bg-white dark:bg-slate-900 shadow-sm">
        <h2 className="text-xl font-bold mb-4">Create Flash Sale (By Category)</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Select Category</label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Discount Percentage (%)</label>
            <Input type="number" value={discount} onChange={e => setDiscount(Number(e.target.value))} min={1} max={99} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Start Date</label>
              <Input type="datetime-local" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">End Date</label>
              <Input type="datetime-local" value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-[#1E60ED] hover:bg-[#164ec2] text-white">
            {loading ? "Applying..." : "Launch Campaign"}
          </Button>
        </form>
      </div>

      {/* Active Campaign Products */}
      <div className="p-6 border rounded-lg bg-white dark:bg-slate-900 shadow-sm max-h-[600px] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Products on Flash Sale ({activeProducts.length})</h2>
        <div className="space-y-3">
          {activeProducts.map(p => (
            <div key={p.id} className="flex justify-between items-center p-3 border rounded">
              <div>
                <p className="font-semibold text-sm">{p.name}</p>
                <p className="text-xs text-gray-500">
                  <span className="line-through">৳{p.price}</span> <span className="text-red-500 font-bold ml-1">৳{p.promoPrice}</span>
                </p>
                <p className="text-[10px] text-gray-400 mt-1">
                  Ends: {new Date(p.promoEnd).toLocaleString()}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => handleClear(p.id)} className="text-red-500 border-red-200 hover:bg-red-50">
                Remove
              </Button>
            </div>
          ))}
          {activeProducts.length === 0 && <p className="text-sm text-gray-500">No active promotional products.</p>}
        </div>
      </div>
      <Toaster />
    </div>
  );
}
