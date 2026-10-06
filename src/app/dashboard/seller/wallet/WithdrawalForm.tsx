"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { requestWithdrawal } from "./_action";
import { Toaster } from "@/components/ui/sonner";

export default function WithdrawalForm({ sellerId, maxAmount }: { sellerId: string, maxAmount: number }) {
  const [amount, setAmount] = useState(0);
  const [method, setMethod] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0 || amount > maxAmount) {
      toast.error("Invalid amount. Must be greater than 0 and less than your balance.");
      return;
    }
    if (!method || !details) {
      toast.error("Please fill all fields");
      return;
    }

    setLoading(true);
    const res = await requestWithdrawal(sellerId, amount, method, details);
    setLoading(false);
    
    if (res?.success) {
      toast.success(res.message);
      setAmount(0); 
      setMethod(""); 
      setDetails("");
    } else {
      toast.error(res?.message || "Failed to submit request.");
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4 p-6 border rounded-lg bg-card text-card-foreground shadow-sm">
        <h3 className="text-lg font-bold">Request Withdrawal</h3>
        <div>
           <label className="text-sm text-gray-500 mb-1 block">Amount (Max: ৳{maxAmount})</label>
           <Input type="number" placeholder="Amount (৳)" value={amount || ""} onChange={e => setAmount(Number(e.target.value))} />
        </div>
        <div>
           <label className="text-sm text-gray-500 mb-1 block">Payment Method</label>
           <Input placeholder="e.g. bKash, DBBL Bank" value={method} onChange={e => setMethod(e.target.value)} />
        </div>
        <div>
           <label className="text-sm text-gray-500 mb-1 block">Account Details</label>
           <Input placeholder="Account Number / Info" value={details} onChange={e => setDetails(e.target.value)} />
        </div>
        <Button type="submit" disabled={loading} className="w-full">{loading ? "Submitting..." : "Submit Request"}</Button>
      </form>
      <Toaster />
    </>
  )
}
