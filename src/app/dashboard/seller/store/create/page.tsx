import React from "react";
import prisma from "@/index";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import StoreSetupForm from "./_components/StoreSetupForm";
import PageTitle from "@/components/ui/PageTitle";
import { ShieldAlert } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CreateStorePage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
        <ShieldAlert className="w-12 h-12 text-red-500 mb-4 animate-bounce" />
        <h3 className="text-lg font-bold text-slate-800">Access Denied</h3>
        <p className="text-slate-500 text-sm mt-1">Please log in to register a store.</p>
      </div>
    );
  }

  // Find Seller
  const seller = await prisma.seller.findFirst({
    where: {
      OR: [
        { id: session.user.id },
        { phone: session.user.phone || undefined },
        { email: session.user.email || undefined },
      ],
    },
  });

  if (!seller) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
        <ShieldAlert className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-lg font-bold text-slate-800">Seller Account Not Found</h3>
        <p className="text-slate-500 text-sm mt-1">Please configure your seller account details first.</p>
      </div>
    );
  }

  // Fetch active categories
  const allCategories = await prisma.category.findMany({
    where: {
      status: "Active",
    },
    select: {
      id: true,
      name: true,
      parentId: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  // Filter root categories (master categories) in memory
  const categories = allCategories.filter((c) => !c.parentId);

  return (
    <div className="space-y-6">
      <div>
        <PageTitle title="Register New Store" />
        <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">
          Set up a specialized storefront for your products.
        </p>
      </div>

      <StoreSetupForm seller={seller} categories={categories} />
    </div>
  );
}
