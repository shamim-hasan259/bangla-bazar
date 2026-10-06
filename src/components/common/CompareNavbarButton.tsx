"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { GitCompare } from "lucide-react";
import { RootState } from "@/app/redux-store/store";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

import { useLanguage } from "@/context/LanguageContext";

const CompareNavbarButton = ({
  showLabel = false,
  className,
}: {
  showLabel?: boolean;
  className?: string;
}) => {
  const { data: session } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { t } = useLanguage();
  const compareItems = useSelector((state: RootState) => state.compare?.items || []);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    if (!session?.user) {
      e.preventDefault();
      toast.error("Please log in to view product comparison!");
      router.push("/auth/customer/login?callbackUrl=/compare");
    }
  };

  return (
    <Button
      asChild
      variant="ghost"
      className={cn(
        "p-2 h-auto rounded-md text-slate-600 hover:text-black hover:bg-slate-100 transition-colors border-0 shadow-none cursor-pointer",
        className
      )}
    >
      <Link href="/compare" onClick={handleClick} className="flex items-center gap-1.5" aria-label="Compare">
        <div className="relative flex items-center">
          <GitCompare size={18} className="text-slate-600 group-hover:text-black transition-colors" />
          {mounted && session?.user && compareItems.length > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-slate-900 text-white text-[9px] font-bold h-4 min-w-[16px] px-0.5 rounded-full flex items-center justify-center border border-white leading-none">
              {compareItems.length}
            </span>
          )}
        </div>
        {showLabel && (
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 group-hover:text-black transition-colors">
            {t("compare")}
          </span>
        )}
      </Link>
    </Button>
  );
};

export default CompareNavbarButton;
