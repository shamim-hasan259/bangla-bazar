import PageTitle from "@/components/ui/PageTitle";
import React from "react";
import prisma from "@/index";
import CampaignList from "./_components/CampaignList";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminCampaignsPage() {
  const campaigns = await prisma.campaign.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      products: {
        include: {
          product: {
            select: { name: true, price: true },
          },
        },
      },
    },
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300 p-6 md:p-8">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <PageTitle title="Mega Campaign Management" />
          <p className="text-slate-500 text-xs mt-1">
            Create site-wide discount events, approve seller products, and manage category exclusions.
          </p>
        </div>
        <Link href="/dashboard/admin/campaigns/create">
          <Button className="rounded-2xl bg-[#1E60ED] hover:bg-blue-600 text-white font-bold text-xs gap-1.5 px-5 py-5 shadow-md shadow-blue-500/10 transition-all shrink-0">
            <Plus className="w-4 h-4" /> Launch New Campaign
          </Button>
        </Link>
      </div>

      <CampaignList initialCampaigns={campaigns} />
    </div>
  );
}
