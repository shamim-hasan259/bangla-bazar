import React from "react";
import prisma from "@/index";
import CampaignCreateForm from "../_components/CampaignCreateForm";

export const dynamic = "force-dynamic";

export default async function AdminCampaignCreatePage() {
  // Fetch active categories
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
