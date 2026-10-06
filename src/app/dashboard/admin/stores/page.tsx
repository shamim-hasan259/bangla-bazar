import React from "react";
import prisma from "@/index";
import PageTitle from "@/components/ui/PageTitle";
import StoresManager from "./_components/StoresManager";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ShieldAlert } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminStoresPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
        <ShieldAlert className="w-12 h-12 text-red-500 mb-4 animate-bounce" />
        <h3 className="text-lg font-bold text-slate-800">Access Denied</h3>
        <p className="text-slate-500 text-sm mt-1">Please log in as an administrator.</p>
      </div>
    );
  }

  // @ts-ignore
  const userType = session.user.type?.toLowerCase();
  if (userType !== "admin" && userType !== "manager") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
        <ShieldAlert className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-lg font-bold text-slate-800">Permission Denied</h3>
        <p className="text-slate-500 text-sm mt-1">Only administrative roles can view this panel.</p>
      </div>
    );
  }

  // Aggregate Stats
  const total = await prisma.store.count({ where: { deletedAt: null } });
  const pending = await prisma.store.count({ where: { status: "Pending", deletedAt: null } });
  const approved = await prisma.store.count({ where: { status: "Approved", deletedAt: null } });
  const rejected = await prisma.store.count({ where: { status: "Rejected", deletedAt: null } });
  
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayRequests = await prisma.store.count({
    where: {
      createdAt: { gte: todayStart },
      deletedAt: null,
    },
  });

  // Query stores with seller and category relations
  const rawStores = await prisma.store.findMany({
    where: {
      deletedAt: null,
    },
    include: {
      seller: {
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
        },
      },
      masterCategory: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Safe mapping of statuses for TypeScript checks
  const stores = rawStores.map((s) => ({
    ...s,
    status: s.status as any,
  }));

  // Aggregated mockup stats for payments/orders
  const stats = {
    total,
    pending,
    approved,
    rejected,
    todayRequests,
    orders: 0,
    revenue: 0,
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <PageTitle title="Marketplace Stores" />
        <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">
          Review store registration requests, approve storefronts, or manage suspensions.
        </p>
      </div>

      <StoresManager initialStores={stores} stats={stats} />
    </div>
  );
}
