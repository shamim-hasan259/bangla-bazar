import React from "react";
import prisma from "@/index";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import ProductForm from "../_components/ProductForm";
import Link from "next/link";
import { Store as StoreIcon, AlertCircle, Plus, ArrowRight, Clock, XCircle, Store } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CreateProductsPage({
  searchParams,
}: {
  searchParams?: Promise<{ storeId?: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/auth/seller/login");
  }

  const seller = await prisma.seller.findFirst({
    where: {
      OR: [
        { id: session.user.id },
        { phone: session.user.phone || undefined },
        { email: session.user.email || undefined },
      ],
    },
  });

  if (!seller) {
    redirect("/auth/seller/login");
  }

  // Fetch all stores belonging to this seller
  const stores = await prisma.store.findMany({
    where: {
      sellerId: seller.id,
      deletedAt: null,
    },
    include: {
      masterCategory: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // 1. If seller has NO store setup at all
  if (stores.length === 0) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 animate-in fade-in duration-300">
        <div className="bg-white rounded-3xl border border-slate-100 p-8 sm:p-12 shadow-sm text-center">
          <div className="w-20 h-20 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-6">
            <StoreIcon className="w-10 h-10 text-[#1E60ED]" />
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/60 mb-4">
            <AlertCircle className="w-3.5 h-3.5" />
            Store Setup Required
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
            Set Up Your Store First
          </h2>
          <p className="text-slate-500 text-sm sm:text-base max-w-lg mx-auto mb-8 leading-relaxed">
            You cannot upload or list products without setting up your store. Create your storefront first to start showcasing and selling your products on Bangla Bazar.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/dashboard/seller/store/create"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#1E60ED] hover:bg-blue-600 active:bg-blue-700 text-white font-semibold shadow-md shadow-blue-500/20 hover:shadow-lg transition-all"
            >
              <Plus className="w-5 h-5" />
              <span>Create Store Now</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
            <Link
              href="/dashboard/seller/store"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-all"
            >
              <Store className="w-4 h-4 text-slate-500" />
              <span>View Stores</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. Check for approved stores
  const approvedStores = stores.filter((s) => s.status === "Approved");

  // If no store is approved yet
  if (approvedStores.length === 0) {
    const isPending = stores.some((s) => s.status === "Pending");
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 animate-in fade-in duration-300">
        <div className="bg-white rounded-3xl border border-slate-100 p-8 sm:p-12 shadow-sm text-center">
          <div className="w-20 h-20 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-6">
            {isPending ? (
              <Clock className="w-10 h-10 text-amber-500" />
            ) : (
              <XCircle className="w-10 h-10 text-red-500" />
            )}
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/60 mb-4">
            <AlertCircle className="w-3.5 h-3.5" />
            {isPending ? "Store Under Review" : "Store Inactive or Rejected"}
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
            {isPending ? "Store Approval in Progress" : "Store Needs Attention"}
          </h2>
          <p className="text-slate-500 text-sm sm:text-base max-w-lg mx-auto mb-8 leading-relaxed">
            {isPending
              ? "Your store registration is currently under review by our admin team. You will be able to upload products as soon as your store is approved."
              : "Your store registration was rejected or deactivated. Please check your store details to resolve the issue before uploading products."}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/dashboard/seller/store"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#1E60ED] hover:bg-blue-600 text-white font-semibold shadow-md shadow-blue-500/20 hover:shadow-lg transition-all"
            >
              <span>Manage Store</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. Resolve active store
  const resolvedParams = searchParams ? await searchParams : undefined;
  const requestedStoreId = resolvedParams?.storeId;
  const activeStore = (requestedStoreId && approvedStores.find((s) => s.id === requestedStoreId)) || approvedStores[0];

  return (
    <div className="pb-10 animate-in fade-in duration-300">
      {approvedStores.length > 1 && (
        <div className="mb-6 p-4 bg-white rounded-2xl border border-slate-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-sm">
            <span className="text-slate-500">Selected Store: </span>
            <span className="font-semibold text-slate-800">{activeStore.storeNameEn}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Switch store:</span>
            <div className="flex flex-wrap gap-1.5">
              {approvedStores.map((s) => (
                <Link
                  key={s.id}
                  href={`/dashboard/seller/products/create?storeId=${s.id}`}
                  className={`px-3 py-1 text-xs rounded-xl font-medium transition-all ${
                    s.id === activeStore.id
                      ? "bg-[#1E60ED] text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {s.storeNameEn}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      <ProductForm
        entry={[]}
        title={`Add Product to ${activeStore.storeNameEn}`}
        storeId={activeStore.id}
        restrictMasterCategoryId={activeStore.masterCategoryId}
      />
    </div>
  );
}