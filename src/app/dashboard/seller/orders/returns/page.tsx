import React from "react";
import PageTitle from "@/components/ui/PageTitle";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/index";
import { RotateCcw } from "lucide-react";
import ReturnSettlementActions from "./_components/ReturnSettlementActions";

export default async function SellerReturnsSettlementPage() {
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

  const returnOrders = await prisma.sales.findMany({
    where: {
      sellerIds: { has: seller.id },
      status: "Return",
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <PageTitle title="Return Orders Settlement Panel" />
      <p className="text-xs text-slate-500">Inspect buyer return claims, verify warehouse receipts, and settle refund claims.</p>

      {returnOrders.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center">
          <RotateCcw className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <h4 className="text-base font-bold text-slate-800 dark:text-white">No pending return disputes</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            All return requests submitted by buyers have been processed and settled.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {returnOrders.map((order) => (
            <div key={order.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-slate-800 dark:text-white">Invoice #{order.invoiceId}</span>
                  <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">Return Claim</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">Claim Amount: ৳{order.grossTotal || order.total}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Date: {new Date(order.updatedAt).toLocaleDateString()}</p>
              </div>

              <ReturnSettlementActions orderId={order.id} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
