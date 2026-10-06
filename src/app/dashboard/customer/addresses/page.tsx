import React from "react";
import PageTitle from "@/components/ui/PageTitle";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/index";
import BillingAddressForm from "../setting/_components/BillingAddressForm";

export default async function CustomerAddressesPage() {
  const session = await getServerSession(authOptions);
  const sessionUser = session?.user as any;
  if (!sessionUser?.id) return <div className="p-8">Unauthorized</div>;

  const customer = await prisma.customer.findFirst({
    where: {
      OR: [
        { id: sessionUser.id },
        { phone: sessionUser.phone || undefined },
      ],
    },
  });

  if (!customer) return <div className="p-8">Customer not found</div>;

  return (
    <div className="space-y-6">
      <PageTitle title="Digital Address Book" />
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">Primary Shipping & Billing Address</h3>
        <p className="text-xs text-slate-500 mb-6">Manage your default delivery coordinates for seamless 1-click checkout.</p>
        <BillingAddressForm customer={customer} />
      </div>
    </div>
  );
}
