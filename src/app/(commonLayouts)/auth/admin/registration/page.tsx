import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

// Admin registration is disabled. Only 1 Admin account initialized via seed script is allowed.
export default function AdminRegistrationDisabledPage() {
  redirect("/admin/login");
}
