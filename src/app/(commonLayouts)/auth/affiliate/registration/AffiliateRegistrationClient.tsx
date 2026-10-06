"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const AffiliateRegistrationForm = dynamic(
  () => import("../_components/AffiliateRegistrationForm"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full max-w-xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-10 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#1E60ED]" />
      </div>
    ),
  }
);

export default function AffiliateRegistrationClient() {
  return <AffiliateRegistrationForm />;
}
