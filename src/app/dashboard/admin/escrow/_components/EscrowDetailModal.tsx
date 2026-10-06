"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Store,
  User,
  Package,
  Calendar,
  DollarSign,
  Clock,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  XCircle,
} from "lucide-react";
import Link from "next/link";

interface EscrowDetailModalProps {
  escrow: any | null;
  isOpen: boolean;
  onClose: () => void;
  onRelease: (id: string) => void;
  isReleasing?: boolean;
}

export default function EscrowDetailModal({
  escrow,
  isOpen,
  onClose,
  onRelease,
  isReleasing = false,
}: EscrowDetailModalProps) {
  if (!escrow) return null;

  const seller = escrow.seller;
  const store = seller?.stores && seller.stores.length > 0 ? seller.stores[0] : null;
  const order = escrow.order;
  const customer = order?.customer;

  const isRefunded = escrow.status === "Refunded" || order?.status === "Canceled" || order?.status === "Return";

  // Days Calculation
  const deliveryDate = escrow.deliveryDate ? new Date(escrow.deliveryDate) : new Date(escrow.createdAt);
  const now = new Date();
  const diffTime = Math.max(0, now.getTime() - deliveryDate.getTime());
  const daysElapsed = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const daysRemaining = Math.max(0, 7 - daysElapsed);
  const isReadyForRelease = daysElapsed >= 7 || escrow.status === "ReadyForRelease";

  const soldProducts = order?.soldProducts || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl font-sans">
        <DialogHeader className="space-y-1.5 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#1E60ED]" />
              Escrow Transaction Details
            </DialogTitle>
            <span
              className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                isRefunded
                  ? "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400"
                  : escrow.released60 || escrow.status === "Released"
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"
                  : isReadyForRelease
                  ? "bg-emerald-500 text-white animate-pulse"
                  : "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400"
              }`}
            >
              {isRefunded
                ? "🔴 Refunded / Canceled"
                : escrow.released60 || escrow.status === "Released"
                ? "100% Fully Released"
                : isReadyForRelease
                ? "Ready For Release (≥ 7 Days)"
                : `60% Held (${daysRemaining} Days Remaining)`}
            </span>
          </div>
          <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
            Order ID: <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">{escrow.orderId}</span> • Created: {new Date(escrow.createdAt).toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4 text-xs">
          {/* Days Counter / Refund Banner */}
          {isRefunded ? (
            <div className="bg-red-50 dark:bg-red-950/30 p-4 rounded-2xl border border-red-200 dark:border-red-900/40 flex items-center gap-3">
              <div className="p-3 bg-red-100 dark:bg-red-900/50 text-red-600 rounded-xl">
                <XCircle className="w-6 h-6" />
              </div>
              <div>
                <span className="font-bold text-red-800 dark:text-red-300 block text-sm">
                  Order Refunded / Canceled
                </span>
                <span className="text-red-600 dark:text-red-400 text-[11px]">
                  Funds were returned to the customer's wallet. Seller earnings were adjusted.
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-150 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-[#1E60ED]/10 text-[#1E60ED] rounded-xl">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block text-sm">
                    {daysElapsed} / 7 Days Elapsed
                  </span>
                  <span className="text-slate-500 text-[11px]">
                    {isReadyForRelease
                      ? "7-day return period is completed. Eligible for instant withdrawal."
                      : `${daysRemaining} day(s) remaining in security holding period.`}
                  </span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Held 60% Amount</span>
                <span className="text-xl font-black text-[#1E60ED] dark:text-blue-400">
                  ৳{escrow.heldAmount.toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {/* Grid: Seller & Store Info + Customer Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Seller & Store Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b pb-2 border-slate-100 dark:border-slate-800">
                <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Store className="w-4 h-4 text-blue-500" />
                  Seller & Store Details
                </span>
                {store && (
                  <Link
                    href={`/store/${store.slug}`}
                    target="_blank"
                    className="text-[11px] text-[#1E60ED] hover:underline flex items-center gap-1 font-semibold"
                  >
                    Visit Store <ExternalLink className="w-3 h-3" />
                  </Link>
                )}
              </div>

              <div className="space-y-1.5 text-slate-600 dark:text-slate-300">
                <p><strong className="text-slate-800 dark:text-white">Seller Name:</strong> {seller?.name || "N/A"}</p>
                <p><strong className="text-slate-800 dark:text-white">Phone:</strong> {seller?.phone || "N/A"}</p>
                <p><strong className="text-slate-800 dark:text-white">Email:</strong> {seller?.email || "N/A"}</p>
                <p><strong className="text-slate-800 dark:text-white">Store Name:</strong> {store?.storeNameEn || store?.storeName || "N/A"}</p>
                <p><strong className="text-slate-800 dark:text-white">Commission Rate:</strong> {seller?.commissionRate || 10}%</p>
              </div>
            </div>

            {/* Customer Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b pb-2 border-slate-100 dark:border-slate-800">
                <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-emerald-500" />
                  Customer Details
                </span>
              </div>

              <div className="space-y-1.5 text-slate-600 dark:text-slate-300">
                <p><strong className="text-slate-800 dark:text-white">Customer Name:</strong> {customer?.name || order?.customerName || "Customer"}</p>
                <p><strong className="text-slate-800 dark:text-white">Phone:</strong> {customer?.phone || order?.phone || "N/A"}</p>
                <p><strong className="text-slate-800 dark:text-white">Email:</strong> {customer?.email || "N/A"}</p>
                <p><strong className="text-slate-800 dark:text-white">Courier Tracking:</strong> {order?.trackingCode || "N/A"} ({order?.courierName || "Standard Courier"})</p>
              </div>
            </div>
          </div>

          {/* Sold Products List */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Package className="w-4 h-4 text-purple-500" />
              Sold Items List ({soldProducts.length})
            </h4>

            {soldProducts.length === 0 ? (
              <div className="text-slate-400 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-center">
                Product details unavailable
              </div>
            ) : (
              <div className="space-y-2">
                {soldProducts.map((prod: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-800/40"
                  >
                    <div className="flex items-center gap-3">
                      {prod.image && (
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="w-10 h-10 object-cover rounded-lg border border-slate-200"
                        />
                      )}
                      <div>
                        <p className="font-bold text-slate-800 dark:text-white">{prod.name || prod.title}</p>
                        <p className="text-[11px] text-slate-400">Qty: {prod.qty || prod.quantity || 1} • Unit Price: ৳{prod.price}</p>
                      </div>
                    </div>
                    <span className="font-black text-slate-800 dark:text-white">
                      ৳{(prod.price * (prod.qty || prod.quantity || 1)).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Financial Breakdown Table */}
          <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-4 space-y-2 border border-slate-150 dark:border-slate-800">
            <h4 className="font-bold text-slate-800 dark:text-slate-200 border-b pb-1">Financial Breakdown</h4>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Gross Order Total:</span>
              <span className="font-semibold text-slate-800 dark:text-white">৳{(escrow.totalAmount / (0.9)).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Net Seller Earnings (after {seller?.commissionRate || 10}% commission):</span>
              <span className="font-semibold text-slate-800 dark:text-white">৳{escrow.totalAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
              <span>40% Pre-disbursed Amount:</span>
              <span className="font-bold">৳{(escrow.totalAmount * 0.4).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-[#1E60ED] font-bold text-sm pt-2 border-t border-slate-200 dark:border-slate-700">
              <span>60% Remaining Escrow Balance:</span>
              {isRefunded ? (
                <span className="line-through text-red-500">৳{escrow.heldAmount.toLocaleString()} (Refunded)</span>
              ) : (
                <span>৳{escrow.heldAmount.toLocaleString()}</span>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" onClick={onClose} className="rounded-xl px-5">
            Close
          </Button>

          {!isRefunded && !escrow.released60 && escrow.status !== "Released" && (
            <Button
              onClick={() => onRelease(escrow.id)}
              disabled={isReleasing}
              className="bg-[#1E60ED] hover:bg-[#164ec2] text-white font-bold rounded-xl px-6"
            >
              {isReleasing ? "Releasing Funds..." : `Release 60% Funds (৳${escrow.heldAmount.toLocaleString()})`}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
