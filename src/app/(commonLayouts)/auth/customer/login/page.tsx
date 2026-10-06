import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import CustomerLoginClient from "./CustomerLoginClient";

export const dynamic = "force-dynamic";

export default async function CustomerLoginPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  if (user && user.type) {
    const role = String(user.type).toLowerCase();
    if (role === "customer") {
      redirect("/dashboard/customer");
    } else if (role === "seller") {
      redirect("/dashboard/seller");
    } else if (role === "affiliate") {
      redirect("/dashboard/affiliate");
    } else if (["admin", "manager", "marketing", "sales", "stuff"].includes(role)) {
      redirect("/dashboard/admin");
    } else {
      redirect("/dashboard");
    }
  }

  return <CustomerLoginClient />;
}
