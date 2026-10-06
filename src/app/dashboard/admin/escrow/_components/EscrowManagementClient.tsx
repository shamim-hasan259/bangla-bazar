"use client";

import React, { useState } from "react";
import PageTitle from "@/components/ui/PageTitle";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  Clock,
  CheckCircle2,
  ExternalLink,
  Store,
  Eye,
  CheckSquare,
  Square,
  ArrowRight,
  Filter,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import EscrowDetailModal from "./EscrowDetailModal";
import { releaseSingleEscrow, releaseBulkEscrow } from "../_action";

interface EscrowManagementClientProps {
  initialEscrows: any[];
}

export default function EscrowManagementClient({
  initialEscrows,
}: EscrowManagementClientProps) {
  const [escrows, setEscrows] = useState(initialEscrows);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "ready" | "partially" | "cleared" | "refunded">("all");
  const [selectedEscrowForModal, setSelectedEscrowForModal] = useState<any | null>(null);
  const [isReleasing, setIsReleasing] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const now = new Date();

  // Helper to check if an escrow/order is refunded or canceled
  const checkIsRefunded = (esc: any) => {
    return esc.status === "Refunded" || esc.order?.status === "Canceled" || esc.order?.status === "Return";
  };

  // Compute helper functions per escrow
  const computeDays = (esc: any) => {
    const deliveryDate = esc.deliveryDate ? new Date(esc.deliveryDate) : new Date(esc.createdAt);
    const diffTime = Math.max(0, now.getTime() - deliveryDate.getTime());
    const daysElapsed = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.max(0, 7 - daysElapsed);
    const isReady = daysElapsed >= 7 || esc.status === "ReadyForRelease";
    return { daysElapsed, daysRemaining, isReady };
  };

  // Filter Escrows based on Active Tab
  const filteredEscrows = escrows.filter((esc) => {
    const { isReady } = computeDays(esc);
    const isRefunded = checkIsRefunded(esc);

    if (activeTab === "ready") {
      return isReady && !esc.released60 && esc.status !== "Released" && !isRefunded;
    }
    if (activeTab === "partially") {
      return !esc.released60 && esc.status !== "Released" && !isRefunded;
    }
    if (activeTab === "cleared") {
      return (esc.released60 || esc.status === "Released") && !isRefunded;
    }
    if (activeTab === "refunded") {
      return isRefunded;
    }
    return true;
  });

  // Checkbox Selection Logic
  const toggleSelectAll = () => {
    if (selectedIds.length === filteredEscrows.length) {
      setSelectedIds([]);
    } else {
      const selectableIds = filteredEscrows
        .filter((e) => !e.released60 && e.status !== "Released" && !checkIsRefunded(e))
        .map((e) => e.id);
      setSelectedIds(selectableIds);
    }
  };

  const toggleSelectRow = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Actions
  const handleSingleRelease = async (id: string) => {
    setIsReleasing(true);
    setMessage(null);
    const res = await releaseSingleEscrow(id);
    setIsReleasing(false);
    if (res.success) {
      setMessage({ text: res.message, type: "success" });
      setSelectedEscrowForModal(null);
      // Update local state
      setEscrows((prev) =>
        prev.map((e) => (e.id === id ? { ...e, released60: true, status: "Released" } : e))
      );
    } else {
      setMessage({ text: res.message, type: "error" });
    }
  };

  const handleBulkRelease = async () => {
    if (selectedIds.length === 0) return;
    setIsReleasing(true);
    setMessage(null);
    const res = await releaseBulkEscrow(selectedIds);
    setIsReleasing(false);
    if (res.success) {
      setMessage({ text: res.message, type: "success" });
      const releasedSet = new Set(selectedIds);
      setEscrows((prev) =>
        prev.map((e) => (releasedSet.has(e.id) ? { ...e, released60: true, status: "Released" } : e))
      );
      setSelectedIds([]);
    } else {
      setMessage({ text: res.message, type: "error" });
    }
  };

  // Calculate Stat Summaries
  const totalHeld = escrows
    .filter((e) => !e.released60 && e.status !== "Released" && !checkIsRefunded(e))
    .reduce((acc, curr) => acc + curr.heldAmount, 0);

  const readyCount = escrows.filter((e) => computeDays(e).isReady && !e.released60 && e.status !== "Released" && !checkIsRefunded(e)).length;
  const partiallyCount = escrows.filter((e) => !e.released60 && e.status !== "Released" && !checkIsRefunded(e)).length;
  const clearedCount = escrows.filter((e) => (e.released60 || e.status === "Released") && !checkIsRefunded(e)).length;
  const refundedCount = escrows.filter((e) => checkIsRefunded(e)).length;

  return (
    <div className="space-y-6 font-sans pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <PageTitle title="Escrow Management Center" />
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manual Escrow Holding & Single/Bulk Release Panel. Security hold for 100% customer payments with 7-day return cycle tracking.
          </p>
        </div>

        <Link href="/dashboard/admin/escrow/ledger">
          <Button variant="outline" className="rounded-xl px-4 py-2 text-xs font-semibold flex items-center gap-1.5 cursor-pointer">
            <Clock className="w-4 h-4 text-[#1E60ED]" />
            View Escrow Ledger Audit Trail
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>

      {/* Alert Notification */}
      {message && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300"
              : "bg-red-50 text-red-800 border border-red-200 dark:bg-red-950/30 dark:text-red-300"
          }`}
        >
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="text-slate-500 hover:text-slate-700">✕</button>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 shadow-xl shadow-blue-500/10 space-y-2">
          <span className="text-xs font-bold text-blue-200 uppercase tracking-wider block">Total Held in Escrow</span>
          <span className="text-3xl font-black block">৳{totalHeld.toLocaleString()}</span>
          <span className="text-xs text-blue-200/80 block">Active 60% funds pending admin release</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-2">
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">Ready For Release (≥ 7 Days)</span>
          <span className="text-3xl font-extrabold text-slate-800 dark:text-white block">{readyCount} Orders</span>
          <span className="text-[11px] text-slate-400">Return window expired; safe for bulk release</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">100% Cleared Escrows</span>
          <span className="text-3xl font-extrabold text-slate-800 dark:text-white block">{clearedCount} Disbursed</span>
          <span className="text-[11px] text-slate-400">Total 100% earnings transferred to seller wallets</span>
        </div>
      </div>

      {/* Filter Tabs & Bulk Actions Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-150 dark:border-slate-800 pb-4">
          {/* Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "all"
                  ? "bg-[#1E60ED] text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              All Escrows ({escrows.length})
            </button>

            <button
              onClick={() => setActiveTab("ready")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "ready"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100"
              }`}
            >
              Ready for Release (≥ 7 Days) ({readyCount})
            </button>

            <button
              onClick={() => setActiveTab("partially")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "partially"
                  ? "bg-[#1E60ED] text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              60% Held ({partiallyCount})
            </button>

            <button
              onClick={() => setActiveTab("cleared")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "cleared"
                  ? "bg-slate-800 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              Fully Released ({clearedCount})
            </button>

            <button
              onClick={() => setActiveTab("refunded")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "refunded"
                  ? "bg-red-600 text-white shadow-sm"
                  : "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 hover:bg-red-100"
              }`}
            >
              Refunded / Canceled ({refundedCount})
            </button>
          </div>

          {/* Bulk Release Button */}
          {selectedIds.length > 0 && (
            <Button
              onClick={handleBulkRelease}
              disabled={isReleasing}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl px-5 py-2 text-xs flex items-center gap-2 animate-bounce shadow-md"
            >
              <CheckSquare className="w-4 h-4" />
              {isReleasing ? "Bulk Releasing..." : `Bulk Withdraw Selected 60% (${selectedIds.length})`}
            </Button>
          )}
        </div>

        {/* Escrow Table */}
        {filteredEscrows.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            No escrow records found under this filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-150 dark:border-slate-800 text-slate-400 uppercase tracking-wider">
                  <th className="p-3 w-10">
                    <input
                      type="checkbox"
                      checked={
                        selectedIds.length > 0 &&
                        selectedIds.length === filteredEscrows.filter((e) => !e.released60 && e.status !== "Released" && !checkIsRefunded(e)).length
                      }
                      onChange={toggleSelectAll}
                      className="rounded border-slate-300 text-[#1E60ED] focus:ring-[#1E60ED] cursor-pointer"
                    />
                  </th>
                  <th className="p-3">Order Details</th>
                  <th className="p-3">Seller & Store</th>
                  <th className="p-3">Days Status</th>
                  <th className="p-3 text-right">60% Held Amount</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredEscrows.map((esc) => {
                  const { daysElapsed, daysRemaining, isReady } = computeDays(esc);
                  const seller = esc.seller;
                  const store = seller?.stores && seller.stores.length > 0 ? seller.stores[0] : null;
                  const isRefunded = checkIsRefunded(esc);
                  const isSelectable = !esc.released60 && esc.status !== "Released" && !isRefunded;

                  return (
                    <tr key={esc.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-all">
                      <td className="p-3">
                        {isSelectable && (
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(esc.id)}
                            onChange={() => toggleSelectRow(esc.id)}
                            className="rounded border-slate-300 text-[#1E60ED] focus:ring-[#1E60ED] cursor-pointer"
                          />
                        )}
                      </td>

                      <td className="p-3">
                        <span className="font-bold text-slate-800 dark:text-white block">ID: {esc.orderId}</span>
                        <span className="text-[11px] text-slate-400">Created: {new Date(esc.createdAt).toLocaleDateString()}</span>
                      </td>

                      <td className="p-3">
                        <p className="font-bold text-slate-800 dark:text-white">{seller?.name || "Seller"}</p>
                        <p className="text-[11px] text-slate-500">{seller?.phone}</p>
                        {store && (
                          <Link
                            href={`/store/${store.slug}`}
                            target="_blank"
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1E60ED] hover:underline pt-0.5"
                          >
                            <Store className="w-3 h-3" />
                            {store.storeNameEn || store.storeName}
                            <ExternalLink className="w-2.5 h-2.5" />
                          </Link>
                        )}
                      </td>

                      <td className="p-3">
                        {isRefunded ? (
                          <div>
                            <span className="font-bold text-red-600 dark:text-red-400 block flex items-center gap-1">
                              <XCircle className="w-3.5 h-3.5" /> Order Refunded
                            </span>
                            <span className="text-[10px] text-slate-400">Funds returned to buyer</span>
                          </div>
                        ) : (
                          <div>
                            <span className="font-bold text-slate-700 dark:text-slate-300 block">
                              {daysElapsed} / 7 Days Elapsed
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {isReady ? "Window Completed" : `${daysRemaining} day(s) remaining`}
                            </span>
                          </div>
                        )}
                      </td>

                      <td className="p-3 text-right">
                        {isRefunded ? (
                          <div>
                            <span className="font-bold line-through text-red-500 dark:text-red-400 text-sm block">
                              ৳{esc.heldAmount.toLocaleString()}
                            </span>
                            <span className="text-[10px] text-red-400 font-semibold">(Refunded to Buyer)</span>
                          </div>
                        ) : (
                          <div>
                            <span className="font-black text-slate-800 dark:text-white text-sm block">
                              ৳{esc.heldAmount.toLocaleString()}
                            </span>
                            <span className="text-[10px] text-slate-400">Total: ৳{esc.totalAmount.toLocaleString()}</span>
                          </div>
                        )}
                      </td>

                      <td className="p-3 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                            isRefunded
                              ? "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-900/40"
                              : esc.released60 || esc.status === "Released"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"
                              : isReady
                              ? "bg-emerald-500 text-white"
                              : "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400"
                          }`}
                        >
                          {isRefunded
                            ? "🔴 Refunded / Canceled"
                            : esc.released60 || esc.status === "Released"
                            ? "100% Cleared"
                            : isReady
                            ? "Ready for Release"
                            : "60% Held"}
                        </span>
                      </td>

                      <td className="p-3 text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedEscrowForModal(esc)}
                          className="h-8 px-2.5 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-300"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          Details
                        </Button>

                        {isSelectable && (
                          <Button
                            size="sm"
                            onClick={() => handleSingleRelease(esc.id)}
                            disabled={isReleasing}
                            className="h-8 px-3 rounded-lg bg-[#1E60ED] hover:bg-[#164ec2] text-white font-bold text-[11px]"
                          >
                            Release 60%
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Escrow View Detail Modal */}
      {selectedEscrowForModal && (
        <EscrowDetailModal
          escrow={selectedEscrowForModal}
          isOpen={!!selectedEscrowForModal}
          onClose={() => setSelectedEscrowForModal(null)}
          onRelease={handleSingleRelease}
          isReleasing={isReleasing}
        />
      )}
    </div>
  );
}
