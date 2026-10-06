import React from "react";

import OrderSummary from "./_components/OrderSummary";
import DeliveryAddressSheet from "./_components/DeliveryAddressSheet";
import prisma from "@/index";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";

const CheckoutPage = async () => {
  const session = await getServerSession(authOptions);

  if (!session) {
    return (
      <div className="container mx-auto py-20 text-center">
        <h1 className="text-2xl font-bold">Please log in to continue</h1>
      </div>
    );
  }

  const userRole = String((session.user as any)?.type || (session.user as any)?.role || "").toLowerCase();

  if (userRole === "admin") {
    return (
      <div className="container mx-auto py-20 px-4 min-h-[60vh] flex flex-col items-center justify-center text-center">
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-3xl p-8 max-w-lg shadow-sm space-y-4">
          <div className="w-14 h-14 bg-amber-100 dark:bg-amber-900/60 rounded-full flex items-center justify-center mx-auto text-amber-600 dark:text-amber-300">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Admin Order Restriction
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Admin accounts are not permitted to place product orders. Please switch to or sign in with a customer account.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              href="/dashboard/admin"
              className="bg-primary hover:bg-blue-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all"
            >
              Go to Admin Dashboard
            </Link>
            <Link
              href="/auth/customer/login?callbackUrl=/checkout"
              className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold px-5 py-2.5 rounded-xl transition-all"
            >
              Sign In as Customer
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const sessionUser = session?.user as {
    id?: string;
    customerId?: string;
    email?: string;
    phone?: string;
  } | undefined;

  const customer = sessionUser?.id || sessionUser?.customerId ? await prisma.customer.findFirst({
    where: {
      OR: [
        ...(sessionUser?.id ? [{ id: sessionUser.id }] : []),
        ...(sessionUser?.customerId ? [{ customerId: sessionUser.customerId }] : []),
        ...(sessionUser?.email ? [{ email: sessionUser.email }] : []),
      ],
    },
  }) : null;

  return (
    <div className="container mx-auto pb-10 pt-10 px-4">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      <div className="grid grid-cols-1 lg:grid-cols-9 gap-10">
        <DeliveryAddressSheet customer={(customer || { id: "", name: "", phone: "", email: "", address: [] }) as any} />
        <OrderSummary customerId={customer?.id} />
      </div>
    </div>
  );
};

export default CheckoutPage;
