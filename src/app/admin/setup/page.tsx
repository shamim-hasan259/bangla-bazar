import React from "react";
import Link from "next/link";
import { ArrowLeft, ShieldAlert, KeyRound, Sparkles } from "lucide-react";
import { redirect } from "next/navigation";
import { isAdminSetupCompleted } from "@/lib/adminSetup";
import AdminSetupForm from "./_components/AdminSetupForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "One-Time Admin Setup | Bangla Bazar",
  description: "Secure Initial Administrator Setup Portal for Bangla Bazar",
};

export default async function AdminSetupPage() {
  // 1. Guard check: If setup has already completed, permanently redirect to login
  const isComplete = await isAdminSetupCompleted();
  if (isComplete) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-[#F8FAFC] dark:bg-slate-950 text-slate-800 dark:text-slate-100 selection:bg-blue-500 selection:text-white relative">
      {/* Top Bar Navigation */}
      <header className="w-full px-6 py-4 flex items-center justify-between z-20">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors py-1.5 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Store
        </Link>
        <div className="flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/40 px-3 py-1 rounded-full">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>One-Time System Initialization</span>
        </div>
      </header>

      {/* Main Setup Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-lg">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl sm:rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none p-6 sm:p-9 backdrop-blur-sm">
            {/* Header / Logo */}
            <div className="text-center mb-6">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center mb-3 shadow-md shadow-blue-500/25">
                <KeyRound className="w-7 h-7" />
              </div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                One-Time Admin Setup
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 max-w-sm mx-auto">
                Create the master Administrator account for Bangla Bazar. This page will be permanently locked after creation.
              </p>
            </div>

            {/* Info notice */}
            <div className="mb-6 p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-xs text-blue-800 dark:text-blue-300 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="leading-relaxed text-[11px]">
                <strong>Only ONE Administrator account is permitted.</strong> Once configured, all public setup access will be permanently disabled across all environments.
              </div>
            </div>

            {/* Setup Form */}
            <AdminSetupForm />

            {/* Security Notice */}
            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center">
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Requires the secret <code>ADMIN_SETUP_TOKEN</code> configured on the server.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-xs text-slate-400">
        &copy; {new Date().getFullYear()} Bangla Bazar. All rights reserved.
      </footer>
    </div>
  );
}
