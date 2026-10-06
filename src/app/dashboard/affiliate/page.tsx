"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  DollarSign,
  TrendingUp,
  MousePointerClick,
  ShoppingBag,
  Percent,
  Wallet,
  ArrowUpRight,
  Copy,
  Check,
  Link as LinkIcon,
  Sparkles,
  ChevronRight,
  ExternalLink,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AffiliateDashboardOverview() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Quick Link Generator states
  const [inputUrl, setInputUrl] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);

  const user = session?.user as any;
  const affiliateCode = user?.affiliateCode || "AFF-PARTNER";

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

  const handleGenerateLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl) {
      toast.error("Please enter a valid Bangla Bazar URL");
      return;
    }

    try {
      const baseUrl = inputUrl.trim();
      const separator = baseUrl.includes("?") ? "&" : "?";
      const finalLink = `${baseUrl}${separator}ref=${affiliateCode}`;
      setGeneratedLink(finalLink);
      toast.success("Affiliate link generated!");
    } catch (err) {
      toast.error("Failed to generate link");
    }
  };

  const handleCopy = (text: string) => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(text);
      setCopiedLink(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const affiliate = stats?.affiliate;
  const walletBalance = affiliate?.walletBalance ?? 0;
  const totalEarnings = affiliate?.totalEarnings ?? 0;
  const clicks = affiliate?.clicks ?? 0;
  const conversions = affiliate?.conversions ?? 0;
  const commissionRate = affiliate?.commissionRate ?? 5;
  const referrals = stats?.referrals || [];
  const monthlyStats = stats?.monthlyStats || [
    { month: "Jan", earnings: 450, clicks: 120 },
    { month: "Feb", earnings: 890, clicks: 230 },
    { month: "Mar", earnings: 1200, clicks: 310 },
    { month: "Apr", earnings: 1850, clicks: 420 },
    { month: "May", earnings: 2400, clicks: 580 },
    { month: "Jun", earnings: 3100, clicks: 750 },
  ];

  return (
    <div className="space-y-6">
      {/* ── Welcome Banner ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white p-6 sm:p-8 shadow-xl shadow-blue-500/10">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-blue-100 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Affiliate Partner Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Welcome back, {user?.name || "Affiliate Partner"}! 👋
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
              Share your custom affiliate links to earn <span className="font-bold text-white">{commissionRate}% commission</span> on every qualified purchase.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/affiliate/wallet"
              className="px-5 py-3 rounded-2xl bg-white text-blue-700 hover:bg-blue-50 font-bold text-xs shadow-lg transition-all flex items-center gap-2"
            >
              <Wallet className="w-4 h-4" />
              <span>Request Payout</span>
            </Link>
            <Link
              href="/dashboard/affiliate/links"
              className="px-5 py-3 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-bold text-xs border border-white/20 transition-all flex items-center gap-2"
            >
              <LinkIcon className="w-4 h-4" />
              <span>Create Links</span>
            </Link>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute right-0 -bottom-10 w-72 h-72 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* ── KPI Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Total Earnings */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Total Earnings</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-black text-slate-900 dark:text-white">
              ৳{totalEarnings.toLocaleString()}
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-bold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>↗ 28% from last month</span>
            </div>
          </div>
        </div>

        {/* Wallet Balance */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Available Wallet</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-[#1E60ED]">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-black text-[#1E60ED] dark:text-blue-400">
              ৳{walletBalance.toLocaleString()}
            </p>
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
              <span>Min. Payout: ৳500</span>
              <Link href="/dashboard/affiliate/wallet" className="text-blue-600 hover:underline font-semibold">
                Withdraw →
              </Link>
            </div>
          </div>
        </div>

        {/* Clicks & Traffic */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Total Link Clicks</span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600">
              <MousePointerClick className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-black text-slate-900 dark:text-white">
              {clicks.toLocaleString()}
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-indigo-600 font-bold">
              <span>{clicks > 0 ? ((conversions / clicks) * 100).toFixed(1) : "0"}% Conversion Rate</span>
            </div>
          </div>
        </div>

        {/* Referred Orders */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Successful Orders</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-black text-slate-900 dark:text-white">
              {conversions.toLocaleString()}
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-amber-600 font-bold">
              <Percent className="w-3.5 h-3.5" />
              <span>{commissionRate}% Standard Commission</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Quick Link Generator Card ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-[#1E60ED]" /> Quick Link Generator
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Paste any product or page link from Bangla Bazar to generate your custom tracked URL
            </p>
          </div>
          <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 w-fit">
            Your Ref Code: {affiliateCode}
          </span>
        </div>

        <form onSubmit={handleGenerateLink} className="flex flex-col sm:flex-row gap-3">
          <Input
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="e.g. https://banglabazar.com/products/wireless-earbuds-pro"
            className="flex-1 h-12 rounded-2xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
          />
          <Button
            type="submit"
            className="h-12 px-6 rounded-2xl bg-[#1E60ED] hover:bg-blue-700 text-white font-extrabold text-xs shadow-md shadow-blue-500/20"
          >
            Generate Link
          </Button>
        </form>

        {generatedLink && (
          <div className="mt-4 p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/70 dark:border-blue-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400">
                Your Tracking Link (Ready to Share)
              </p>
              <p className="text-xs font-mono font-bold text-slate-800 dark:text-slate-100 truncate mt-0.5 select-all">
                {generatedLink}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={() => handleCopy(generatedLink)}
                className="h-9 px-4 rounded-xl bg-[#1E60ED] hover:bg-blue-700 text-white text-xs font-bold gap-1.5"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? "Copied" : "Copy Link"}</span>
              </Button>
              <a
                href={generatedLink}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600 border border-slate-200 dark:border-slate-700 transition-colors"
                title="Open Link"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        )}
      </div>

      {/* ── Visual Earnings Chart & Recent Activity Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Earnings Performance Chart Card */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">Earnings Analytics</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Monthly commission performance</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#1E60ED]" />
                <span className="text-slate-600 dark:text-slate-400">Earnings (৳)</span>
              </div>
            </div>
          </div>

          {/* Clean Visual Bar Visualization */}
          <div className="h-56 flex items-end justify-between gap-3 sm:gap-6 pt-6 px-2">
            {monthlyStats.map((item: any, idx: number) => {
              const heightPercent = Math.max(15, Math.min(100, (item.earnings / 3500) * 100));
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <div className="text-[10px] font-bold text-slate-600 dark:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
                    ৳{item.earnings}
                  </div>
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full max-w-[42px] bg-gradient-to-t from-blue-600 to-sky-400 rounded-t-xl group-hover:from-blue-700 group-hover:to-sky-300 transition-all shadow-sm"
                  />
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
                    {item.month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Commission Tiers & Payout Status */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <h2 className="text-base font-black text-slate-900 dark:text-white mb-1">Affiliate Tier Status</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">Your current reward level</p>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50/50 dark:from-slate-800 dark:to-slate-800/50 border border-blue-100 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-900 dark:text-blue-300">Silver Partner</span>
                <span className="text-xs font-black text-[#1E60ED]">{commissionRate}% Rate</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full w-[45%]" />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Generate 15 more orders to unlock <span className="font-bold text-blue-600">Gold Tier (7.5%)</span>.
              </p>
            </div>

            <div className="space-y-3 mt-5">
              <div className="flex items-center justify-between text-xs py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Payout Frequency</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">Instant / On-Demand</span>
              </div>
              <div className="flex items-center justify-between text-xs py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Cookie Lifetime</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">30 Days</span>
              </div>
              <div className="flex items-center justify-between text-xs py-2">
                <span className="text-slate-500">Default Payment</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {affiliate?.paymentMethod || "bKash"} ({affiliate?.paymentNumber || "Set"})
                </span>
              </div>
            </div>
          </div>

          <Link
            href="/dashboard/affiliate/wallet"
            className="w-full py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-center font-bold text-xs transition-colors mt-4 block"
          >
            Manage Payout Settings →
          </Link>
        </div>
      </div>

      {/* ── Recent Referral Conversions Table ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-black text-slate-900 dark:text-white">Recent Referral Orders</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Real-time commissions from your links</p>
          </div>
          <Link
            href="/dashboard/affiliate/referrals"
            className="text-xs font-bold text-[#1E60ED] hover:underline flex items-center gap-1"
          >
            View All <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {referrals.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-[#1E60ED] flex items-center justify-center mx-auto mb-3">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No referral orders yet</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Share your affiliate link on Facebook, YouTube, TikTok, or your website to start earning commissions!
            </p>
            <Link
              href="/dashboard/affiliate/links"
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1E60ED] text-white text-xs font-bold"
            >
              Get Your Links Now
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold">
                  <th className="py-3 px-3">Order ID</th>
                  <th className="py-3 px-3">Product / Customer</th>
                  <th className="py-3 px-3">Order Amount</th>
                  <th className="py-3 px-3">Commission Earned</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {referrals.map((r: any) => (
                  <tr key={r.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-3 font-mono font-bold text-slate-900 dark:text-white">
                      #{r.orderId || r.id.slice(-6).toUpperCase()}
                    </td>
                    <td className="py-3.5 px-3">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">
                        {r.productName || "Direct Store Referral"}
                      </p>
                      <p className="text-[11px] text-slate-400">{r.customerName || "Verified Buyer"}</p>
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-slate-700 dark:text-slate-300">
                      ৳{(r.orderAmount || 0).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-3 font-bold text-emerald-600 dark:text-emerald-400">
                      +৳{(r.commission || 0).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          r.status === "Approved" || r.status === "Paid"
                            ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400"
                            : r.status === "Pending"
                            ? "bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400"
                            : "bg-red-50 text-red-600"
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
