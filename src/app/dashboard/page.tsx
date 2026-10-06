import { getServerSession } from "next-auth";
export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

type User = {
  type: "seller" | "customer" | "admin";
};

const Dashboard = async () => {
  const session = await getServerSession(authOptions);
  // console.log(session?.user);
  if (!session || !session.user) {
    redirect("/auth/login");
  }

  //@ts-ignore
  const user = session?.user;

  if (!user || !user?.type) {
    redirect("/auth/login");
  }

  const role = String(user?.role || user?.type || "").toLowerCase();

  // check is admin
  if (role === "admin") {
    redirect("/admin/dashboard");
  }

  // legacy admin staff roles
  const adminRoles = ["manager", "marketing", "sales", "stuff"];
  if (adminRoles.includes(role)) {
    redirect("/dashboard/admin");
  }

  // check is seller
  if (role === "seller") {
    redirect("/dashboard/seller");
  }

  // check is customer
  if (role === "customer") {
    redirect("/dashboard/customer");
  }

  // check is affiliate
  if (role === "affiliate") {
    redirect("/dashboard/affiliate");
  }

  // fallback
  redirect("/");
};

export default Dashboard;
