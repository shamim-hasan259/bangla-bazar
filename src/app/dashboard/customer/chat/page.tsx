import React from "react";
import prisma from "@/index";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import PageTitle from "@/components/ui/PageTitle";
import CustomerChatManager from "./_components/CustomerChatManager";
import { ShieldAlert } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CustomerChatPage({
  searchParams,
}: {
  searchParams?: Promise<{ storeId?: string; productId?: string }>;
}) {
  const session = await getServerSession(authOptions);
  const resolvedParams = searchParams ? await searchParams : {};
  const { storeId, productId } = resolvedParams;

  if (!session || !session.user) {
    const callback = storeId
      ? `/dashboard/customer/chat?storeId=${storeId}${productId ? `&productId=${productId}` : ""}`
      : "/dashboard/customer/chat";
    redirect(`/auth/customer/login?callbackUrl=${encodeURIComponent(callback)}`);
  }

  const sessionUser = session.user as any;
  // Find Customer profile in DB
  const customer = await prisma.customer.findFirst({
    where: {
      OR: [
        { id: sessionUser.id },
        { phone: sessionUser.phone || undefined },
        { email: sessionUser.email || undefined },
      ],
    },
  });

  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
        <ShieldAlert className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-lg font-bold text-slate-800">Customer Account Not Found</h3>
        <p className="text-slate-500 text-sm mt-1">Please log in with a customer account to access messaging.</p>
      </div>
    );
  }

  // Fetch conversations belonging to this customer
  const rawConversations = await prisma.conversation.findMany({
    where: {
      customerId: customer.id,
    },
    include: {
      store: {
        select: {
          id: true,
          storeNameEn: true,
          storeLogo: true,
          slug: true,
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

  // Map dates safely
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
        <PageTitle title="Store Messaging" />
        <p className="text-slate-450 text-xs mt-1">
          Chat with marketplace stores, send product inquiry coordinates, and ask questions.
        </p>
      </div>

      <CustomerChatManager
        customerId={customer.id}
        initialConversations={conversations}
      />
    </div>
  );
}
