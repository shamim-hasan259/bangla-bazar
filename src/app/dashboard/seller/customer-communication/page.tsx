import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/index";
import SellerMessagesClient from "./SellerMessagesClient";

export const metadata = {
  title: "Messages | Seller Dashboard",
  description: "View and reply to customer messages for your store.",
};

export const dynamic = "force-dynamic";

export default async function SellerMessagesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/seller/signin");
  }

  const sessionUser = session.user as any;
  const sessionUserId = sessionUser.id || "";
  const isObjectId =
    typeof sessionUserId === "string" && /^[0-9a-fA-F]{24}$/.test(sessionUserId);

  // Build safe OR conditions for finding the seller
  const sellerConditions: any[] = [
    ...(isObjectId ? [{ id: sessionUserId }] : []),
    ...(sessionUser.sellerId ? [{ sellerId: sessionUser.sellerId }] : []),
    ...(sessionUser.phone ? [{ phone: sessionUser.phone }] : []),
    ...(sessionUser.email ? [{ email: sessionUser.email }] : []),
  ];

  let seller = null;
  if (sellerConditions.length > 0) {
    try {
      seller = await prisma.seller.findFirst({
        where: {
          OR: sellerConditions,
        },
        select: { id: true, sellerId: true, name: true },
      });
    } catch (err) {
      console.error("Error finding seller:", err);
    }
  }

  // Resolve stores owned by this seller safely
  let stores: { id: string; storeNameEn: string; storeLogo: string | null }[] = [];
  const validSellerId = seller?.id || (isObjectId ? sessionUserId : null);

  if (validSellerId) {
    try {
      stores = await prisma.store.findMany({
        where: {
          sellerId: validSellerId,
          deletedAt: null,
        },
        select: { id: true, storeNameEn: true, storeLogo: true },
      });
    } catch (err) {
      console.error("Error finding seller stores:", err);
    }
  }

  if (stores.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-500 gap-3">
        <p className="text-sm font-medium">No store found for this account.</p>
        <p className="text-xs text-slate-400">Create a store to start receiving messages.</p>
      </div>
    );
  }

  const primaryStore = stores[0];
  const storeIds = stores.map((s) => s.id);

  // Fetch all conversations for this seller's stores
  let conversations: any[] = [];
  try {
    conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { storeId: { in: storeIds } },
          ...(seller?.id ? [{ sellerId: seller.id }] : []),
        ],
      },
      include: {
        customer: {
          select: { id: true, name: true, photo: true, phone: true },
        },
        store: {
          select: { id: true, storeNameEn: true, storeLogo: true },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { updatedAt: "desc" },
    });
  } catch (err) {
    console.error("Error fetching conversations:", err);
    conversations = [];
  }

  return (
    <div className="h-[calc(100vh-6rem)]">
      <SellerMessagesClient
        sellerId={seller?.id || (isObjectId ? sessionUserId : undefined)}
        storeId={primaryStore.id}
        storeName={primaryStore.storeNameEn || "Your Store"}
        storeIds={storeIds}
        initialConversations={JSON.parse(JSON.stringify(conversations))}
      />
    </div>
  );
}
