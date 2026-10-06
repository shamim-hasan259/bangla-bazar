import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import React from "react";
import AffiliateRegistrationClient from "./AffiliateRegistrationClient";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Affiliate Registration | Bangla Bazar",
  description: "Register as an affiliate partner on Bangla Bazar to earn handsome commissions.",
};

const AffiliateRegistration = async () => {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  if (user) {
    if (user.type === "affiliate" || user.role === "affiliate" || user.isAffiliate) {
      redirect("/dashboard/affiliate");
    } else if (user.type === "seller") {
      redirect("/dashboard/seller");
    } else if (["admin", "manager", "marketing", "sales", "stuff"].includes(user.type?.toLowerCase())) {
      redirect("/dashboard/admin");
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] dark:bg-slate-950 py-12 px-4 sm:px-6 relative flex flex-col justify-center">
      {/* Back button */}
      <div className="max-w-xl mx-auto w-full mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-[#1E60ED] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> BACK TO HOMEPAGE
        </Link>
      </div>

      <AffiliateRegistrationClient />
    </div>
  );
};

export default AffiliateRegistration;
