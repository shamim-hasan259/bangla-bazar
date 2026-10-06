export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import CustomerSidebar from "../_components/sidebar/CustomerSidebar";
import DashboardNav from "./_components/DashboardNav";
import { authOptions } from "@/lib/auth";

export default async function CustomerDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/auth/customer/login");
  }

  // @ts-ignore
  const userType = session.user.type?.toLowerCase();

  if (userType !== "customer") {
    redirect("/dashboard");
  }

  return (
    <div className="flex h-screen h-[100dvh] overflow-hidden bg-[#F8F9FD] dark:bg-slate-950 text-slate-800 dark:text-slate-100 w-full fixed inset-0">
      {/* Left Sidebar — sticky, never scrolls */}
      <CustomerSidebar />

      {/* Center: TopNav + scrollable content */}
      <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden">
        {/* Sticky top bar */}
        <DashboardNav />

        {/* Scrollable main content */}
        <div className="flex-1 overflow-y-auto" data-lenis-prevent>
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
