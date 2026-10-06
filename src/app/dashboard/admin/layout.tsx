export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import AdminSidebar from "../_components/sidebar/AdminSidebar";
import AdminTopBar from "../_components/AdminTopBar";
import { authOptions } from "@/lib/auth";

import prisma from "@/index";

export default async function AdminDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/admin/login");
  }

  // @ts-ignore
  const userType = String(session.user.role || session.user.type || "").toLowerCase();

  if (userType !== "admin") {
    redirect("/admin/login");
  }

  // Verify that the Admin account is active in the database
  try {
    const admin = await prisma.admin.findUnique({
      where: { id: (session.user as any).id },
    });

    if (!admin || admin.status.toLowerCase() !== "active") {
      redirect("/admin/login?error=InactiveAccount");
    }
  } catch (error) {
    console.error("Admin layout verification error:", error);
    redirect("/admin/login");
  }

  return (
    <div className="flex h-screen h-[100dvh] overflow-hidden bg-[#F8F9FD] dark:bg-slate-950 text-slate-800 dark:text-slate-100 w-full fixed inset-0">
      {/* Left Sidebar — sticky, never scrolls */}
      <AdminSidebar />

      {/* Center: TopBar + scrollable content */}
      <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden">
        {/* Sticky breadcrumb bar */}
        <AdminTopBar />

        {/* Scrollable main content */}
        <div className="flex-1 overflow-y-auto bg-[#F8F9FD] dark:bg-slate-950" data-lenis-prevent>
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
