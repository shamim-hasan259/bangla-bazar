"use client";

import React, { useState, useEffect } from "react";
import {
  DollarSign,
  TrendingUp,
  Wallet,
  Clock,
  CheckCircle2,
  Filter,
  Calendar,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AffiliateEarningsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");

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
  const totalEarnings = affiliate?.totalEarnings || 0;
  const walletBalance = affiliate?.walletBalance || 0;
  const referrals = stats?.referrals || [];

  const filteredReferrals = referrals.filter((r: any) => {
    if (filterStatus === "all") return true;
    return (r.status || "").toLowerCase() === filterStatus.toLowerCase();
  });

  const pendingCommissions = referrals
    .filter((r: any) => r.status === "Pending")
    .reduce((sum: number, r: any) => sum + (r.commission || 0), 0);

  const paidCommissions = totalEarnings - walletBalance;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Earnings & Commission Ledger</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Detailed financial records of commissions earned from customer purchases
        </p>
      </div>

      {/* ── Financial Summary Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-2xs">
          <span className="text-xs font-bold text-slate-500">Lifetime Earnings</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            ৳{totalEarnings.toLocaleString()}
          </p>
          <p className="text-[11px] text-emerald-600 font-bold mt-1">All verified commissions</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-2xs">
          <span className="text-xs font-bold text-slate-500">Available Balance</span>
          <p className="text-2xl font-black text-[#1E60ED] mt-2">
            ৳{walletBalance.toLocaleString()}
          </p>
          <p className="text-[11px] text-blue-600 font-bold mt-1">Ready for withdrawal</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-2xs">
          <span className="text-xs font-bold text-slate-500">Pending Clearance</span>
          <p className="text-2xl font-black text-amber-600 mt-2">
            ৳{pendingCommissions.toLocaleString()}
          </p>
          <p className="text-[11px] text-amber-600 font-bold mt-1">Awaiting order delivery/approval</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-2xs">
          <span className="text-xs font-bold text-slate-500">Total Paid Out</span>
          <p className="text-2xl font-black text-indigo-600 mt-2">
            ৳{Math.max(0, paidCommissions).toLocaleString()}
          </p>
          <p className="text-[11px] text-indigo-600 font-bold mt-1">Successfully withdrawn</p>
        </div>
      </div>

      {/* ── Commission Transactions Table ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-base font-black text-slate-900 dark:text-white">Commission History</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Record of every order commission credited to your account</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
              {["all", "approved", "pending", "paid"].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all ${
                    filterStatus === st
                      ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {filteredReferrals.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No commission transactions found for this filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold">
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Order Ref</th>
                  <th className="py-3 px-3">Product / Category</th>
                  <th className="py-3 px-3">Order Value</th>
                  <th className="py-3 px-3">Commission %</th>
                  <th className="py-3 px-3">Net Commission</th>
                  <th className="py-3 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredReferrals.map((r: any) => (
                  <tr key={r.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-3 text-slate-500">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-3 font-mono font-bold text-slate-900 dark:text-white">
                      #{r.orderId || r.id.slice(-6).toUpperCase()}
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                      {r.productName || "General Marketplace Order"}
                    </td>
                    <td className="py-3.5 px-3 text-slate-700 dark:text-slate-300">
                      ৳{(r.orderAmount || 0).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-blue-600">
                      {affiliate?.commissionRate || 5}%
                    </td>
                    <td className="py-3.5 px-3 font-bold text-emerald-600 text-sm">
                      +৳{(r.commission || 0).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          r.status === "Approved" || r.status === "Paid"
                            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400"
                            : "bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400"
                        }`}
                      >
                        {r.status === "Approved" || r.status === "Paid" ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <Clock className="w-3 h-3" />
                        )}
                        {r.status || "Approved"}
                      </span>
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
