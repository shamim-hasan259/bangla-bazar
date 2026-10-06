import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import PaymentMethodList from "./_components/PaymentMethodList";
import { getPaymentMethods } from "./_action";
import prisma from "@/index";

const PaymentMethods = async () => {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return (
      <div className="p-8 flex items-center justify-center h-[60vh]">
        <p>Please log in to manage your payment methods.</p>
      </div>
    );
  }

  const sessionUser = session.user as any;
  const customer = await prisma.customer.findFirst({
    where: {
      OR: [
        { id: sessionUser?.id },
        { phone: sessionUser?.phone || undefined },
      ],
    },
  });

  if (!customer) {
    return (
      <div className="p-8 flex items-center justify-center h-[60vh]">
        <p>Customer profile not found.</p>
      </div>
    );
  }

  const { data: methods = [] } = await getPaymentMethods(customer.id);

  return (
    <div className="container mx-auto py-10 pt-14 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Payment Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your saved cards and payment preferences.</p>
      </div>

      <PaymentMethodList initialMethods={methods as any} customerId={customer.id} />
    </div>
  );
};

export default PaymentMethods;
