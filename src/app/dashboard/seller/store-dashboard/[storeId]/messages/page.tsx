import React from "react";
import prisma from "@/index";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import PageTitle from "@/components/ui/PageTitle";
import StoreChatManager from "./_components/StoreChatManager";

export const dynamic = "force-dynamic";

export default async function StoreMessagesPage({
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
  });

  if (!store) {
    redirect("/dashboard/seller/store");
  }

  // Only allow if approved, suspended, or disabled
  if (store.status === "Pending" || store.status === "Rejected") {
    redirect("/dashboard/seller/store");
  }

  // Fetch initial conversations belonging to this store
  const rawConversations = await prisma.conversation.findMany({
    where: {
      storeId: store.id,
    },
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          photo: true,
          phone: true,
        },
      },
      messages: {
        take: 1,
        orderBy: {
          createdAt: "desc",
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  // Map database dates safely for client serialization
  const conversations = rawConversations.map((c) => ({
    ...c,
    updatedAt: c.updatedAt.toISOString(),
    messages: c.messages.map((m) => ({
      text: m.text,
      createdAt: m.createdAt.toISOString(),
    })),
  }));

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <PageTitle title="Customer Messaging" />
        <p className="text-slate-450 text-xs mt-1">
          Chat with customers, address inquiries about your products, and process orders.
        </p>
      </div>

      <StoreChatManager
        storeId={store.id}
        initialConversations={conversations}
      />
    </div>
  );
}
