"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  ShoppingBag,
  TrendingUp,
  Percent,
  Search,
  CheckCircle2,
  Clock,
  ArrowUpRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";

export default function AffiliateReferralsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/affiliate/stats", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const affiliate = stats?.affiliate;
  const referrals = stats?.referrals || [];
  const clicks = affiliate?.clicks || 0;
  const conversions = affiliate?.conversions || referrals.length || 0;
  const totalCommission = referrals.reduce((sum: number, r: any) => sum + (r.commission || 0), 0);
  const conversionRate = clicks > 0 ? ((conversions / clicks) * 100).toFixed(1) : "0";

  const filteredReferrals = referrals.filter((r: any) =>
    (r.orderId && r.orderId.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (r.productName && r.productName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (r.customerName && r.customerName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Referral Orders & Conversions</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Detailed metrics on customers who purchased through your affiliate links
        </p>
      </div>

      {/* ── Metric Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-2xs">
          <span className="text-xs font-bold text-slate-500">Referred Orders</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">{conversions}</p>
          <p className="text-[11px] text-blue-600 font-bold mt-1">Confirmed buyer checkouts</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-2xs">
          <span className="text-xs font-bold text-slate-500">Conversion Rate</span>
          <p className="text-2xl font-black text-indigo-600 mt-2">{conversionRate}%</p>
          <p className="text-[11px] text-indigo-600 font-bold mt-1">{clicks} total clicks recorded</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-2xs">
          <span className="text-xs font-bold text-slate-500">Total Commission Generated</span>
          <p className="text-2xl font-black text-emerald-600 mt-2">৳{totalCommission.toLocaleString()}</p>
          <p className="text-[11px] text-emerald-600 font-bold mt-1">From all referred sales</p>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-base font-black text-slate-900 dark:text-white">Referral History</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">List of all orders attributed to your tracking links</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by order or product..."
              className="h-9 pl-9 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
            />
          </div>
        </div>

        {filteredReferrals.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No referral orders found matching your search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold">
                  <th className="py-3 px-3">Order ID</th>
                  <th className="py-3 px-3">Customer (Masked)</th>
                  <th className="py-3 px-3">Product Name</th>
                  <th className="py-3 px-3">Order Total</th>
                  <th className="py-3 px-3">Your Commission</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredReferrals.map((r: any) => (
                  <tr key={r.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-3 font-mono font-bold text-slate-900 dark:text-white">
                      #{r.orderId || r.id.slice(-6).toUpperCase()}
                    </td>
                    <td className="py-3.5 px-3 text-slate-600 dark:text-slate-300">
                      {r.customerName || "Customer ***"}
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                      {r.productName || "Direct Link Checkout"}
                    </td>
                    <td className="py-3.5 px-3 text-slate-700 dark:text-slate-300">
                      ৳{(r.orderAmount || 0).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-3 font-bold text-emerald-600">
                      +৳{(r.commission || 0).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" />
                        {r.status || "Approved"}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-slate-400">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
