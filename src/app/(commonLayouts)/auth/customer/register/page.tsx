import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import CustomerRegistrationClient from "../registration/CustomerRegistrationClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Customer Registration",
  description: "Register for a new customer account",
};

const CustomerRegisterPage = () => {
  return (
    <div className="container">
      <div className="absolute left-10 top-5">
        <Link href="/" className="flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> BACK
        </Link>
      </div>
      <CustomerRegistrationClient />
    </div>
  );
};

export default CustomerRegisterPage;
