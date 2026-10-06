import React from "react";
import PageTitle from "@/components/ui/PageTitle";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/index";
import SellerReviewReplyClient from "./SellerReviewReplyClient";

export default async function SellerReviewsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return <div className="p-8">Unauthorized</div>;

  const seller = await prisma.seller.findFirst({
    where: {
      OR: [
        { id: session.user.id },
        { phone: session.user.phone || undefined },
      ],
    },
  });

  if (!seller) return <div className="p-8">Seller not found</div>;

  const reviews = await prisma.review.findMany({
    where: {
      product: { sellerId: seller.id },
    },
    include: {
      product: { select: { id: true, name: true, photo: true } },
      customer: { select: { name: true, photo: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <PageTitle title="Review Response Management Hub" />
      <p className="text-xs text-slate-500">Monitor buyer product ratings and reply directly to customer feedback.</p>

      <SellerReviewReplyClient initialReviews={reviews as any} sellerId={seller.id} />
    </div>
  );
}
