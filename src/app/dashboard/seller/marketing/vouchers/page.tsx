import React from "react";
import prisma from "@/index";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import PageTitle from "@/components/ui/PageTitle";
import VouchersManagerClient from "./VouchersManagerClient";

export const dynamic = "force-dynamic";

export default async function SellerVouchersPage() {
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

  // Query created vouchers
  const vouchers = sellerObjectId
    ? await prisma.storeVoucher.findMany({
        where: { sellerId: sellerObjectId },
        orderBy: { createdAt: "desc" },
      })
    : [];

  // Query stores
  const stores = sellerObjectId
    ? await prisma.store.findMany({
        where: { sellerId: sellerObjectId, deletedAt: null },
      })
    : [];

  // Query seller products
  const products = await prisma.product.findMany({
    where: {
      ...(stores.length > 0
        ? { storeId: { in: stores.map((s) => s.id) } }
        : sellerObjectId
        ? { sellerId: sellerObjectId }
        : {}),
      status: "Active",
    },
    select: {
      id: true,
      name: true,
      price: true,
    },
  });

  // Query categories
  const categories = await prisma.category.findMany({
    where: { parentId: null },
    select: { id: true, name: true },
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300 p-6">
      <div>
        <PageTitle title="Storefront Vouchers" />
        <p className="text-slate-500 text-xs mt-1">
          Create and issue storefront discount coupons for customers to collect and apply at checkout.
        </p>
      </div>

      <VouchersManagerClient
        vouchers={vouchers}
        stores={stores}
        products={products}
        categories={categories}
        sellerId={sellerObjectId || rawSellerId}
      />
    </div>
  );
}
