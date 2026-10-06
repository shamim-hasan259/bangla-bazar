import React from "react";
import prisma from "@/index";
import FlashSalesClient from "./FlashSalesClient";

export const dynamic = "force-dynamic";

export default async function FlashSalesPage() {
  const products = await prisma.product.findMany({
    where: {
      status: "Active",
      website: "true",
    },
    select: {
      id: true,
      photo: true,
      name: true,
      price: true,
      tp: true,
      mrp: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const discountedProducts = products.filter(
    (product) => product.mrp && product.mrp > product.price
  );

  return <FlashSalesClient products={discountedProducts as any} />;
}
