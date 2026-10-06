"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()} 
      className="text-sm font-extrabold flex items-center gap-1.5 text-slate-800 dark:text-slate-200 bg-transparent border-none cursor-pointer hover:opacity-85 transition-all font-sans select-none"
    >
      <ChevronLeft className="w-4 h-4" strokeWidth={2.5} />
      Dashboard
    </button>
  );
}
