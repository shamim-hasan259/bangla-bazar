"use client";
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, Clock, ArrowLeft } from "lucide-react";

interface ComingSoonProps {
  title: string;
  description?: string;
  backUrl?: string;
}

export function ComingSoon({
  title,
  description = "We are currently building this feature to enhance your experience. It will be available very soon!",
  backUrl = "/dashboard/seller",
}: ComingSoonProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 py-12 text-center">
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-2xl animate-pulse" />
        <div className="relative h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <Clock className="h-10 w-10 text-white animate-spin-slow" />
          <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-amber-400 animate-bounce" />
        </div>
      </div>

      <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-blue-600 to-indigo-600 dark:from-white dark:via-blue-400 dark:to-indigo-400">
        {title} - Coming Soon
      </h1>

      <p className="mt-4 text-muted-foreground max-w-md text-base leading-relaxed">
        {description}
      </p>

      <div className="mt-8 flex flex-col sm:flex-row gap-4">
        <Link href={backUrl}>
          <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-200 gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
