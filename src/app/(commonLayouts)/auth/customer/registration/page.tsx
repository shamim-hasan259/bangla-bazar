import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import CustomerRegistrationClient from "./CustomerRegistrationClient";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Customer Registration",
  description: "Register for a new customer account",
};

const CustomerRegistration = () => {
  return (
    <div className="container relative">
      <div className="absolute left-6 sm:left-10 top-5">
        <Link href="/" className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-black dark:text-slate-400 dark:hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> 
        </Link>
      </div>
      <CustomerRegistrationClient />
    </div>
  );
};

export default CustomerRegistration;
