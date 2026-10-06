import prisma from "@/index";
import ManageProductsClient from "./_components/ManageProductsClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return <ManageProductsClient initialProducts={[]} hasStore={false} hasApprovedStore={false} />;
  }

  const seller = await prisma.seller.findFirst({
    where: {
      OR: [
        { id: session.user?.id },
        { phone: session.user?.phone || undefined },
        { email: session.user?.email || undefined },
      ],
    },
  });

  if (!seller) {
    return <ManageProductsClient initialProducts={[]} hasStore={false} hasApprovedStore={false} />;
  }

  const stores = await prisma.store.findMany({
    where: {
      sellerId: seller.id,
      deletedAt: null,
    },
    select: {
      id: true,
      status: true,
      storeNameEn: true,
    },
  });

  const hasStore = stores.length > 0;
  const hasApprovedStore = stores.some((s) => s.status === "Approved");

  const data: any = await prisma.product.findMany({
    where: {
      sellerId: seller.id,
    },
    select: {
      id: true,
      name: true,
      photo: true,
      price: true,
      tp: true,
      mrp: true,
      articleCode: true,
      ean: true,
      closingQty: true,
      availableQty: true,
      stock: true,
      salesType: true,
      website: true,
      status: true,
      category: {
        select: {
          name: true,
        },
      },
      unit: {
        select: {
          name: true,
          symbol: true,
        },
      },
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <ManageProductsClient
      initialProducts={data}
      hasStore={hasStore}
      hasApprovedStore={hasApprovedStore}
    />
  );
}
