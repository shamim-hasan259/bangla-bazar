export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import SellerSidebar from "../_components/sidebar/SellerSidebar";
import SellerTopBar from "../_components/SellerTopBar";
import { authOptions } from "@/lib/auth";
import { SellerStoreProvider } from "@/context/SellerStoreContext";

export default async function SellerDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/");
  }

  // @ts-ignore
  const userType = session.user.type?.toLowerCase();

  if (userType !== "seller") {
    redirect("/dashboard");
  }

  return (
    <SellerStoreProvider>
      <div className="flex h-screen h-[100dvh] overflow-hidden bg-[#F8F9FD] dark:bg-slate-950 text-slate-800 dark:text-slate-100 w-full fixed inset-0">
        {/* Left Sidebar — sticky, never scrolls */}
        <SellerSidebar />

        {/* Center: TopBar + scrollable content */}
        <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden">
          {/* Sticky breadcrumb bar */}
          <SellerTopBar />

          {/* Scrollable main content */}
          <div className="flex-1 overflow-y-auto" data-lenis-prevent>
            <main className="p-6">
              {children}
            </main>
          </div>
        </div>
      </div>
    </SellerStoreProvider>
  );
}