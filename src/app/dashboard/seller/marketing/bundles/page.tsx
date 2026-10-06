import React from "react";
import prisma from "@/index";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import PageTitle from "@/components/ui/PageTitle";
import BundlesManagerClient from "./BundlesManagerClient";

export const dynamic = "force-dynamic";

export default async function SellerBundlesPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/auth/login");
  }

  const isObjectId = (val?: string | null) => typeof val === "string" && /^[0-9a-fA-F]{24}$/.test(val);
  const rawSellerId = session.user.id || "";
  const validObjectId = isObjectId(rawSellerId);

  const seller = await prisma.seller.findFirst({
    where: {
      OR: [
        ...(validObjectId ? [{ id: rawSellerId }] : []),
        { sellerId: rawSellerId },
        { phone: (session.user as any).phone || undefined },
        { email: session.user.email || undefined },
      ].filter(Boolean),
    },
    select: { id: true, sellerId: true },
  });

  const sellerObjectId = seller?.id || (validObjectId ? rawSellerId : undefined);

  // Query stores
  const validStores = sellerObjectId
    ? await prisma.store.findMany({
        where: { sellerId: sellerObjectId, deletedAt: null },
        select: { id: true, storeNameEn: true, storeNameBn: true, status: true },
      })
    : [];

  const storeIds = validStores.map((s) => s.id).filter(isObjectId);

  // Query created bundles
  const bundles = sellerObjectId
    ? await prisma.productBundle.findMany({
        where: {
          sellerId: sellerObjectId,
        },
        orderBy: { createdAt: "desc" },
      })
    : [];

  // Query seller products
  const products = (sellerObjectId || storeIds.length > 0)
    ? await prisma.product.findMany({
        where: {
          OR: [
            ...(sellerObjectId ? [{ sellerId: sellerObjectId }] : []),
            ...(storeIds.length > 0 ? [{ storeId: { in: storeIds } }] : []),
          ],
          status: "Active",
        },
        select: {
          id: true,
          name: true,
          price: true,
          storeId: true,
          photo: true,
        },
        orderBy: { name: "asc" },
      })
    : [];

  return (
    <div className="space-y-6 animate-in fade-in duration-300 p-6">
      <div>
        <PageTitle title="Product Bundles" />
        <p className="text-slate-500 text-xs mt-1">
          Group multiple products together into attractive combo bundles with fixed discounts.
        </p>
      </div>

      <BundlesManagerClient
        bundles={bundles}
        stores={validStores}
        products={products}
        sellerId={sellerObjectId || rawSellerId}
      />
    </div>
  );
}
