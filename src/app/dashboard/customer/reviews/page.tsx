import React from "react";
import PageTitle from "@/components/ui/PageTitle";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/index";
import CustomerReviewsClient from "./CustomerReviewsClient";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function CustomerReviewsPage() {
  const session = await getServerSession(authOptions);
  const sessionUser = session?.user as any;
  if (!sessionUser) {
    redirect("/auth/customer/login");
  }

  const lookupId = sessionUser.id || sessionUser.customerId;
  const lookupPhone = sessionUser.phone;
  const isObjectId = typeof lookupId === "string" && /^[0-9a-fA-F]{24}$/.test(lookupId);

  const customer = await prisma.customer.findFirst({
    where: {
      OR: [
        ...(isObjectId ? [{ id: lookupId }] : []),
        ...(lookupId ? [{ customerId: lookupId }, { id: lookupId }] : []),
        ...(lookupPhone ? [{ phone: lookupPhone }] : []),
      ],
    },
    select: { id: true },
  });

  if (!customer) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Customer record not found.</p>
      </div>
    );
  }

  const reviews = await prisma.review.findMany({
    where: { customerId: customer.id },
    include: {
      product: {
        select: { id: true, name: true, photo: true, price: true },
      },
      seller: {
        select: { name: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Serialize dates for client component
  const serializedReviews = reviews.map((r) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <div>
        <PageTitle title="My Submitted Reviews" />
        <p className="text-xs text-slate-500 mt-1">
          View and manage all ratings and feedback you posted on purchased products ({reviews.length} total reviews).
        </p>
      </div>

      <CustomerReviewsClient initialReviews={serializedReviews} />
    </div>
  );
}
