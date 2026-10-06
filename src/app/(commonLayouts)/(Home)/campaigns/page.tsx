export const dynamic = "force-dynamic";

import React from "react";
import prisma from "@/index";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/home/ProductCard";
import { Percent, Calendar, ShoppingBag } from "lucide-react";
import Link from "next/link";

export default async function CampaignsListingPage() {
  const now = new Date();

  // 1. Query all active campaigns
  const campaigns = await prisma.campaign.findMany({
    where: {
      endDate: { gte: now }
    },
    orderBy: { startDate: "asc" }
  });

  // 2. Query all approved campaign products from running events
  const approvedCampaignProducts = await prisma.campaignProduct.findMany({
    where: {
      status: "Approved",
      campaign: {
        endDate: { gte: now }
      }
    },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          price: true,
          mrp: true,
          photo: true,
        }
      },
      campaign: true
    }
  });

  // Map product properties with custom discount calculated
  const mappedProducts = approvedCampaignProducts.map(cp => {
    if (!cp.product) return null;
    const discountedPrice = cp.product.price - (cp.product.price * (cp.discountPercentage / 100));
    return {
      ...cp.product,
      price: discountedPrice,
      mrp: cp.product.price, // original price mapped as MRP
    };
  }).filter(Boolean);

  return (
    <div className="container mx-auto py-20 px-4 min-h-screen mt-10 text-xs">
      {/* Page Header */}
      <div className="mb-10 text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-800 dark:text-white">
          Mega Campaign Deals
        </h1>
        <p className="text-slate-500 text-sm max-w-lg mx-auto">
          Explore all ongoing promotional events and purchase custom seller campaign products at special rates.
        </p>
      </div>

      {/* Campaigns list cards */}
      <div className="space-y-6 mb-12">
        <h3 className="font-extrabold text-slate-700 dark:text-slate-350 text-xs uppercase tracking-wider">
          Active Events ({campaigns.length})
        </h3>
        
        {campaigns.length === 0 ? (
          <div className="text-center py-16 border border-dashed rounded-3xl text-slate-400 bg-slate-50/20">
            <Percent className="w-8 h-8 mx-auto mb-2 text-slate-350" />
            <p className="font-bold">No active megacampaigns today. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {campaigns.map((camp) => (
              <Card
                key={camp.id}
                className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden"
              >
                <div className="relative h-44 w-full overflow-hidden bg-slate-50">
                  <img src={camp.banner} alt={camp.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent flex flex-col justify-end p-6 text-white">
                    <h3 className="text-base font-bold leading-tight">{camp.name}</h3>
                    <p className="text-[10px] text-slate-200 mt-1 line-clamp-2">{camp.description}</p>
                  </div>
                </div>
                <CardContent className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1 text-slate-500 text-[10px]">
                    <p className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Timeline: {new Date(camp.startDate).toLocaleDateString()} - {new Date(camp.endDate).toLocaleDateString()}
                    </p>
                    <p className="font-bold text-slate-700 dark:text-slate-350">
                      * Min Discount: {camp.minDiscountPercentage}% Required
                    </p>
                  </div>
                  <Link href={`#all-products`}>
                    <Button className="bg-[#1E60ED] hover:bg-blue-600 text-white rounded-xl font-bold px-4 py-3 text-[10px]">
                      View Products
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Campaign Products Grid */}
      <div id="all-products" className="space-y-6 border-t pt-8">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-[#1E60ED]" />
          <h3 className="font-extrabold text-slate-700 dark:text-slate-350 text-xs uppercase tracking-wider">
            All Campaign Products ({mappedProducts.length})
          </h3>
        </div>

        {mappedProducts.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            No products have been approved for campaigns yet.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {mappedProducts.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
