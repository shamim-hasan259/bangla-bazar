import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/index";
import StockClient from "./_components/StockClient";
import PageTitle from "@/components/ui/PageTitle";

export const dynamic = "force-dynamic";

export default async function StockPage() {
  const session = await getServerSession(authOptions);
  let sellerId = session?.user?.type === "seller" ? session.user.id : undefined;

  const query: any = {};
  if (sellerId) {
    query.sellerId = sellerId;
  }

  // Load all products with their variants
  const products = await prisma.product.findMany({
    where: query,
    include: {
      variantsList: true
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  // Map database model fields to make sure they match flat structures expected in client component
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
    }))
  }));

  return (
    <main className="flex min-h-screen flex-col gap-6 w-full   bg-[#f8fafc] dark:bg-slate-900">
      <div className="flex-col flex w-full space-y-4">
        {/* Title */}
        <div className="flex items-center justify-between">
          <PageTitle title="Stock Management" />
        </div>

        {/* Client side dashboard */}
        <StockClient initialProducts={mappedProducts} />
      </div>
    </main>
  );
}
