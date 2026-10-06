"use client";

import React, { useState, useEffect } from "react";
import {
  Wallet,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  AlertCircle,
  ShieldCheck,
  Building,
  Smartphone,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function AffiliateWalletPage() {
  const [stats, setStats] = useState<any>(null);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal form states
  const [modalOpen, setModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Bkash");
  const [accountNumber, setAccountNumber] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, withRes] = await Promise.all([
        fetch("/api/affiliate/stats", { cache: "no-store" }),
        fetch("/api/affiliate/withdrawals", { cache: "no-store" }),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
        if (statsData.affiliate) {
          setPaymentMethod(statsData.affiliate.paymentMethod || "Bkash");
          setAccountNumber(statsData.affiliate.paymentNumber || statsData.affiliate.phone || "");
        }
      }

      if (withRes.ok) {
        const withData = await withRes.json();
        setWithdrawals(withData.withdrawals || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = Number(withdrawAmount);

    if (isNaN(amountNum) || amountNum < 500) {
      toast.error("Minimum withdrawal amount is ৳500");
      return;
    }

    if (!accountNumber) {
      toast.error("Please enter your account number");
      return;
    }

    const currentBalance = stats?.affiliate?.walletBalance || 0;
    if (amountNum > currentBalance) {
      toast.error(`Insufficient balance. Available: ৳${currentBalance.toLocaleString()}`);
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/affiliate/withdrawals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amountNum,
          paymentMethod,
          accountNumber,
          note,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Payout request submitted successfully!");
        setModalOpen(false);
        setWithdrawAmount("");
        fetchData();
      } else {
        toast.error(data.message || "Failed to submit request");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const affiliate = stats?.affiliate;
  const walletBalance = affiliate?.walletBalance || 0;
  const totalEarnings = affiliate?.totalEarnings || 0;

  const pendingWithdrawalAmount = withdrawals
    .filter((w) => w.status === "Pending")
    .reduce((sum, w) => sum + (w.amount || 0), 0);

  const completedWithdrawalAmount = withdrawals
    .filter((w) => w.status === "Approved")
    .reduce((sum, w) => sum + (w.amount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Wallet & Payouts</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage your accumulated commission earnings and request instant payouts
          </p>
        </div>

        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogTrigger asChild>
            <Button
              className="h-11 px-5 rounded-2xl bg-[#1E60ED] hover:bg-blue-700 text-white font-extrabold text-xs shadow-lg shadow-blue-500/20 flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Request Payout
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md rounded-3xl p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <DialogHeader>
              <DialogTitle className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Wallet className="w-5 h-5 text-[#1E60ED]" /> Request Commission Payout
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleWithdraw} className="space-y-4 pt-2">
              <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Available to Withdraw</p>
                  <p className="text-xl font-black text-[#1E60ED] dark:text-blue-400">
                    ৳{walletBalance.toLocaleString()}
                  </p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                  Min: ৳500
                </span>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Withdrawal Amount (৳) <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  min={500}
                  max={walletBalance}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="Enter amount (min ৳500)"
                  className="h-11 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Payout Method <span className="text-red-500">*</span>
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-medium outline-none"
                >
                  <option value="Bkash">bKash (Personal)</option>
                  <option value="Nagad">Nagad (Personal)</option>
                  <option value="Rocket">Rocket</option>
                  <option value="Bank">Bank Transfer</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Account / Phone / Bank Details <span className="text-red-500">*</span>
                </label>
                <Input
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="e.g. 017XXXXXXXX or Bank Account No"
                  className="h-11 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Note (Optional)
                </label>
                <Input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Additional payout instructions"
                  className="h-11 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={submitting || walletBalance < 500}
                  className="w-full h-11 rounded-xl bg-[#1E60ED] hover:bg-blue-700 text-white font-extrabold text-xs shadow-md shadow-blue-500/20"
                >
                  {submitting ? "Processing..." : "Submit Payout Request"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* ── Summary Stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-2xs">
          <span className="text-xs font-bold text-slate-500">Available Wallet Balance</span>
          <p className="text-3xl font-black text-[#1E60ED] mt-2">
            ৳{walletBalance.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Minimum payout threshold is ৳500</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-2xs">
          <span className="text-xs font-bold text-slate-500">Pending Payouts</span>
          <p className="text-3xl font-black text-amber-600 mt-2">
            ৳{pendingWithdrawalAmount.toLocaleString()}
          </p>
          <p className="text-[11px] text-amber-600 font-bold mt-1">Under processing by accounts</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-2xs">
          <span className="text-xs font-bold text-slate-500">Total Paid Out</span>
          <p className="text-3xl font-black text-emerald-600 mt-2">
            ৳{completedWithdrawalAmount.toLocaleString()}
          </p>
          <p className="text-[11px] text-emerald-600 font-bold mt-1">Disbursed to your accounts</p>
        </div>
      </div>

      {/* ── Payout History Table ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-2xs">
        <div className="mb-5">
          <h2 className="text-base font-black text-slate-900 dark:text-white">Withdrawal History</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Log of all payout requests and disbursement statuses</p>
        </div>

        {withdrawals.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No withdrawal requests submitted yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold">
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Payout Ref</th>
                  <th className="py-3 px-3">Method</th>
                  <th className="py-3 px-3">Account Number</th>
                  <th className="py-3 px-3">Amount</th>
                  <th className="py-3 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {withdrawals.map((w) => (
                  <tr key={w.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-3 text-slate-500">
                      {new Date(w.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-3 font-mono font-bold text-slate-900 dark:text-white">
                      #{w.id.slice(-6).toUpperCase()}
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                      {w.paymentMethod}
                    </td>
                    <td className="py-3.5 px-3 font-mono text-slate-600 dark:text-slate-300">
                      {w.accountNumber}
                    </td>
                    <td className="py-3.5 px-3 font-bold text-slate-900 dark:text-white">
                      ৳{w.amount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          w.status === "Approved"
                            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400"
                            : w.status === "Pending"
                            ? "bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400"
                            : "bg-red-50 text-red-600"
                        }`}
                      >
                        {w.status === "Approved" ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : w.status === "Pending" ? (
                          <Clock className="w-3 h-3" />
                        ) : (
                          <XCircle className="w-3 h-3" />
                        )}
                        {w.status || "Pending"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
