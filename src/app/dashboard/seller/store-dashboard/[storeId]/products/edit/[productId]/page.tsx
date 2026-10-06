import React from "react";
import prisma from "@/index";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import ProductForm from "../../../../../products/_components/ProductForm";

export const dynamic = "force-dynamic";

export default async function EditStoreProductPage({
  params,
}: {
  params: Promise<{ storeId: string; productId: string }>;
}) {
  const session = await getServerSession(authOptions);
  const { storeId, productId } = await params;

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

  // Find Product and ensure it belongs to this store
  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      storeId: store.id,
    },
    include: {
      variantsList: true,
    },
  });

  if (!product) {
    redirect(`/dashboard/seller/store-dashboard/${store.id}/products`);
  }

  // Format product dates and objects for form prefill compatibility
  const formattedProduct = {
    ...product,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  };

  return (
    <div className="pb-10 animate-in fade-in duration-300">
      <ProductForm
        entry={formattedProduct}
        title={`Edit Product - ${product.name}`}
        storeId={store.id}
        restrictMasterCategoryId={store.masterCategoryId}
      />
    </div>
  );
}
