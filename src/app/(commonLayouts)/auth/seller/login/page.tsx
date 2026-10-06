import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import React from "react";
import LoginForm from "../../_components/loginForm";

export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

const SellerLogin = async () => {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  if (user) {
    if (
      user.type === "seller" ||
      ["admin", "manager", "marketing", "sales", "stuff"].includes(
        user.type?.toLowerCase()
      )
    ) {
      redirect("/dashboard");
    }
  }
  return (
    <div
      className="min-h-screen w-full flex justify-end bg-cover bg-center bg-no-repeat relative overflow-hidden h-screen"
      style={{ backgroundImage: `url('/img/seller-login-bg.jpg')` }}
    >
      {/* Translucent overlay */}
      <div className="absolute inset-0 bg-slate-950/20" />

      {/* Back Button */}
      <div className="absolute left-10 top-5 z-20">
        <Link href="/" className="flex items-center gap-1.5 text-white hover:text-slate-200 font-bold text-sm">
          <ArrowLeft className="w-4 h-4" /> BACK
        </Link>
      </div>

      {/* Main Login Side Panel */}
      <div
        className="relative z-10 w-full md:max-w-[480px] bg-white/95 dark:bg-slate-900/95 shadow-2xl border-l border-slate-200/50 dark:border-slate-800/50 overflow-y-auto flex flex-col p-6 md:p-8 h-full"
        style={{ scrollbarWidth: "none" }}
      >
        <div className="my-auto py-4">
          <LoginForm role="seller" credential="sellerCredentials" isSidePanel={true} />
        </div>
      </div>
    </div>
  );
};

export default SellerLogin;
