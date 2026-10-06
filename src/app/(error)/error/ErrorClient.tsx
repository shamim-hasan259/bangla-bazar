"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

function ErrorContent() {
  const searchParams = useSearchParams();
  const message =
    searchParams.get("message") || "Something went wrong. Please try again.";

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-12 text-center bg-slate-50 dark:bg-slate-950">
      <div className="mb-6 rounded-full bg-red-100 p-6 dark:bg-red-900/20 animate-in zoom-in duration-300">
        <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-500" />
      </div>
      <h1 className="mb-3 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
        Payment Failed / Error
      </h1>
      <p className="mb-8 max-w-[600px] text-lg text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        {message}
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link href="/">
          <Button
            variant="outline"
            className="min-w-[150px] h-11 border-slate-300 dark:border-slate-700"
          >
            Return Home
          </Button>
        </Link>
        <Link href="/dashboard/customer/checkout">
          <Button className="min-w-[150px] h-11 bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/20">
            Try Again
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function ErrorClient() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[70vh]">
          Loading...
        </div>
      }
    >
      <ErrorContent />
    </Suspense>
  );
}
