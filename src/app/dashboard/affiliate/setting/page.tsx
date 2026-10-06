"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  User,
  Mail,
  Smartphone,
  Lock,
  Wallet,
  Check,
  ShieldCheck,
  Building,
  Save,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PasswordShowClose from "@/app/dashboard/seller/setting/_components/PasswordShowClose";

export default function AffiliateSettingPage() {
  const { data: session, update } = useSession();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Bkash");
  const [paymentNumber, setPaymentNumber] = useState("");

  // Password change states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [eyeCurrent, setEyeCurrent] = useState(false);
  const [eyeNew, setEyeNew] = useState(false);
  const [eyeConfirm, setEyeConfirm] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/affiliate/profile", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setProfile(data.affiliate);
        setName(data.affiliate.name || "");
        setEmail(data.affiliate.email || "");
        setPaymentMethod(data.affiliate.paymentMethod || "Bkash");
        setPaymentNumber(data.affiliate.paymentNumber || data.affiliate.phone || "");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword) {
      if (!currentPassword) {
        toast.error("Please enter your current password to change password");
        return;
      }
      if (newPassword.length < 6) {
        toast.error("New password must be at least 6 characters");
        return;
      }
      if (newPassword !== confirmPassword) {
        toast.error("New passwords do not match");
        return;
      }
    }

    try {
      setSaving(true);
      const res = await fetch("/api/affiliate/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          paymentMethod,
          paymentNumber,
          currentPassword: currentPassword || undefined,
          newPassword: newPassword || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Settings updated successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        fetchProfile();
      } else {
        toast.error(data.message || "Failed to update profile");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const affiliateCode = profile?.affiliateCode || (session?.user as any)?.affiliateCode || "AFF-PARTNER";

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Affiliate Settings</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Manage your personal profile, preferred payout accounts, and security preferences
        </p>
      </div>

      <form onSubmit={handleUpdateProfile} className="space-y-6">
        {/* Profile Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <User className="w-4 h-4 text-[#1E60ED]" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Partner Profile</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Full Name <span className="text-red-500">*</span>
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Email Address
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="h-11 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Phone Number (Account ID)
              </label>
              <Input
                disabled
                value={profile?.phone || (session?.user as any)?.phone || ""}
                className="h-11 rounded-xl text-xs bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Affiliate Referral Code
              </label>
              <Input
                disabled
                value={affiliateCode}
                className="h-11 rounded-xl text-xs font-mono font-bold bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900 text-blue-600 dark:text-blue-400"
              />
            </div>
          </div>
        </div>

        {/* Payout Information Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Wallet className="w-4 h-4 text-[#1E60ED]" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Default Payout Method</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Preferred Provider
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
                Account / Wallet Number
              </label>
              <Input
                value={paymentNumber}
                onChange={(e) => setPaymentNumber(e.target.value)}
                placeholder="e.g. 017XXXXXXXX or Bank Account No"
                className="h-11 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
              />
            </div>
          </div>
        </div>

        {/* Password Security Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Lock className="w-4 h-4 text-[#1E60ED]" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Security & Password (Optional)</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Current Password
              </label>
              <div className="relative">
                <Input
                  type={eyeCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-11 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 pr-10"
                />
                <PasswordShowClose eyeOpen={eyeCurrent} setEyeOpen={setEyeCurrent} />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                New Password
              </label>
              <div className="relative">
                <Input
                  type={eyeNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-11 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 pr-10"
                />
                <PasswordShowClose eyeOpen={eyeNew} setEyeOpen={setEyeNew} />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Confirm New Password
              </label>
              <div className="relative">
                <Input
                  type={eyeConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-11 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 pr-10"
                />
                <PasswordShowClose eyeOpen={eyeConfirm} setEyeOpen={setEyeConfirm} />
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            disabled={saving}
            className="h-12 px-8 rounded-2xl bg-[#1E60ED] hover:bg-blue-700 text-white font-extrabold text-xs shadow-lg shadow-blue-500/20 flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Saving Changes...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save Settings
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
