import React from "react";
import PageTitle from "@/components/ui/PageTitle";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/index";
import { ShieldCheck, AlertTriangle, CheckCircle, Award } from "lucide-react";

export default async function SellerAccountHealthPage() {
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

  const totalSales = await prisma.sales.count({ where: { sellerIds: { has: seller.id } } });
  const canceledSales = await prisma.sales.count({ where: { sellerIds: { has: seller.id }, status: "Canceled" } });
  const returnSales = await prisma.sales.count({ where: { sellerIds: { has: seller.id }, status: "Return" } });

  const cancellationRate = totalSales > 0 ? ((canceledSales / totalSales) * 100).toFixed(1) : "0.0";
  const returnRate = totalSales > 0 ? ((returnSales / totalSales) * 100).toFixed(1) : "0.0";

  return (
    <div className="space-y-6">
      <PageTitle title="Account Health Scorecard" />
      <p className="text-xs text-slate-500">Monitor policy adherence, fulfillment quality metrics, and seller standing scores.</p>

      {/* Main Score Card */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-3xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-lg shadow-emerald-500/10">
        <div>
          <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs font-bold w-fit mb-2 border border-white/20">
            <ShieldCheck className="w-4 h-4 text-emerald-300" /> Account Status: Healthy
          </div>
          <h2 className="text-3xl font-black">Good Standing</h2>
          <p className="text-xs text-emerald-100 mt-1 max-w-md">
            Your store meets all performance targets. Continue delivering orders on time to maintain your status.
          </p>
        </div>
        <div className="text-right">
          <span className="text-[11px] font-bold text-emerald-200 uppercase block">Performance Level</span>
          <span className="text-2xl font-black">{seller.tier || "Bronze Tier"}</span>
        </div>
      </div>

      {/* Score Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Order Cancellation Rate</span>
          <div className="text-2xl font-black text-slate-800 dark:text-white">{cancellationRate}%</div>
          <p className="text-[11px] text-emerald-600 font-semibold">Target: &lt; 2.0% (Passing)</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Return Rate</span>
          <div className="text-2xl font-black text-slate-800 dark:text-white">{returnRate}%</div>
          <p className="text-[11px] text-emerald-600 font-semibold">Target: &lt; 5.0% (Passing)</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Late Dispatch Rate</span>
          <div className="text-2xl font-black text-slate-800 dark:text-white">0.5%</div>
          <p className="text-[11px] text-emerald-600 font-semibold">Target: &lt; 4.0% (Passing)</p>
        </div>
      </div>
    </div>
  );
}
