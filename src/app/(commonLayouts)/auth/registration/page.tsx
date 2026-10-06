import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import CustomerRegistrationForm from "../customer/_components/CustomerRegistrationForm";

export const dynamic = "force-dynamic";

const RegPage = () => {
  return (
    <div className="container">
      <div className="absolute left-10 top-5">
        <Link href="/" className="flex">
          <ArrowLeft /> BACK
        </Link>
      </div>
      <CustomerRegistrationForm />
    </div>
  );
};

export default RegPage;
