import React from "react";
import prisma from "@/index";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import PageTitle from "@/components/ui/PageTitle";
import StoreProductsManager from "./_components/StoreProductsManager";

export const dynamic = "force-dynamic";

export default async function StoreProductsListPage({
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

  // Find Store
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

  // Only allow if approved, suspended, or disabled
  if (store.status === "Pending" || store.status === "Rejected") {
    redirect("/dashboard/seller/store");
  }

  // Fetch only this store's products
  const products = await prisma.product.findMany({
    where: {
      storeId: store.id,
    },
    select: {
      id: true,
      name: true,
      photo: true,
      price: true,
      tp: true,
      mrp: true,
      articleCode: true,
      ean: true,
      closingQty: true,
      availableQty: true,
      stock: true,
      salesType: true,
      website: true,
      status: true,
      createdAt: true,
      category: {
        select: {
          name: true,
        },
      },
      unit: {
        select: {
          name: true,
          symbol: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const formattedProducts = products.map((p) => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
  }));

  return (
    <div className="w-full animate-in fade-in duration-300">
      <StoreProductsManager
        storeId={store.id}
        initialProducts={formattedProducts}
        storeName={store.storeNameEn}
      />
    </div>
  );
}
