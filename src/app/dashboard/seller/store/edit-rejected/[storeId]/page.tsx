import React from "react";
import prisma from "@/index";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import ResubmitStoreForm from "./_components/ResubmitStoreForm";
import PageTitle from "@/components/ui/PageTitle";
import { ShieldAlert } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function EditRejectedStorePage({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) {
  const session = await getServerSession(authOptions);
  const { storeId } = await params;

  if (!session || !session.user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
        <ShieldAlert className="w-12 h-12 text-red-500 mb-4 animate-bounce" />
        <h3 className="text-lg font-bold text-slate-800">Access Denied</h3>
        <p className="text-slate-500 text-sm mt-1">Please log in to edit store settings.</p>
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
    redirect("/dashboard/seller");
  }

  // Find Store
  const store = await prisma.store.findFirst({
    where: {
      id: storeId,
      sellerId: seller.id,
      deletedAt: null,
    },
  });

  if (!store) {
    redirect("/dashboard/seller/store");
  }

  // Only allow resubmission if status is Rejected
  if (store.status !== "Rejected") {
    redirect("/dashboard/seller/store");
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

  const formattedStore = {
    ...store,
    status: store.status as string,
  };

  return (
    <div className="space-y-6">
      <div>
        <PageTitle title="Resubmit Store Application" />
        <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">
          Review guidelines, update errors, and resubmit for approval.
        </p>
      </div>

      <ResubmitStoreForm store={formattedStore} categories={categories} />
    </div>
  );
}
