"use client";

import React from "react";
import { CheckCircle2, MessageSquare, Star } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface SellerInfoProps {
  brandName?: string;
  store?: {
    id: string;
    storeNameEn: string;
    storeLogo: string | null;
    slug: string;
  } | null;
  productId?: string;
}

const SellerInfo: React.FC<SellerInfoProps> = ({
  brandName = "BanglaBazar Official",
  store,
  productId,
}) => {
  const { data: session } = useSession();
  const router = useRouter();

  const userRole = String(
    (session?.user as any)?.role || (session?.user as any)?.type || ""
  ).toLowerCase();
  const isAdmin = userRole === "admin" || userRole === "manager" || userRole === "stuff";

  const storeName = store?.storeNameEn || brandName;
  const storeLink = store?.slug ? `/store/${store.slug}` : "#";

  const handleMessageSeller = () => {
    if (!session?.user) {
      toast.error("Please log in as a customer to message the seller!");
      router.push("/auth/customer/login");
      return;
    }

    if (isAdmin) {
      toast.error("Message seller feature is only for customers!");
      return;
    }

    const storeId = store?.id;
    if (!storeId) {
      toast.error("Cannot identify seller store for this product.");
      return;
    }

    // Direct routing to customer dashboard chat
    router.push(
      `/dashboard/customer/chat?storeId=${storeId}${
        productId ? `&productId=${productId}` : ""
      }`
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3.5">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
          <span className="text-[#e11d48] font-bold">»</span> Seller Info
        </h3>
        <Link
          href={storeLink}
          className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#fed700] hover:bg-[#facc15] text-slate-900 transition-colors shadow-2xs"
        >
          Visit Store
        </Link>
      </div>

      {/* Store Name Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs">
          <span className="text-slate-500 dark:text-slate-400">Store Name :</span>
          <Link
            href={storeLink}
            className="font-bold text-slate-900 dark:text-white hover:text-[#e11d48] transition-colors truncate max-w-[150px]"
          >
            {storeName}
          </Link>
        </div>
        <div className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
          <CheckCircle2 className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* 3 Metrics Cards */}
      <div className="grid grid-cols-3 gap-2">
        <div className="border border-slate-200/80 dark:border-slate-700/80 rounded-lg p-2 text-center bg-slate-50/40 dark:bg-slate-800/30">
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-tight">
            Seller Ratings
          </p>
          <p className="text-xs font-black text-slate-800 dark:text-slate-200 mt-1">
            85%
          </p>
        </div>
        <div className="border border-slate-200/80 dark:border-slate-700/80 rounded-lg p-2 text-center bg-slate-50/40 dark:bg-slate-800/30">
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-tight">
            Response Rate
          </p>
          <p className="text-xs font-black text-slate-800 dark:text-slate-200 mt-1">
            97%
          </p>
        </div>
        <div className="border border-slate-200/80 dark:border-slate-700/80 rounded-lg p-2 text-center bg-slate-50/40 dark:bg-slate-800/30">
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-tight">
            Ship on Time
          </p>
          <p className="text-xs font-black text-slate-800 dark:text-slate-200 mt-1">
            98%
          </p>
        </div>
      </div>

      {/* Message Seller CTA -> Direct Dashboard Routing */}
      <button
        onClick={handleMessageSeller}
        className="w-full py-2 px-3 rounded-lg bg-[#e11d48] hover:bg-[#be123c] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs cursor-pointer active:scale-[0.99]"
      >
        <MessageSquare className="w-3.5 h-3.5" />
        <span>Message Seller</span>
      </button>
    </div>
  );
};

export default SellerInfo;
