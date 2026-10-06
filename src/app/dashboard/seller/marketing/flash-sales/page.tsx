import React from "react";
import prisma from "@/index";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import PageTitle from "@/components/ui/PageTitle";
import FlashSalesEnrollmentClient from "./FlashSalesEnrollmentClient";

export const dynamic = "force-dynamic";

export default async function SellerFlashSalesHubPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/auth/seller/signin");
  }

  const rawSellerId = session.user.id || "";
  const isObjectId = typeof rawSellerId === "string" && /^[0-9a-fA-F]{24}$/.test(rawSellerId);

  const seller = await prisma.seller.findFirst({
    where: {
      OR: [
        ...(isObjectId ? [{ id: rawSellerId }] : []),
        { sellerId: rawSellerId },
        { phone: (session.user as any).phone || undefined },
        { email: session.user.email || undefined },
      ],
    },
    select: { id: true, sellerId: true },
  });

  const sellerObjectId = seller?.id || (isObjectId ? rawSellerId : undefined);
  const sellerId = sellerObjectId || rawSellerId;

  // Query stores for store selection
  const stores = sellerObjectId
    ? await prisma.store.findMany({
        where: { sellerId: sellerObjectId, deletedAt: null },
      })
    : [];

  // Query active & upcoming flash sales
  const flashSales = await prisma.flashSale.findMany({
    where: {
      endDate: { gte: new Date() },
    },
    orderBy: { startDate: "asc" },
    include: {
      products: {
        where: {
          ...(sellerObjectId ? { sellerId: sellerObjectId } : {}),
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              photo: true,
              stock: true,
            },
          },
        },
      },
    },
  });

  // Query seller products
  const products = await prisma.product.findMany({
    where: {
      OR: [
        ...(stores.length > 0 ? [{ storeId: { in: stores.map((s) => s.id) } }] : []),
        ...(sellerObjectId ? [{ sellerId: sellerObjectId }] : []),
      ],
      status: "Active",
    },
    select: {
      id: true,
      name: true,
      price: true,
      photo: true,
      stock: true,
      storeId: true,
      categoryId: true,
      masterCategoryId: true,
    },
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300 p-6">
      <div>
        <PageTitle title="Lightning Flash Sales" />
        <p className="text-slate-500 text-xs mt-1">
          Join site-wide lightning flash sale slots, set stock pools, and apply customer transaction limits.
        </p>
      </div>

      <FlashSalesEnrollmentClient
        flashSales={flashSales}
        stores={stores}
        products={products}
        sellerId={sellerId}
      />
    </div>
  );
}
