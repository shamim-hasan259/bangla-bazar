import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getSellerNotifications } from "./_action";
import SellerNotificationsClient from "./SellerNotificationsClient";
import prisma from "@/index";

export const metadata = {
  title: "Notifications | Seller Dashboard",
  description: "View and manage seller updates, customer orders, and store alerts.",
};

export default async function SellerNotificationsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/seller/signin");
  }

  // Find the seller record
  const sellerId = session.user.id || "";
  const isObjectId = typeof sellerId === "string" && /^[0-9a-fA-F]{24}$/.test(sellerId);

  const seller = await prisma.seller.findFirst({
    where: {
      OR: [
        ...(isObjectId ? [{ id: sellerId }] : []),
        { phone: (session.user as any).phone || undefined },
        { email: session.user.email || undefined },
      ],
    },
    select: { id: true, sellerId: true },
  });

  const actualSellerId = seller?.id || sellerId || "";
  const initialNotifications = await getSellerNotifications(actualSellerId);
  return (
    <div className="container mx-auto px-4 md:px-6 py-4">
      <SellerNotificationsClient
        initialNotifications={JSON.parse(JSON.stringify(initialNotifications))}
        sellerId={actualSellerId}
      />
    </div>
  );
}
