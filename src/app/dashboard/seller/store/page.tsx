import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Store as StoreIcon, ShieldAlert, ArrowUpRight, Eye, Calendar, Tag, Layers } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/index";
import PageTitle from "@/components/ui/PageTitle";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

export default async function SellerStoreListPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
        <ShieldAlert className="w-12 h-12 text-red-500 mb-4 animate-bounce" />
        <h3 className="text-lg font-bold text-slate-800">Access Denied</h3>
        <p className="text-slate-500 text-sm mt-1">Please log in to manage your stores.</p>
      </div>
    );
  }

  console.log("DEBUG SESSION USER:", JSON.stringify(session.user, null, 2));

  const isObjectId = (val?: string | null) => typeof val === "string" && /^[0-9a-fA-F]{24}$/.test(val);
  const rawSellerId = session.user.id || "";
  const validObjectId = isObjectId(rawSellerId);

  // Find Seller ID
  const seller = await prisma.seller.findFirst({
    where: {
      OR: [
        ...(validObjectId ? [{ id: rawSellerId }] : []),
        { sellerId: rawSellerId },
        { phone: (session.user as any).phone || undefined },
        { email: session.user.email || undefined },
      ].filter(Boolean),
    },
  });

  const sellerObjectId = seller?.id || (validObjectId ? rawSellerId : undefined);

  if (!sellerObjectId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
        <ShieldAlert className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-lg font-bold text-slate-800">Seller Account Not Found</h3>
        <p className="text-slate-500 text-sm mt-1">Please configure your seller account details first.</p>
      </div>
    );
  }

  // Fetch all stores belonging to this seller
  const stores = await prisma.store.findMany({
    where: {
      sellerId: sellerObjectId,
      deletedAt: null, // Exclude soft-deleted stores
    },
    include: {
      masterCategory: {
        select: {
          name: true,
        },
      },
      _count: {
        select: {
          products: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header section with Create button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <PageTitle title="My Stores" />
          <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">
            Manage your stores, monitor analytics, and upload products.
          </p>
        </div>

        <Link
          href="/dashboard/seller/store/create"
          className="bg-[#1E60ED] hover:bg-blue-600 active:bg-blue-700 text-white font-semibold py-3 px-5 rounded-2xl flex items-center gap-2 transition-all shadow-md shadow-blue-500/10 hover:shadow-lg hover:shadow-blue-500/20 w-fit shrink-0"
        >
          <Plus className="w-5 h-5" />
          <span>Create Store</span>
        </Link>
      </div>

      {stores.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[350px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-12 text-center shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center mb-4">
            <StoreIcon className="w-8 h-8 text-[#1E60ED]" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">No Stores Created Yet</h3>
          <p className="text-slate-400 dark:text-slate-500 text-sm max-w-md mt-2">
            You don't have any stores setup. Create your first storefront to showcase and sell your products under a customized brand layout.
          </p>
          <Link
            href="/dashboard/seller/store/create"
            className="mt-6 inline-flex items-center gap-2 bg-[#1E60ED] text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-600 transition-all text-sm"
          >
            <Plus className="w-4 h-4" /> Start Store Setup
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map((store) => {
            const hasDashboardAccess = store.status === "Approved" || store.status === "Suspended" || store.status === "Disabled";
            const createdDate = format(new Date(store.createdAt), "dd MMM yyyy");

            // Status Badge Formatting
            let statusColor = "bg-amber-50 text-amber-600 border-amber-200/50 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30";
            if (store.status === "Approved") {
              statusColor = "bg-emerald-50 text-emerald-600 border-emerald-200/50 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30";
            } else if (store.status === "Rejected") {
              statusColor = "bg-rose-50 text-rose-600 border-rose-200/50 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30";
            } else if (store.status === "Suspended") {
              statusColor = "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-850 dark:text-slate-400 dark:border-slate-800";
            } else if (store.status === "Disabled") {
              statusColor = "bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700";
            }

            const CardContent = (
              <div className="relative bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 hover:shadow-md hover:border-slate-200 dark:hover:border-slate-700 transition-all duration-300 flex flex-col h-full group border-l-4 border-l-[#1E60ED]/50 hover:border-l-[#1E60ED]">
                
                {/* Store Header: Logo & Status */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="w-16 h-16 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden relative bg-slate-50 dark:bg-slate-950 flex items-center justify-center shrink-0">
                    {store.storeLogo ? (
                      <Image
                        src={store.storeLogo}
                        alt={store.storeNameEn}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    ) : (
                      <StoreIcon className="w-7 h-7 text-slate-400" />
                    )}
                  </div>
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${statusColor} uppercase tracking-wider`}>
                    {store.status === "Approved" ? "Active" : store.status}
                  </span>
                </div>

                {/* Names & Description */}
                <div className="flex-1 space-y-1.5 mb-6">
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 group-hover:text-[#1E60ED] transition-colors leading-tight">
                    {store.storeNameEn}
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                    {store.storeNameBn}
                  </p>
                  {store.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                      {store.description}
                    </p>
                  )}
                </div>

                {/* Meta details */}
                <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-auto space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Layers className="w-3.5 h-3.5 text-slate-400" /> Category
                    </span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {store.masterCategory?.name || "N/A"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Tag className="w-3.5 h-3.5 text-slate-400" /> Products
                    </span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      {store._count.products}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" /> Created
                    </span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {createdDate}
                    </span>
                  </div>
                </div>

                {/* Footer Buttons/Context actions */}
                {store.status === "Rejected" && store.rejectionReason && (
                  <div className="mt-4 p-3 bg-red-50/50 dark:bg-red-950/10 border border-red-100 dark:border-red-950/20 rounded-2xl text-xs text-red-600 dark:text-red-400">
                    <p className="font-bold flex items-center gap-1 mb-1">
                      <ShieldAlert className="w-3.5 h-3.5" /> Rejection Reason:
                    </p>
                    <p className="line-clamp-2 leading-relaxed">{store.rejectionReason}</p>
                  </div>
                )}

                {hasDashboardAccess ? (
                  <div className="mt-5 flex items-center justify-between text-xs font-bold text-[#1E60ED] group-hover:translate-x-1 transition-transform">
                    <span>Enter Dashboard</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="mt-5 flex items-center justify-between text-xs font-bold text-slate-400">
                    {store.status === "Pending" ? (
                      <span className="flex items-center gap-1.5">
                        <Eye className="w-4 h-4 animate-pulse text-amber-500" /> Awaiting Approval...
                      </span>
                    ) : (
                      <Link
                        href={`/dashboard/seller/store/edit-rejected/${store.id}`}
                        className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-center rounded-xl transition-all"
                      >
                        Edit & Resubmit
                      </Link>
                    )}
                  </div>
                )}
              </div>
            );

            if (hasDashboardAccess) {
              return (
                <Link
                  key={store.id}
                  href={`/dashboard/seller/store-dashboard/${store.id}`}
                  target="_blank"
                  className="block h-full cursor-pointer"
                >
                  {CardContent}
                </Link>
              );
            } else {
              return <div key={store.id}>{CardContent}</div>;
            }
          })}
        </div>
      )}
    </div>
  );
}
