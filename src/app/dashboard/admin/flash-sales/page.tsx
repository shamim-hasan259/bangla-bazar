import PageTitle from "@/components/ui/PageTitle";
import React from "react";
import prisma from "@/index";
import FlashSalesList from "./_components/FlashSalesList";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminFlashSalesPage() {
  const flashSales = await prisma.flashSale.findMany({
    orderBy: { startDate: "desc" },
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
      {/* Header action bar */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <PageTitle title="Marketplace Flash Sale Slots" />
          <p className="text-slate-550 text-xs mt-1">
            Schedule site-wide lightning flash sale slots, set stock pools, and manage seller integrations.
          </p>
        </div>
        <Link href="/dashboard/admin/flash-sales/create">
          <Button className="rounded-2xl bg-[#1E60ED] hover:bg-blue-600 text-white font-bold text-xs gap-1.5 px-5 py-5 shadow-md shadow-blue-500/10 transition-all shrink-0">
            <Plus className="w-4 h-4" /> Schedule Flash Sale
          </Button>
        </Link>
      </div>

      <FlashSalesList initialFlashSales={flashSales} />
    </div>
  );
}
