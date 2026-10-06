"use client";

import { ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function CongratulationClient() {
  return (
    <main className="flex min-h-screen flex-col justify-center items-center pb-6">
      <div className="absolute left-10 top-5">
        <Link href="/" className="flex items-center gap-2">
          <ArrowLeft />
          BACK
        </Link>
      </div>

      <div className="flex flex-col justify-center items-center">
        <CheckCircle color="#14ca07" size={64} className="mb-4" />
        <h6 className="text-2xl px-6 text-green-600">
          Congratulations!
        </h6>
        <p>Registration Successful!</p>
      </div>
    </main>
  );
}
