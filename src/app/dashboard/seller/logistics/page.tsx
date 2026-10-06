import React from "react";
import PageTitle from "@/components/ui/PageTitle";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/index";
import { Truck, Navigation, CheckCircle2, Clock } from "lucide-react";

export default async function SellerLogisticsPage() {
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

  const shipments = await prisma.sales.findMany({
    where: {
      sellerIds: { has: seller.id },
      status: { in: ["Processing", "Shipped", "Delivered"] },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <PageTitle title="Live Logistics & Shipping Board" />
      <p className="text-xs text-slate-500">Monitor package dispatch logs, active courier updates (Pathao, RedX, Paperfly), and delivery transit status.</p>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">In Transit</span>
            <span className="text-2xl font-black text-slate-800 dark:text-white mt-1 block">
              {shipments.filter(s => s.status === "Shipped").length}
            </span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Truck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Processing Dispatch</span>
            <span className="text-2xl font-black text-slate-800 dark:text-white mt-1 block">
              {shipments.filter(s => s.status === "Processing").length}
            </span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Delivered This Month</span>
            <span className="text-2xl font-black text-slate-800 dark:text-white mt-1 block">
              {shipments.filter(s => s.status === "Delivered").length}
            </span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Shipment Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-800 dark:text-white">Active Courier Parcels</h3>
        
        {shipments.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">No active shipments currently in transit.</div>
        ) : (
          <div className="space-y-3">
            {shipments.map((ship) => (
              <div key={ship.id} className="flex items-center justify-between p-4 border rounded-2xl border-slate-100 dark:border-slate-800">
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-white">Invoice #{ship.invoiceId}</p>
                  <p className="text-xs text-slate-500">Courier: {ship.courierName || "Standard Delivery"} | Tracking: {ship.trackingCode || "N/A"}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${ship.status === "Shipped" ? "bg-blue-100 text-blue-800" : "bg-emerald-100 text-emerald-800"}`}>
                  {ship.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
