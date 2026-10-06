import React from "react";
import prisma from "@/index";
import ProductCard from "@/components/home/ProductCard";
import { Percent } from "lucide-react";

interface CampaignPlacementProps {
  section: any;
}

export default async function CampaignPlacement({ section }: CampaignPlacementProps) {
  try {
    let campaignId = section.campaignId;

    if (!campaignId) {
      const activeCampaign = await prisma.campaign.findFirst({
        where: {
          endDate: { gte: new Date() }
        },
        orderBy: { startDate: "asc" }
      });
      if (activeCampaign) {
        campaignId = activeCampaign.id;
      }
    }

    if (!campaignId) return null;

    // Query Campaign details & approved items
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        products: {
          where: { status: "Approved" },
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                mrp: true,
                photo: true,
              }
            }
          }
        }
      }
    });

    if (!campaign || new Date(campaign.endDate) < new Date()) return null;
    const campaignProducts = campaign.products.map(cp => {
      if (!cp.product) return null;
      const discountedPrice = cp.product.price - (cp.product.price * (cp.discountPercentage / 100));
      return {
        ...cp.product,
        price: discountedPrice,
        mrp: cp.product.price,
      };
    }).filter(Boolean);

    if (campaignProducts.length === 0) return null;

    return (
      <div className="space-y-4 pb-8">
        {/* Title Header without external route link */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-6 bg-slate-900 dark:bg-white rounded-full" />
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
              {section?.titleEn || "Seasonal Mega Campaign"}
            </h2>
          </div>
        </div>

        {/* Banner Display Card (Non-clickable static showcase) */}
        <div className="relative h-48 w-full rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <img src={campaign.banner} alt={campaign.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-transparent to-transparent flex flex-col justify-center p-6 text-white">
            <span className="bg-slate-900 text-white w-fit px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider mb-2 flex items-center gap-1.5 shadow-sm">
              <Percent className="w-3.5 h-3.5" /> Active Event
            </span>
            <h2 className="text-xl font-bold">{campaign.name}</h2>
            <p className="text-xs text-slate-200 mt-1 max-w-md line-clamp-2">{campaign.description}</p>
          </div>
        </div>

        {/* Campaign Product Grid (12 items = exactly 2 rows of 6 columns on desktop) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 pt-2">
          {campaignProducts.slice(0, 12).map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    );
  } catch (error) {
    console.error("CampaignPlacement Error:", error);
    return null;
  }
}
