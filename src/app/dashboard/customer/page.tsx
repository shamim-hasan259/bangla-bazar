import React from "react";
import Account from "./_components/Account";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/index";
import { redirect } from "next/navigation";

const CustomerPage = async () => {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/customer/login");
  }

  const sessionUser = session.user as any;
  const customer = await prisma.customer.findFirst({
    where: {
      OR: [
        { id: sessionUser.id },
        { phone: sessionUser.phone || undefined },
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

  return (
    <div className="min-h-screen w-full">
      <Account customer={customer as any} />
    </div>
  );
};

export default CustomerPage;
