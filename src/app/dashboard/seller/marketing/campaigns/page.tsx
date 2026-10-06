import React from "react";
import prisma from "@/index";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import PageTitle from "@/components/ui/PageTitle";
import CampaignEnrollmentClient from "./CampaignEnrollmentClient";

export const dynamic = "force-dynamic";

export default async function SellerCampaignsHubPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/auth/login");
  }

  const sellerId = session.user.id;

  // Query active campaigns
  const campaigns = await prisma.campaign.findMany({
    where: {
      endDate: { gte: new Date() }
    },
    orderBy: { startDate: "asc" },
    include: {
      products: {
        where: { sellerId },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              photo: true
            }
          }
        }
      }
    }
  });

  // Query stores for store selection
  const stores = await prisma.store.findMany({
    where: { sellerId, deletedAt: null }
  });

  // Query seller products
  const products = await prisma.product.findMany({
    where: {
      sellerId: stores.length > 0 ? undefined : sellerId,
      storeId: stores.length > 0 ? { in: stores.map(s => s.id) } : undefined,
      status: "Active"
    },
    select: {
      id: true,
      name: true,
      price: true,
      storeId: true,
      categoryId: true,
      masterCategoryId: true
    }
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300 p-6">
      <div>
        <PageTitle title="Campaign Enrollment Hub" />
        <p className="text-slate-500 text-xs mt-1">
          Select an available campaign, choose your products, and apply custom discounts to participate.
        </p>
      </div>

      <CampaignEnrollmentClient
        campaigns={campaigns}
        stores={stores}
        products={products}
        sellerId={sellerId}
      />
    </div>
  );
}
