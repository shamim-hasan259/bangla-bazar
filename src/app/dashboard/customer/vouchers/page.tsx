import React from "react";
import prisma from "@/index";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import PageTitle from "@/components/ui/PageTitle";
import { Card, CardContent } from "@/components/ui/card";
import { Award, Calendar, CheckCircle2, Ticket } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CustomerVouchersPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/auth/login");
  }

  const sessionUser = session.user as any;
  // Resolve Customer
  const customer = await prisma.customer.findFirst({
    where: {
      OR: [
        { id: sessionUser.id },
        { phone: sessionUser.phone || undefined },
      ],
    },
  });

  if (!customer) {
    redirect("/auth/login");
  }

  // Query Customer Collected Vouchers
  const customerVouchers = await prisma.customerVoucher.findMany({
    where: { customerId: customer.id },
    include: {
      voucher: true,
    },
    orderBy: { collectedAt: "desc" },
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300 text-xs">
      <div>
        <PageTitle title="My Vouchers Wallet" />
        <p className="text-slate-500 text-[11px] mt-1">
          View all collected discount coupons that can be applied at checkout.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {customerVouchers.map((wallet) => {
          const v = wallet.voucher;
          if (!v) return null;

          const isExpired = new Date(v.endDate) < new Date();
          const isUsed = wallet.status === "Used";
          const isActive = !isExpired && !isUsed;

          return (
            <Card
              key={wallet.id}
              className={`rounded-2xl border ${
                isActive ? "border-blue-100 bg-white" : "border-slate-100 bg-slate-50/50"
              } shadow-xs`}
            >
              <CardContent className="p-5 flex justify-between items-center gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-mono font-bold px-2 py-0.5 rounded border text-[10px] ${
                        isActive
                          ? "bg-blue-50 text-blue-600 border-blue-100"
                          : "bg-slate-100 text-slate-400 border-slate-200"
                      }`}
                    >
                      {v.code}
                    </span>
                    <h4
                      className={`font-bold ${
                        isActive ? "text-slate-800" : "text-slate-400"
                      }`}
                    >
                      {v.name}
                    </h4>
                  </div>
                  <div className="space-y-1 text-[10px] text-slate-500">
                    <p>
                      Discount:{" "}
                      <span className={`font-bold ${isActive ? "text-blue-600" : "text-slate-400"}`}>
                        {v.discountType === "Percentage" ? `${v.discountValue}%` : `৳ ${v.discountValue}`}
                      </span>
                    </p>
                    <p>Min Spend: ৳ {v.minOrderAmount}</p>
                    <p className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Expires: {new Date(v.endDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`inline-block px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase ${
                      isUsed
                        ? "bg-green-100 text-green-700"
                        : isExpired
                        ? "bg-red-100 text-red-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {wallet.status === "Used" ? "Used" : isExpired ? "Expired" : "Active"}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {customerVouchers.length === 0 && (
          <div className="col-span-2 text-center py-12 border border-dashed rounded-2xl text-slate-400 flex flex-col items-center justify-center">
            <Ticket className="w-8 h-8 text-slate-350 mb-2" />
            <p>Your voucher wallet is empty. Start collecting vouchers from storefront product pages!</p>
          </div>
        )}
      </div>
    </div>
  );
}
