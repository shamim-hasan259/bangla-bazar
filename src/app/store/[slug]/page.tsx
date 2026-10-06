import React from "react";
import prisma from "@/index";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import StorePageClient from "./_components/StorePageClient";
import { ShieldAlert, Store as StoreIcon } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function PublicStoreFrontPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await getServerSession(authOptions);
  const { slug } = await params;

  // Fetch store by slug
  const store = await prisma.store.findUnique({
    where: {
      slug: slug,
    },
    include: {
      masterCategory: true,
      settings: true,
    },
  });

  if (!store || store.deletedAt !== null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-center p-8 bg-slate-50">
        <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center mb-4">
          <StoreIcon className="w-8 h-8 text-slate-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Storefront Not Found</h2>
        <p className="text-slate-500 text-xs mt-1 max-w-sm">
          The requested store link is broken or has been removed. Check the slug address and try again.
        </p>
        <Link href="/" className="mt-6 text-[#1E60ED] font-bold text-xs hover:underline">
          Return to BanglaBazar Homepage
        </Link>
      </div>
    );
  }

  // Block access if Pending, Rejected or Suspended
  if (store.status === "Pending" || store.status === "Rejected" || store.status === "Suspended") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-center p-8 bg-slate-50">
        <div className="w-16 h-16 rounded-3xl bg-red-50 flex items-center justify-center mb-4 border border-red-100">
          <ShieldAlert className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Store Access Suspended</h2>
        <p className="text-slate-500 text-xs mt-1 max-w-sm leading-relaxed">
          {store.status === "Pending"
            ? "This store storefront application is awaiting administrator approval."
            : "This storefront is offline. The administrator has locked or suspended access to this seller store."}
        </p>
        <Link href="/" className="mt-6 text-[#1E60ED] font-bold text-xs hover:underline">
          Return to BanglaBazar Homepage
        </Link>
      </div>
    );
  }

  // Fetch Featured Products (through featured product mappings)
  const rawFeatured = await prisma.storeFeaturedProduct.findMany({
    where: {
      storeId: store.id,
    },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          photo: true,
          price: true,
          stock: true,
          createdAt: true,
        },
      },
    },
    orderBy: {
      order: "asc",
    },
  });

  let featuredProducts = rawFeatured.map((rf) => rf.product).filter((p) => p !== null);

  // Fallback: If no featured collections are configured, show first 10 items
  if (featuredProducts.length === 0) {
    featuredProducts = await prisma.product.findMany({
      where: {
        storeId: store.id,
      },
      select: {
        id: true,
        name: true,
        photo: true,
        price: true,
        stock: true,
        createdAt: true,
      },
      take: 10,
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  // Fetch all products
  const allProducts = await prisma.product.findMany({
    where: {
      storeId: store.id,
    },
    select: {
      id: true,
      name: true,
      photo: true,
      price: true,
      stock: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Check customer session and follow status
  let customerId: string | null = null;
  let isFollowing = false;

  if (session && session.user) {
    const customer = await prisma.customer.findFirst({
      where: {
        OR: [
          { id: session.user.id },
          { phone: session.user.phone || undefined },
        ],
      },
    });

    if (customer) {
      customerId = customer.id;
      isFollowing = store.followerIds?.includes(customer.id) ?? false;
    }
  }

  // Safe mapping of dates/objects for client components
  const formatProduct = (p: any) => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
  });

  const formattedFeatured = featuredProducts.map(formatProduct);
  const formattedAll = allProducts.map(formatProduct);

  const formattedStore = {
    ...store,
    createdAt: store.createdAt.toISOString(),
    updatedAt: store.updatedAt.toISOString(),
    deletedAt: store.deletedAt ? store.deletedAt.toISOString() : null,
    followerIds: store.followerIds || [],
    settings: store.settings
      ? {
          ...store.settings,
          vacationStart: store.settings.vacationStart ? store.settings.vacationStart.toISOString() : null,
          vacationEnd: store.settings.vacationEnd ? store.settings.vacationEnd.toISOString() : null,
        }
      : null,
  };

  return (
    <StorePageClient
      store={formattedStore as any}
      featuredProducts={formattedFeatured}
      allProducts={formattedAll}
      customerId={customerId}
      isInitiallyFollowing={isFollowing}
    />
  );
}
