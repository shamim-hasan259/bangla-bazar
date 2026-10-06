import React from "react";
import PageTitle from "@/components/ui/PageTitle";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/index";
import { Wallet, ArrowDownLeft, ShieldCheck } from "lucide-react";

export default async function CustomerWalletPage() {
  const session = await getServerSession(authOptions);
  const sessionUser = session?.user as any;
  if (!sessionUser?.id) return <div className="p-8">Unauthorized</div>;

  const customer = await prisma.customer.findFirst({
    where: {
      OR: [
        { id: sessionUser.id },
        { phone: sessionUser.phone || undefined },
      ],
    },
  });

  if (!customer) return <div className="p-8">Customer not found</div>;

  return (
    <div className="space-y-6">
      <PageTitle title="Personal Digital Wallet" />

      {/* Wallet Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-[#1E60ED] to-blue-700 text-white rounded-3xl p-6 shadow-lg shadow-blue-500/10 col-span-1 md:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <span className="text-xs font-bold text-blue-200 uppercase tracking-wider">Available Store Credit</span>
            <Wallet className="w-6 h-6 text-blue-200" />
          </div>
          <div className="text-4xl font-black mb-2">৳{(customer.walletBalance || 0).toLocaleString()}</div>
          <p className="text-xs text-blue-100 flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-300" /> Use your balance for instant 1-click checkout payments.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex flex-col justify-center shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Total Refunds Credited</span>
          <span className="text-2xl font-bold text-slate-800 dark:text-white">৳0.00</span>
          <span className="text-[11px] text-slate-400 mt-2">Refunds automatically process to your wallet.</span>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-800 dark:text-white">Recent Wallet Activity</h3>
        <div className="text-center py-8 text-slate-400 text-xs">
          No recent wallet transactions. Refunds and store credits will be listed here.
        </div>
      </div>
    </div>
  );
}
