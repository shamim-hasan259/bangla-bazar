import PageTitle from "@/components/ui/PageTitle";
import React from "react";
import OrderTabLists from "./_components/OrderTabLists";
import prisma from "@/index";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const Orders = async () => {
  const session = await getServerSession(authOptions);
  const sellerId = session?.user?.type === "seller" ? session.user.id : undefined;

  const orders = await prisma.sales.findMany({
    where: {
      sellerIds: sellerId ? { has: sellerId } : undefined
    }
  });

  return (
    <div className=" space-y-6">
      <PageTitle title="Order Management" />
      <OrderTabLists data={orders} />
    </div>
  );
};

export default Orders;
