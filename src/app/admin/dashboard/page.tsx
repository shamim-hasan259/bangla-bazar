import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import prisma from "@/index";

export const dynamic = "force-dynamic";

export default async function AdminDashboardRedirectPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/admin/login");
  }

  const role = String((session.user as any).role || (session.user as any).type || "").toLowerCase();
  if (role !== "admin") {
    redirect("/admin/login");
  }

  // Verify in MongoDB Admin collection that account is active
  try {
    const admin = await prisma.admin.findUnique({
      where: { id: (session.user as any).id },
    });

    if (!admin || admin.status.toLowerCase() !== "active") {
      redirect("/admin/login?error=InactiveAccount");
    }
  } catch (error) {
    console.error("Admin verification error:", error);
    redirect("/admin/login");
  }

  // Redirect to full admin management dashboard
  redirect("/dashboard/admin");
}
