import React from "react";
import HelpCenterClient from "./_components/HelpCenterClient";

export const metadata = {
  title: "Help & Support Center | Bangla Bazar",
  description: "Find answers to frequently asked questions, order tracking, returns, shipping, payments, and 24/7 customer support on Bangla Bazar.",
};

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 py-10 md:py-16">
      <HelpCenterClient />
    </div>
  );
}
