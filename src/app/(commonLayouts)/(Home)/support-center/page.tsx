import React from "react";
import HelpCenterClient from "../help/_components/HelpCenterClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Support Center | Bangla Bazar",
  description:
    "Comprehensive Support Center for buyers and sellers on Bangla Bazar. Track orders, manage returns, discover shipping policies, and connect with 24/7 support.",
};

export default function SupportCenterPage() {
  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 py-10 md:py-16">
      <HelpCenterClient />
    </div>
  );
}
