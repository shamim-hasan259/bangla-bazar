import React from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import AdminLoginForm from "./_components/AdminLoginForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin Portal Login | Bangla Bazar",
  description: "Secure Administrator Access Portal for Bangla Bazar",
};

export default async function AdminLoginPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  if (user && user.type) {
    const role = String(user.type || user.role || "").toLowerCase();
    if (role === "admin") {
      redirect("/admin/dashboard");
    }
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
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
          <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>Restricted Portal</span>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl sm:rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-none p-6 sm:p-8 backdrop-blur-sm">
            {/* Header / Logo */}
            <div className="text-center mb-6">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-3 shadow-inner">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Admin Login
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Authorized administrator credentials required
              </p>
            </div>

            {/* Login Form */}
            <React.Suspense fallback={<div className="h-40 flex items-center justify-center text-xs text-slate-400">Loading form...</div>}>
              <AdminLoginForm />
            </React.Suspense>

            {/* Security Notice */}
            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center">
              <p className="text-[11px] text-slate-400 leading-relaxed">
                All login attempts are monitored and rate-limited. Unauthorized access attempts will be logged.
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
