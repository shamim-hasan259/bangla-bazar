import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/index";
import StoreStockClient from "./_components/StoreStockClient";
import PageTitle from "@/components/ui/PageTitle";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function StoreStockPage({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) {
  const session = await getServerSession(authOptions);
  const { storeId } = await params;

  if (!session || !session.user) {
    redirect("/auth/login");
  }

  // Load all products belonging to this specific store
  const products = await prisma.product.findMany({
    where: {
      storeId: storeId,
    },
    include: {
      variantsList: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Map database model fields to flat structures expected in client component
  const mappedProducts = products.map((p) => ({
    id: p.id,
    name: p.name,
    photo: p.photo,
    price: p.price,
    mrp: p.mrp,
    stock: p.stock || 0,
    hasVariants: p.hasVariants || false,
    variantsList: (p.variantsList || []).map((v) => ({
      id: v.id,
      sku: v.sku,
      color: v.color,
      size: v.size,
      price: v.price,
      mrp: v.mrp,
      stock: v.stock || 0,
      availability: v.availability,
    })),
  }));

  return (
    <main className="flex min-h-screen flex-col gap-6 w-full bg-[#f8fafc] dark:bg-slate-900">
      <div className="flex-col flex w-full space-y-4">
        {/* Title */}
        <div className="flex items-center justify-between">
          <PageTitle title="Store Stock Management" />
        </div>

        {/* Client side dashboard */}
        <StoreStockClient storeId={storeId} initialProducts={mappedProducts} />
      </div>
    </main>
  );
}
