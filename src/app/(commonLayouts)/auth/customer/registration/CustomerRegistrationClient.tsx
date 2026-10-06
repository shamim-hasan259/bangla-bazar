"use client";

import dynamic from "next/dynamic";

const CustomerRegistrationForm = dynamic(
  () => import("../_components/CustomerRegistrationForm"),
  { ssr: false }
);

export default function CustomerRegistrationClient() {
  return <CustomerRegistrationForm />;
}
