"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import {
  Image as ImageIcon,
  Copy,
  Check,
  Code,
  Sparkles,
  Download,
  Share2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function AffiliateBannersPage() {
  const { data: session } = useSession();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const user = session?.user as any;
  const affiliateCode = user?.affiliateCode || "AFF-PARTNER";

  const banners = [
    {
      id: "leaderboard",
      title: "Marketplace Mega Deals Leaderboard",
      size: "728 x 90 px",
      bgClass: "from-blue-600 to-indigo-700",
      headline: "Bangladesh's #1 Online Mega Bazar",
      tag: "Up to 70% OFF • 100% Authentic Products",
    },
    {
      id: "square",
      title: "Grocery & Daily Deals Banner",
      size: "300 x 250 px",
      bgClass: "from-emerald-600 to-teal-700",
      headline: "Fresh Daily Grocery & Fast Delivery",
      tag: "Order Now & Get Cashbacks",
    },
    {
      id: "skyscraper",
      title: "Fashion & Lifestyle Skyscraper",
      size: "160 x 600 px",
      bgClass: "from-violet-600 to-purple-800",
      headline: "Trending Fashion Collections",
      tag: "Exclusive Bangla Bazar Deals",
    },
  ];

  const handleCopyEmbed = (banner: any) => {
    const embedCode = `<a href="https://banglabazar.com?ref=${affiliateCode}" target="_blank" rel="noopener noreferrer"><img src="https://banglabazar.com/img/banners/${banner.id}.png" alt="${banner.title}" width="100%" /></a>`;
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(embedCode);
      setCopiedId(banner.id);
      toast.success("HTML Embed code copied!");
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Marketing Assets & Banners</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Embed official promotional banners on your website, blog, or social channels with your tracking code embedded
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {banners.map((b) => {
          const isCopied = copiedId === b.id;
          return (
            <div
              key={b.id}
              className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-2xs space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">{b.title}</h3>
                  <span className="text-[11px] text-slate-400 font-mono">{b.size}</span>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleCopyEmbed(b)}
                  className="h-8 px-3 rounded-xl bg-[#1E60ED] hover:bg-blue-700 text-white text-xs font-bold gap-1.5"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5" /> : <Code className="w-3.5 h-3.5" />}
                  <span>{isCopied ? "Code Copied" : "Copy HTML"}</span>
                </Button>
              </div>

              {/* Visual Banner Preview */}
              <div
                className={`w-full p-6 rounded-2xl bg-gradient-to-r ${b.bgClass} text-white flex flex-col justify-center items-center text-center shadow-md`}
              >
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-[10px] font-bold mb-2">
                  <Sparkles className="w-3 h-3 text-amber-300" /> Bangla Bazar
                </div>
                <h4 className="text-lg font-black tracking-tight">{b.headline}</h4>
                <p className="text-xs text-white/80 mt-1">{b.tag}</p>
                <div className="mt-4 px-4 py-1.5 bg-white text-slate-900 text-xs font-black rounded-full shadow-sm">
                  SHOP NOW →
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[10px] text-slate-600 dark:text-slate-400 overflow-x-auto select-all">
                {`<a href="https://banglabazar.com?ref=${affiliateCode}">...</a>`}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
