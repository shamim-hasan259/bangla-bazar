import React from "react";
import PageTitle from "@/components/ui/PageTitle";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/index";
import Link from "next/link";
import { PackageX, ArrowRight } from "lucide-react";

export default async function CustomerReturnsPage() {
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

  const returnOrders = await prisma.sales.findMany({
    where: {
      customerId: customer.id,
      status: { in: ["Return", "Canceled"] },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <PageTitle title="My Returns & Cancellations Tracker" />
      <p className="text-xs text-slate-500">Track and monitor all your return claims, refund settlements, and canceled items.</p>

      {returnOrders.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
            <PackageX className="w-6 h-6 text-slate-400" />
          </div>
          <h4 className="text-base font-bold text-slate-800 dark:text-white">No active return or cancellation requests</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Items returned after delivery or canceled before shipment will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {returnOrders.map((order) => (
            <div key={order.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-slate-800 dark:text-white">Invoice #{order.invoiceId}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${order.status === "Return" ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800"}`}>
                    {order.status} Requested
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">Total Amount: ৳{order.grossTotal || order.total}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Updated: {new Date(order.updatedAt).toLocaleDateString()}</p>
              </div>

              <Link href={`/dashboard/customer/order-history/${order.id}`} className="inline-flex items-center text-xs font-bold text-[#1E60ED] hover:underline gap-1">
                View Details <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
