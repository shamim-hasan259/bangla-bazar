"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { searchOrder } from "./_action";
import { Package, Truck, CheckCircle2, XCircle } from "lucide-react";

export default function TrackingForm() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;

    setLoading(true);
    setError("");
    setResult(null);

    const res = await searchOrder(query);
    setLoading(false);

    if (res?.success) {
      setResult(res.order);
    } else {
      setError(res?.message || "Order not found");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "processing": return <Package className="w-12 h-12 text-blue-500" />;
      case "readytoship": return <Package className="w-12 h-12 text-indigo-500" />;
      case "shipped": return <Truck className="w-12 h-12 text-yellow-500" />;
      case "delivered": return <CheckCircle2 className="w-12 h-12 text-green-500" />;
      case "return":
      case "canceled": return <XCircle className="w-12 h-12 text-red-500" />;
      default: return <Package className="w-12 h-12 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input 
          className="flex-1 text-lg py-6 px-4" 
          placeholder="Order ID e.g. 64b8d... or Tracking Code" 
          value={query} 
          onChange={e => setQuery(e.target.value)} 
        />
        <Button type="submit" disabled={loading} className="bg-[#f85606] hover:bg-[#d84a05] text-white py-6 px-8 text-lg">
          {loading ? "Searching..." : "Track"}
        </Button>
      </form>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md text-center">
          {error}
        </div>
      )}

      {result && (
        <div className="border border-[#e0e0e0] dark:border-slate-800 rounded-lg p-6 space-y-6 bg-[#fafafa] dark:bg-slate-800/50">
          <div className="flex flex-col md:flex-row items-center gap-6 border-b pb-6">
            <div className="p-4 bg-white dark:bg-slate-900 rounded-full shadow-sm">
              {getStatusIcon(result.status)}
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold text-[#212121] dark:text-slate-100 capitalize">
                {result.status || "Pending"}
              </h2>
              <p className="text-[#757575] dark:text-slate-400">
                Order ID: <span className="font-mono text-[#212121] dark:text-slate-300">{result.id}</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-[#757575] dark:text-slate-400">Courier</p>
              <p className="font-medium text-[#212121] dark:text-slate-200">{result.courierName || "Not assigned yet"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-[#757575] dark:text-slate-400">Tracking Code</p>
              <p className="font-medium font-mono text-[#212121] dark:text-slate-200">{result.trackingCode || "N/A"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-[#757575] dark:text-slate-400">Order Amount</p>
              <p className="font-medium text-[#212121] dark:text-slate-200">৳ {result.totalPrice}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-[#757575] dark:text-slate-400">Order Date</p>
              <p className="font-medium text-[#212121] dark:text-slate-200">{new Date(result.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
