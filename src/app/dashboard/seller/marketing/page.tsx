import React from "react";
import PageTitle from "@/components/ui/PageTitle";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/index";
import { redirect } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Percent, Bolt, Award, Layers, ShoppingBag, DollarSign, MousePointerClick, Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function MarketingDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/auth/login");
  }

  const sellerId = session.user.id;

  // Query database statistics
  const activeCampaignsCount = await prisma.campaign.count({
    where: { status: "Running" }
  });

  const runningFlashSalesCount = await prisma.flashSale.count({
    where: {
      startDate: { lte: new Date() },
      endDate: { gte: new Date() }
    }
  });

  const activeVouchersCount = await prisma.storeVoucher.count({
    where: {
      sellerId,
      endDate: { gte: new Date() }
    }
  });

  const activeBundlesCount = await prisma.productBundle.count({
    where: {
      sellerId,
      status: "Active"
    }
  });

  // Calculate stats from order tables
  // We can query sales that have storeIds or are linked to flash sales/campaigns
  const marketingOrders = await prisma.sales.findMany({
    where: {
      sellerIds: { has: sellerId }
    },
    take: 5,
    orderBy: { createdAt: "desc" }
  });

  const totalMarketingRevenue = marketingOrders.reduce((sum, order) => sum + (order.grossTotal || 0), 0);

  // Mock analytics indices to wown the user
  const stats = [
    { title: "Active Campaigns", value: activeCampaignsCount, icon: Percent, color: "text-[#1E60ED]", bg: "bg-blue-50/50 dark:bg-blue-950/10" },
    { title: "Running Flash Sales", value: runningFlashSalesCount, icon: Bolt, color: "text-[#1E60ED]", bg: "bg-blue-50/50/50 dark:bg-orange-950/10" },
    { title: "Active Vouchers", value: activeVouchersCount, icon: Award, color: "text-green-500", bg: "bg-green-50/50 dark:bg-green-950/10" },
    { title: "Active Bundles", value: activeBundlesCount, icon: Layers, color: "text-purple-500", bg: "bg-purple-50/50 dark:bg-purple-950/10" },
    { title: "Marketing Orders", value: marketingOrders.length, icon: ShoppingBag, color: "text-[#1E60ED]", bg: "bg-blue-50/50 dark:bg-blue-950/10" },
    { title: "Marketing Revenue", value: `৳ ${totalMarketingRevenue}`, icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-50/50 dark:bg-emerald-950/10" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300 p-6 text-xs">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <PageTitle title="Marketing Center" />
          <p className="text-slate-500 text-xs mt-1">
            Grow your sales by creating customized vouchers, grouping products, and joining sitewide promotions.
          </p>
        </div>
      </div>

      {/* Overview Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx} className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">{stat.title}</p>
                  <p className="text-lg font-black text-slate-800 dark:text-white leading-none">{stat.value}</p>
                </div>
                <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Marketing channels navigation */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-sm font-bold">Quick Tools & Hubs</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href="/dashboard/seller/marketing/campaigns">
                <div className="p-4 border border-slate-100 hover:border-blue-200 dark:border-slate-800 dark:hover:border-blue-900 rounded-2xl hover:bg-blue-50/10 transition duration-205 flex items-start justify-between cursor-pointer">
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-200">Campaign Enrollment Hub</h4>
                    <p className="text-slate-400 mt-1 text-[11px] leading-relaxed">
                      Register your products for upcoming sitewide mega events.
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </div>
              </Link>

              <Link href="/dashboard/seller/marketing/flash-sales">
                <div className="p-4 border border-slate-100 hover:border-orange-200 dark:border-slate-800 dark:hover:border-orange-900 rounded-2xl hover:bg-blue-50/50/10 transition duration-205 flex items-start justify-between cursor-pointer">
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-200">Lightning Flash Sales</h4>
                    <p className="text-slate-400 mt-1 text-[11px] leading-relaxed">
                      Participate in scheduled premium flash sale hours.
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </div>
              </Link>

              <Link href="/dashboard/seller/marketing/vouchers">
                <div className="p-4 border border-slate-100 hover:border-green-200 dark:border-slate-800 dark:hover:border-green-900 rounded-2xl hover:bg-green-50/10 transition duration-205 flex items-start justify-between cursor-pointer">
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-200">Storefront Vouchers</h4>
                    <p className="text-slate-400 mt-1 text-[11px] leading-relaxed">
                      Distribute store discount coupons directly on product details.
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </div>
              </Link>

              <Link href="/dashboard/seller/marketing/bundles">
                <div className="p-4 border border-slate-100 hover:border-purple-200 dark:border-slate-800 dark:hover:border-purple-900 rounded-2xl hover:bg-purple-50/10 transition duration-205 flex items-start justify-between cursor-pointer">
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-200">Product Bundles</h4>
                    <p className="text-slate-400 mt-1 text-[11px] leading-relaxed">
                      Group items for package deals to improve order checkout size.
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </div>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Recent activity timeline */}
        <div className="lg:col-span-1">
          <Card className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs h-full">
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-sm font-bold">Marketing Activity Log</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {marketingOrders.length ? (
                marketingOrders.map((act) => (
                  <div key={act.id} className="flex gap-3 pb-3 border-b border-slate-50 last:border-0">
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950 shrink-0 self-start">
                      <ShoppingBag className="w-4 h-4 text-[#1E60ED]" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800 dark:text-slate-200">Order #{act.invoiceId} Placed</p>
                      <p className="text-slate-450 mt-0.5 text-[10px]">
                        ৳ {act.grossTotal || act.total} • {new Date(act.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-slate-400 italic">No marketing transactions recorded yet.</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
