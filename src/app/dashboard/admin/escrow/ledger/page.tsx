import React from "react";
import PageTitle from "@/components/ui/PageTitle";
import { getEscrowLedgerData } from "../_action";
import {
  FileText,
  ArrowLeft,
  Search,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function EscrowLedgerPage() {
  const ledgerData = await getEscrowLedgerData();

  return (
    <div className="space-y-6 font-sans pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <PageTitle title="Escrow Audit Ledger Log" />
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Complete transactional ledger history of all escrow holds, 40% pre-disbursals, 60% manual admin releases, and customer refunds.
          </p>
        </div>

        <Link href="/dashboard/admin/escrow">
          <Button variant="outline" className="rounded-xl px-4 py-2 text-xs font-semibold flex items-center gap-1.5 cursor-pointer">
            <ArrowLeft className="w-4 h-4" />
            Back to Escrow Management
          </Button>
        </Link>
      </div>

      {/* Ledger Table Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#1E60ED]" />
            Transaction History ({ledgerData.length})
          </h3>
        </div>

        {ledgerData.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            No escrow ledger entries recorded yet. Released escrow transactions will automatically record here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-150 dark:border-slate-800 text-slate-400 uppercase tracking-wider">
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Seller & Store</th>
                  <th className="p-3">Order ID</th>
                  <th className="p-3 text-right">Amount</th>
                  <th className="p-3">Note / Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {ledgerData.map((item: any) => {
                  const seller = item.seller;
                  const store = seller?.stores && seller.stores.length > 0 ? seller.stores[0] : null;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-all">
                      <td className="p-3 text-slate-500 whitespace-nowrap">
                        {new Date(item.createdAt).toLocaleString()}
                      </td>

                      <td className="p-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            item.type === "ManualAdminRelease" || item.type === "Release60"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"
                              : item.type === "Release40"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400"
                              : item.type === "Refund"
                              ? "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400"
                              : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300"
                          }`}
                        >
                          {item.type}
                        </span>
                      </td>

                      <td className="p-3">
                        <span className="font-bold text-slate-800 dark:text-white block">{seller?.name || "Seller"}</span>
                        <span className="text-[11px] text-slate-400">{store?.storeName || seller?.phone}</span>
                      </td>

                      <td className="p-3 font-mono text-slate-700 dark:text-slate-300">
                        {item.orderId || "N/A"}
                      </td>

                      <td className="p-3 text-right font-black text-slate-800 dark:text-white text-sm">
                        ৳{item.amount.toLocaleString()}
                      </td>

                      <td className="p-3 text-slate-600 dark:text-slate-400 max-w-xs truncate">
                        {item.note || "N/A"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
