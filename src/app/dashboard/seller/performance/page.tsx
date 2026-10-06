import React from "react";
import PageTitle from "@/components/ui/PageTitle";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/index";
import { Award, CheckCircle2, Star } from "lucide-react";

export default async function SellerPerformancePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return <div className="p-8">Unauthorized</div>;

  const seller = await prisma.seller.findFirst({
    where: {
      OR: [
        { id: session.user.id },
        { phone: session.user.phone || undefined },
      ],
    },
  });

  if (!seller) return <div className="p-8">Seller not found</div>;

  const currentTier = seller.tier || "Bronze";

  return (
    <div className="space-y-6">
      <PageTitle title="Seller Performance Tiers & Milestones" />
      <p className="text-xs text-slate-500">Track your tier level progress and unlock lowered admin commission rates.</p>

      {/* Tier Progress Card */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div>
          <div className="flex items-center gap-2 bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full text-xs font-bold w-fit mb-2 border border-amber-500/30">
            <Award className="w-4 h-4" /> Current Badge: {currentTier} Seller
          </div>
          <h2 className="text-3xl font-black">{currentTier} Tier Standing</h2>
          <p className="text-xs text-slate-300 mt-1 max-w-md">
            Commission Rate: <strong className="text-white">{seller.commissionRate}%</strong>. Upgrade to Silver or Gold tier to enjoy lower commission fees down to 5%.
          </p>
        </div>

        <div className="bg-white/10 p-4 rounded-2xl border border-white/10 text-center min-w-[160px]">
          <span className="text-[11px] font-bold text-slate-300 uppercase block">Commission Fee</span>
          <span className="text-3xl font-black text-amber-400 mt-1 block">{seller.commissionRate}%</span>
        </div>
      </div>

      {/* Tiers Progression Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-800 dark:text-white">Seller Tier Milestones</h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className={`p-5 rounded-2xl border ${currentTier === "Bronze" ? "border-[#1E60ED] bg-blue-50/20 ring-2 ring-[#1E60ED]" : "border-slate-200 dark:border-slate-800"}`}>
            <span className="text-xs font-bold text-slate-400 uppercase block">Level 1</span>
            <h4 className="text-lg font-black text-amber-700 mt-1">Bronze</h4>
            <p className="text-xs text-slate-500 mt-2">Default starting tier</p>
            <span className="text-xs font-bold text-slate-700 block mt-3">Commission: 10%</span>
          </div>

          <div className={`p-5 rounded-2xl border ${currentTier === "Silver" ? "border-[#1E60ED] bg-blue-50/20 ring-2 ring-[#1E60ED]" : "border-slate-200 dark:border-slate-800"}`}>
            <span className="text-xs font-bold text-slate-400 uppercase block">Level 2</span>
            <h4 className="text-lg font-black text-slate-600 mt-1">Silver</h4>
            <p className="text-xs text-slate-500 mt-2">50+ Completed Orders</p>
            <span className="text-xs font-bold text-slate-700 block mt-3">Commission: 8%</span>
          </div>

          <div className={`p-5 rounded-2xl border ${currentTier === "Gold" ? "border-[#1E60ED] bg-blue-50/20 ring-2 ring-[#1E60ED]" : "border-slate-200 dark:border-slate-800"}`}>
            <span className="text-xs font-bold text-slate-400 uppercase block">Level 3</span>
            <h4 className="text-lg font-black text-amber-500 mt-1">Gold</h4>
            <p className="text-xs text-slate-500 mt-2">200+ Orders & 4.8 Rating</p>
            <span className="text-xs font-bold text-slate-700 block mt-3">Commission: 6%</span>
          </div>

          <div className={`p-5 rounded-2xl border ${currentTier === "Platinum" ? "border-[#1E60ED] bg-blue-50/20 ring-2 ring-[#1E60ED]" : "border-slate-200 dark:border-slate-800"}`}>
            <span className="text-xs font-bold text-slate-400 uppercase block">Level 4</span>
            <h4 className="text-lg font-black text-indigo-500 mt-1">Platinum</h4>
            <p className="text-xs text-slate-500 mt-2">500+ Orders & Top Seller</p>
            <span className="text-xs font-bold text-slate-700 block mt-3">Commission: 5%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
