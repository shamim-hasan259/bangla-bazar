"use client";
import dynamic from "next/dynamic";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const LoginForm = dynamic(
  () => import("../../_components/loginForm"),
  { ssr: false }
);




export default function CustomerLoginClient() {
  return (
    <div className="container">
      <div className="absolute left-10 top-5">
        <Link href="/" className="flex items-center gap-1">
          <ArrowLeft /> BACK
        </Link>
      </div>

      <LoginForm
        role="customer"
        credential="customerCredentials"
      />
    </div>
  );
}
