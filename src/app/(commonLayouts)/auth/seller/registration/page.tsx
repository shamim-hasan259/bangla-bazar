import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import React from "react";
import SellerRegistrationForm from "../_components/SellerRegistrationForm";

export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

const SellerRegistration = async () => {
  const session = await getServerSession(authOptions);
  if (session && session.user && (session.user as any).type !== "customer") {
    redirect("/dashboard");
  }

  return (
    <div className="w-full min-h-screen relative">
      <div className="absolute left-10 top-5 z-20">
        <Link href="/" className="flex items-center gap-1.5 text-white hover:text-slate-200 font-bold text-sm">
          <ArrowLeft className="w-4 h-4" /> BACK
        </Link>
      </div>
      <SellerRegistrationForm />
    </div>
  );
};

export default SellerRegistration;
