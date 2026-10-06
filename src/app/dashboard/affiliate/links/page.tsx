"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Link as LinkIcon,
  Copy,
  Check,
  ExternalLink,
  Plus,
  QrCode,
  Sparkles,
  MousePointerClick,
  ShoppingBag,
  DollarSign,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AffiliateLinksPage() {
  const { data: session } = useSession();
  const [links, setLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Create link state
  const [targetUrl, setTargetUrl] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [creating, setCreating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Selected QR code
  const [qrModalUrl, setQrModalUrl] = useState<string | null>(null);

  const user = session?.user as any;
  const affiliateCode = user?.affiliateCode || "AFF-PARTNER";

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/affiliate/links", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setLinks(data.links || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUrl) {
      toast.error("Please enter a target URL from Bangla Bazar");
      return;
    }

    try {
      setCreating(true);
      const res = await fetch("/api/affiliate/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUrl, customSlug }),
      });

      if (res.ok) {
        toast.success("Affiliate tracking link created!");
        setTargetUrl("");
        setCustomSlug("");
        fetchLinks();
      } else {
        toast.error("Failed to create link");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setCreating(false);
    }
  };

  const buildFinalUrl = (url: string, slug?: string) => {
    const cleanUrl = url.trim();
    const sep = cleanUrl.includes("?") ? "&" : "?";
    return `${cleanUrl}${sep}ref=${affiliateCode}${slug ? `&campaign=${encodeURIComponent(slug)}` : ""}`;
  };

  const handleCopy = (finalUrl: string, id: string) => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(finalUrl);
      setCopiedId(id);
      toast.success("Tracking link copied to clipboard!");
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const filteredLinks = links.filter((l) =>
    l.targetUrl.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (l.customSlug && l.customSlug.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Affiliate Link Generator</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Generate custom referral links for products, categories, or promotional campaigns with deep tracking
        </p>
      </div>

      {/* ── Link Creation Tool ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-2xs">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-[#1E60ED]">
            <Plus className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Create New Tracking Link</h2>
        </div>

        <form onSubmit={handleCreateLink} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Target Page / Product URL <span className="text-red-500">*</span>
              </label>
              <Input
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="e.g. https://banglabazar.com/products/smartphone-x or /categories/electronics"
                className="h-11 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Campaign / Source Tag (Optional)
              </label>
              <Input
                value={customSlug}
                onChange={(e) => setCustomSlug(e.target.value)}
                placeholder="e.g. facebook-reel, youtube-review"
                className="h-11 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <Button
              type="submit"
              disabled={creating}
              className="h-11 px-6 rounded-xl bg-[#1E60ED] hover:bg-blue-700 text-white font-extrabold text-xs shadow-md shadow-blue-500/20"
            >
              {creating ? "Generating..." : "Generate Tracking Link"}
            </Button>
          </div>
        </form>
      </div>

      {/* ── Generated Links List ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-base font-black text-slate-900 dark:text-white">Active Tracking Links</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">All links created with your tracking code</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search your links..."
              className="h-9 pl-9 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
            />
          </div>
        </div>

        {filteredLinks.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-[#1E60ED] flex items-center justify-center mx-auto mb-3">
              <LinkIcon className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No custom links created yet</p>
            <p className="text-xs text-slate-400 mt-1">Use the form above to generate your first tracking link.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold">
                  <th className="py-3 px-3">Target & Tracking URL</th>
                  <th className="py-3 px-3">Campaign Tag</th>
                  <th className="py-3 px-3">Clicks</th>
                  <th className="py-3 px-3">Orders</th>
                  <th className="py-3 px-3">Earnings</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredLinks.map((item) => {
                  const finalUrl = buildFinalUrl(item.targetUrl, item.customSlug);
                  const isCopied = copiedId === item.id;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-3 max-w-sm">
                        <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{item.targetUrl}</p>
                        <p className="text-[11px] font-mono text-blue-600 dark:text-blue-400 truncate mt-0.5 select-all">
                          {finalUrl}
                        </p>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono text-[10px] font-bold">
                          {item.customSlug || "default"}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-slate-700 dark:text-slate-300">
                        {item.clicks || 0}
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-slate-700 dark:text-slate-300">
                        {item.conversions || 0}
                      </td>
                      <td className="py-3.5 px-3 font-bold text-emerald-600">
                        ৳{(item.earnings || 0).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            onClick={() => handleCopy(finalUrl, item.id)}
                            className="h-8 px-3 rounded-lg bg-[#1E60ED] hover:bg-blue-700 text-white text-xs font-bold gap-1"
                          >
                            {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{isCopied ? "Copied" : "Copy"}</span>
                          </Button>
                          <a
                            href={finalUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 transition-colors"
                            title="Open Link"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
