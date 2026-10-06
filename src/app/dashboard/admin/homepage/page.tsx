import React from "react";
import PageTitle from "@/components/ui/PageTitle";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  getHomepageSections,
  getHomepageCampaigns,
  getHomepageFlashSales
} from "./_action";
import HomepageBuilder from "./HomepageBuilder";

export const dynamic = "force-dynamic";

export default async function AdminHomepageBuilderPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/auth/login");
  }

  // @ts-ignore
  const userType = session.user.type?.toLowerCase();
  const adminRoles = ["admin", "manager", "marketing", "sales", "stuff"];

  if (!userType || !adminRoles.includes(userType)) {
    redirect("/dashboard");
  }

  // Fetch server data
  const sections = await getHomepageSections();
  const campaigns = await getHomepageCampaigns();
  const flashSales = await getHomepageFlashSales();

  return (
    <div className="space-y-6 animate-in fade-in duration-300 p-6">
      <div>
        <PageTitle title="Homepage Management" />
        <p className="text-slate-500 text-xs mt-1">
          Dynamically enable, disable, reorder, and configure homepage layouts, campaigns, and section settings.
        </p>
      </div>

      <HomepageBuilder
        initialSections={sections}
        campaigns={campaigns}
        flashSales={flashSales}
      />
    </div>
  );
}
