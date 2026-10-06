import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/index";
import EscrowManagementClient from "./_components/EscrowManagementClient";

export const dynamic = "force-dynamic";

export default async function AdminEscrowPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return <div className="p-8 font-sans text-sm">Unauthorized</div>;

  const escrows = await prisma.escrowHolding.findMany({
    include: {
      seller: {
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          commissionRate: true,
          stores: {
            select: {
              id: true,
              storeName: true,
              storeNameEn: true,
              slug: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Fetch corresponding sales details for order info, customer info, and sold products
  const orderIds = escrows.map((e) => e.orderId);
  const salesOrders = await prisma.sales.findMany({
    where: { id: { in: orderIds } },
    include: {
      customer: {
        select: {
          name: true,
          phone: true,
          email: true,
        },
      },
    },
  });

  const orderMap = new Map();
  salesOrders.forEach((o) => orderMap.set(o.id, o));

  const enrichedEscrows = escrows.map((esc) => ({
    ...esc,
    order: orderMap.get(esc.orderId) || null,
  }));

  return <EscrowManagementClient initialEscrows={enrichedEscrows} />;
}
