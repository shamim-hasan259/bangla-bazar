import React from "react";
import prisma from "@/index";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import PageTitle from "@/components/ui/PageTitle";
import FeaturedProductsManager from "./_components/FeaturedProductsManager";

export const dynamic = "force-dynamic";

export default async function StoreFeaturedProductsPage({
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

  // Block access if Pending or Rejected
  if (store.status === "Pending" || store.status === "Rejected") {
    redirect("/dashboard/seller/store");
  }

  // Fetch all products belonging to this store
  const allProducts = await prisma.product.findMany({
    where: {
      storeId: store.id,
    },
    select: {
      id: true,
      name: true,
      photo: true,
      price: true,
      stock: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Fetch all featured product records for this store
  const featured = await prisma.storeFeaturedProduct.findMany({
    where: {
      storeId: store.id,
    },
    select: {
      productId: true,
    },
  });

  const featuredIds = new Set(featured.map((f) => f.productId));

  const mappedProducts = allProducts.map((p) => ({
    id: p.id,
    name: p.name,
    photo: p.photo,
    price: p.price,
    stock: p.stock,
    isFeatured: featuredIds.has(p.id),
  }));

  return (
    <div className="space-y-6">
      <div>
        <PageTitle title="Store Display Showcase" />
        <p className="text-slate-450 text-xs mt-1">
          Pick your top featured items to highlight on your digital storefront.
        </p>
      </div>

      <FeaturedProductsManager
        storeId={store.id}
        initialProducts={mappedProducts}
      />
    </div>
  );
}
