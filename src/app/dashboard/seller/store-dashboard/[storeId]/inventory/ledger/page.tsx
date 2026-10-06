import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/index";
import PageTitle from "@/components/ui/PageTitle";
import Image from "next/image";
import { format } from "date-fns";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function StoreLedgerPage({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) {
  const session = await getServerSession(authOptions);
  const { storeId } = await params;

  if (!session || !session.user) {
    redirect("/auth/login");
  }

  // 1. Get all product IDs of this specific store
  const storeProducts = await prisma.product.findMany({
    where: {
      storeId: storeId,
    },
    select: { id: true },
  });
  const productIds = storeProducts.map((p) => p.id);

  // 2. Query ledger logs for these store products
  const ledgerLogs = await prisma.stockLedger.findMany({
    where: {
      productId: { in: productIds },
    },
    include: {
      product: {
        select: {
          name: true,
          photo: true,
        },
      },
      variant: {
        select: {
          sku: true,
          color: true,
          size: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Helper to extract photos
  const getPhotoUrl = (photoField: any) => {
    if (!photoField) return "/img/placeholder.png";
    if (typeof photoField === "string") return photoField;
    if (Array.isArray(photoField) && photoField.length > 0) return photoField[0];
    if (typeof photoField === "object") {
      if (photoField.url) return photoField.url;
      const keys = Object.keys(photoField);
      if (keys.length > 0 && typeof photoField[keys[0]] === "string") {
        return photoField[keys[0]];
      }
    }
    return "/img/placeholder.png";
  };

  return (
    <main className="flex min-h-screen flex-col gap-6 w-full bg-[#f8fafc] dark:bg-slate-900">
      <div className="flex-col flex w-full space-y-4">
        {/* Title */}
        <div className="flex items-center justify-between">
          <PageTitle title="Store Stock Ledger" />
        </div>

        {/* Ledger logs container */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-700">
                  <th className="py-4 px-6">Date & Time</th>
                  <th className="py-4 px-6">Product / SKU</th>
                  <th className="py-4 px-6">Event Type</th>
                  <th className="py-4 px-6 text-center">Change Qty</th>
                  <th className="py-4 px-6 text-center">Stock Flow</th>
                  <th className="py-4 px-6">Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-sm text-slate-700 dark:text-slate-200">
                {ledgerLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                      No stock ledger transactions recorded for this store yet.
                    </td>
                  </tr>
                ) : (
                  ledgerLogs.map((log) => {
                    const isAddition = log.quantity > 0;

                    // Event Badge styling
                    let badgeClass = "bg-blue-50 dark:bg-blue-950/20 text-[#1E60ED]";
                    let typeLabel = "Initial Entry";
                    if (log.type === "ManualAdjustment") {
                      badgeClass = "bg-purple-50 dark:bg-purple-950/20 text-purple-600";
                      typeLabel = "Manual Adjustment";
                    } else if (log.type === "Sale") {
                      badgeClass = "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600";
                      typeLabel = "Sale Outflow";
                    } else if (log.type === "Return") {
                      badgeClass = "bg-[#FFFBEB] dark:bg-amber-950/20 text-amber-600";
                      typeLabel = "Return Inflow";
                    }

                    const skuVal = log.variant ? log.variant.sku : `${log.productId.substring(18, 24).toUpperCase()}`;
                    const attrVal = log.variant
                      ? `${log.variant.color || ""} ${log.variant.size ? `/ ${log.variant.size}` : ""}`.trim()
                      : "Default";

                    return (
                      <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                        {/* Timestamp */}
                        <td className="py-4 px-6 text-xs text-slate-500 dark:text-slate-400 font-medium">
                          {format(new Date(log.createdAt), "dd MMM yyyy, hh:mm a")}
                        </td>

                        {/* Product Detail */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 relative rounded overflow-hidden bg-slate-50 shrink-0 border">
                              <Image
                                src={getPhotoUrl(log.product?.photo)}
                                alt=""
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-800 dark:text-white line-clamp-1">{log.product?.name}</span>
                              <span className="text-[10px] text-slate-400 font-semibold tracking-wide">
                                SKU: {skuVal} {attrVal !== "Default" && `(${attrVal})`}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Event Type Badge */}
                        <td className="py-4 px-6">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${badgeClass}`}>
                            {typeLabel}
                          </span>
                        </td>

                        {/* Quantity change */}
                        <td className={`py-4 px-6 text-center font-bold ${
                          isAddition ? "text-emerald-600" : "text-rose-600"
                        }`}>
                          {isAddition ? `+${log.quantity}` : log.quantity}
                        </td>

                        {/* Previous Stock ➔ New Stock flow */}
                        <td className="py-4 px-6 text-center font-semibold text-slate-500">
                          <span className="text-slate-400">{log.previousStock}</span>
                          <span className="mx-2 text-slate-350">➔</span>
                          <span className="text-slate-800 dark:text-slate-200 font-bold">{log.newStock}</span>
                        </td>

                        {/* Description/Note */}
                        <td className="py-4 px-6 text-xs font-medium text-slate-400">
                          {log.note || "N/A"}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
