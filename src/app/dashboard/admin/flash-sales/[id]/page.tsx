import React from "react";
import prisma from "@/index";
import FlashSaleProductList from "../_components/FlashSaleProductList";
import FlashSaleCreateForm from "../_components/FlashSaleCreateForm";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface FlashSaleDetailsPageProps {
  params: Promise<{ id: string }>;
}

const isValidObjectId = (id: string) => /^[0-9a-fA-F]{24}$/.test(id);

export default async function AdminFlashSaleDetailsPage({ params }: FlashSaleDetailsPageProps) {
  const { id } = await params;

  if (id === "create") {
    return (
      <div className="p-6 md:p-8 animate-in fade-in duration-300">
        <FlashSaleCreateForm />
      </div>
    );
  }

  if (!isValidObjectId(id)) {
    notFound();
  }

  const flashSale = await prisma.flashSale.findUnique({
    where: { id },
    include: {
      products: {
        include: {
          product: {
            select: { name: true, price: true, photo: true },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!flashSale) {
    notFound();
  }

  return (
    <div className="p-6 md:p-8 animate-in fade-in duration-300">
      <FlashSaleProductList flashSale={flashSale} />
    </div>
  );
}

