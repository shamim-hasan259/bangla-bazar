import PageTitle from "@/components/ui/PageTitle";
import React from "react";
import StoreOrderTabLists from "./_components/StoreOrderTabLists";
import prisma from "@/index";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function StoreOrdersPage({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) {
  const session = await getServerSession(authOptions);
  const { storeId } = await params;

  if (!session || !session.user) {
    redirect("/auth/login");
  }

  // Find Seller
  const seller = await prisma.seller.findFirst({
    where: {
      OR: [
        { id: session.user.id },
        { phone: session.user.phone || undefined },
        { email: session.user.email || undefined },
      ],
    },
  });

  if (!seller) {
    redirect("/dashboard/seller");
  }

  // Find Store to verify ownership
  const store = await prisma.store.findFirst({
    where: {
      id: storeId,
      sellerId: seller.id,
      deletedAt: null,
    },
  });

  if (!store) {
    redirect("/dashboard/seller/store");
  }

  // Fetch orders belonging to this store
  const orders = await prisma.sales.findMany({
    where: {
      storeIds: {
        has: store.id,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <PageTitle title="Store Order Management" />
        <p className="text-slate-450 text-xs mt-1">
          Monitor and fulfill customer orders placed directly with your store.
        </p>
      </div>

      <StoreOrderTabLists storeId={store.id} data={orders} />
    </div>
  );
}
