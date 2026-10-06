import { ArrowLeft, TrendingUp, Sparkles, Percent, DollarSign, ShieldCheck } from "lucide-react";
import Link from "next/link";
import React from "react";
import LoginForm from "../../_components/loginForm";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Affiliate Partner Login | Bangla Bazar",
  description: "Login to your Bangla Bazar Affiliate Dashboard to track referrals, earnings, and payouts.",
};

const AffiliateLogin = async () => {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  if (user) {
    if (user.type === "affiliate") {
      redirect("/dashboard/affiliate");
    } else if (user.type === "seller") {
      redirect("/dashboard/seller");
    } else if (["admin", "manager", "marketing", "sales", "stuff"].includes(user.type?.toLowerCase())) {
      redirect("/dashboard/admin");
    } else if (user.type === "customer") {
      redirect("/dashboard/customer");
    }
  }

  return (
    <div className="min-h-screen w-full flex bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white relative overflow-hidden">
      {/* Decorative background glow circles */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 right-1/3 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Back Button */}
      <div className="absolute left-6 md:left-10 top-6 z-20">
        <Link
          href="/"
          className="flex items-center gap-2 text-white/80 hover:text-white font-semibold text-xs tracking-wide bg-white/10 hover:bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> BACK TO HOME
        </Link>
      </div>

      <div className="w-full flex flex-col lg:flex-row items-center justify-between min-h-screen">
        {/* Left Side: Affiliate Branding & Perks */}
        <div className="hidden lg:flex flex-col justify-center flex-1 px-12 xl:px-20 max-w-[700px] z-10 py-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs font-semibold mb-6 w-fit">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" /> Bangla Bazar Affiliate Program
          </div>
          
          <h1 className="text-4xl xl:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
            Earn Money By Promoting Products You Love
          </h1>
          
          <p className="text-slate-300 text-base leading-relaxed mb-8">
            Join thousands of content creators, influencers, and digital marketers earning high commissions with Bangladesh's most trusted marketplace.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center mb-3">
                <Percent className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="font-bold text-white text-sm">Up to 10% Commission</h3>
              <p className="text-xs text-slate-400 mt-1">High conversion rates across millions of products.</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center mb-3">
                <DollarSign className="w-5 h-5 text-indigo-400" />
              </div>
              <h3 className="font-bold text-white text-sm">Instant MFS Payouts</h3>
              <p className="text-xs text-slate-400 mt-1">Fast withdrawals directly to bKash, Nagad, or Bank.</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-3">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="font-bold text-white text-sm">Real-time Analytics</h3>
              <p className="text-xs text-slate-400 mt-1">Live click and order tracking on your dashboard.</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-xl bg-sky-500/20 flex items-center justify-center mb-3">
                <ShieldCheck className="w-5 h-5 text-sky-400" />
              </div>
              <h3 className="font-bold text-white text-sm">30-Day Cookie Window</h3>
              <p className="text-xs text-slate-400 mt-1">Get credited even if buyers purchase weeks later.</p>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form Panel */}
        <div className="w-full lg:max-w-[480px] min-h-screen bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col justify-center p-6 sm:p-10 z-10 text-slate-900 dark:text-white">
          <div className="my-auto py-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-[#1E60ED] mb-3">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Affiliate Portal</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Enter your credentials to access your earnings dashboard
              </p>
            </div>

            <LoginForm role="affiliate" credential="affiliateCredentials" isSidePanel={true} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AffiliateLogin;
