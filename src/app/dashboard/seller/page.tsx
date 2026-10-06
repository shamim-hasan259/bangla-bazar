import React from "react";
import DashboardSeller from "../_components/DashboardSeller";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getSellerDashboardData } from "./products/_action";

const SellerPage = async () => {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/auth/seller/login");
  }

  const dashboardData = await getSellerDashboardData();

  return (
    <div>
      <DashboardSeller initialData={dashboardData} />
    </div>
  );
};

export default SellerPage;
