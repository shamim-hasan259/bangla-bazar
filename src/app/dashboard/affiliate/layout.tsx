export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import AffiliateSidebar from "../_components/sidebar/AffiliateSidebar";
import AffiliateDashboardNav from "./_components/AffiliateDashboardNav";

export default async function AffiliateDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/auth/affiliate/login");
  }

  // @ts-ignore
  const userRole = String(session.user.type || session.user.role || "").toLowerCase();
  const isAffiliate = userRole === "affiliate" || Boolean((session.user as any).isAffiliate) || Boolean((session.user as any).affiliateCode);

  if (!isAffiliate) {
    redirect("/dashboard");
  }

  return (
    <div className="flex h-screen h-[100dvh] overflow-hidden bg-[#F8F9FD] dark:bg-slate-950 text-slate-800 dark:text-slate-100 w-full fixed inset-0">
      {/* Left Sidebar — sticky, non-scrolling */}
      <AffiliateSidebar />

      {/* Center: TopNav + scrollable content */}
      <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden">
        <AffiliateDashboardNav />

        {/* Scrollable main content */}
        <div className="flex-1 overflow-y-auto" data-lenis-prevent>
          <main className="p-4 sm:p-6 max-w-[1400px] mx-auto w-full">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
