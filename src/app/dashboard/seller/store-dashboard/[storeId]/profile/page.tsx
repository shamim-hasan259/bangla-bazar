import React from "react";
import prisma from "@/index";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import PageTitle from "@/components/ui/PageTitle";
import StoreProfileForm from "./_components/StoreProfileForm";

export const dynamic = "force-dynamic";

export default async function StoreProfileSettingsPage({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) {
  const session = await getServerSession(authOptions);
  const { storeId } = await params;

  if (!session || !session.user) {
    redirect("/auth/login");
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
    include: {
      settings: true,
      paymentSettings: true,
    },
  });

  if (!store) {
    redirect("/dashboard/seller/store");
  }

  // Defensively ensure settings and payment relations exist for legacy data
  let settings = store.settings;
  if (!settings) {
    settings = await prisma.storeSettings.create({
      data: {
        storeId: store.id,
      },
    });
  }

  let paymentSettings = store.paymentSettings;
  if (!paymentSettings) {
    paymentSettings = await prisma.storePaymentSettings.create({
      data: {
        storeId: store.id,
      },
    });
  }

  const formattedStore = {
    ...store,
    settings,
    paymentSettings,
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <PageTitle title="Store Profile & Settings" />
        <p className="text-slate-450 text-xs mt-1">
          Customize hours of operation, terms of business, bank coordinates, and print your storefront QR Code.
        </p>
      </div>

      <StoreProfileForm store={formattedStore} />
    </div>
  );
}
