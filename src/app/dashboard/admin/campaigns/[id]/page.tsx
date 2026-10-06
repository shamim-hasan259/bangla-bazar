import React from "react";
import prisma from "@/index";
import CampaignProductList from "../_components/CampaignProductList";
import CampaignCreateForm from "../_components/CampaignCreateForm";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface CampaignDetailsPageProps {
  params: Promise<{ id: string }>;
}

const isValidObjectId = (id: string) => /^[0-9a-fA-F]{24}$/.test(id);

export default async function AdminCampaignDetailsPage({ params }: CampaignDetailsPageProps) {
  const { id } = await params;

  if (id === "create") {
    const categories = await prisma.category.findMany({
      select: { id: true, name: true },
      where: { parentId: null } // main category
    });

    return (
      <div className="p-6 md:p-8 animate-in fade-in duration-300">
        <CampaignCreateForm categories={categories} />
      </div>
    );
  }

  if (!isValidObjectId(id)) {
    notFound();
  }

  const campaign = await prisma.campaign.findUnique({
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

  if (!campaign) {
    notFound();
  }

  return (
    <div className="p-6 md:p-8 animate-in fade-in duration-300">
      <CampaignProductList campaign={campaign} />
    </div>
  );
}

