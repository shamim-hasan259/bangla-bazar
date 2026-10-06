"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Tag,
  Sparkles,
  Zap,
  Gift,
  Copy,
  Check,
  Percent,
  Clock,
  Flame,
  ArrowRight,
  BadgePercent,
  CreditCard,
  ShoppingBag,
  Truck,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  ExternalLink,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import axios from "axios";

interface CouponItem {
  id: string;
  code: string;
  title: string;
  discount: string;
  minSpend: string;
  category: string;
  expiry: string;
  description: string;
  badge: string;
  color: string;
  bg: string;
}

const PROMOTIONAL_COUPONS: CouponItem[] = [
  {
    id: "c-1",
    code: "WELCOME100",
    title: "New Customer Welcome Discount",
    discount: "৳100 OFF",
    minSpend: "Min. spend ৳1,000",
    category: "Site-wide",
    expiry: "Active This Month",
    description: "Enjoy instant ৳100 discount on your very first order across all verified stores on Bangla Bazar.",
    badge: "First Order",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/40",
  },
  {
    id: "c-2",
    code: "FREEDEL2026",
    title: "Nationwide Free Delivery Voucher",
    discount: "FREE SHIPPING",
    minSpend: "Min. order ৳1,500",
    category: "Delivery",
    expiry: "Limited Redemptions",
    description: "Get 100% free home delivery across all 64 districts in Bangladesh on qualifying orders.",
    badge: "Free Delivery",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
  },
  {
    id: "c-3",
    code: "TECHMEGA15",
    title: "Electronics & Smart Gadget Bonanza",
    discount: "15% OFF",
    minSpend: "Max. discount ৳1,500",
    category: "Electronics",
    expiry: "Valid till Friday",
    description: "Save 15% on brand smartwatches, TWS earbuds, fast chargers, power banks, and home tech accessories.",
    badge: "Mega Tech",
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-50 dark:bg-violet-950/40",
  },
  {
    id: "c-4",
    code: "ORGANIC20",
    title: "Pure Farm Agro & Honey Offer",
    discount: "20% OFF",
    minSpend: "Min. spend ৳1,200",
    category: "Groceries & Farm",
    expiry: "Active Now",
    description: "Exclusive markdown on certified mustard oil, Sundarban pure honey, organic ghee, and aromatic rice.",
    badge: "Farm Fresh",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/40",
  },
  {
    id: "c-5",
    code: "FASHIONFEST",
    title: "Traditional Weaves & Apparel Sale",
    discount: "৳350 OFF",
    minSpend: "Min. spend ৳2,500",
    category: "Fashion",
    expiry: "Active This Weekend",
    description: "Flat ৳350 rebate on handloom Tangail sarees, premium cotton Panjabis, and designer kurtis.",
    badge: "Festive Fashion",
    color: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-50 dark:bg-rose-950/40",
  },
  {
    id: "c-6",
    code: "BKASHCASH10",
    title: "bKash / Nagad Instant Cashback",
    discount: "10% CASHBACK",
    minSpend: "Max cashback ৳250",
    category: "Payment Offer",
    expiry: "All Payment Methods",
    description: "Pay digitally with bKash, Nagad, or Visa/Mastercard and receive automated wallet cashback instantly.",
    badge: "Digital Pay",
    color: "text-pink-600 dark:text-pink-400",
    bg: "bg-pink-50 dark:bg-pink-950/40",
  },
];

export default function PromotionsPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [emailInput, setEmailInput] = useState<string>("");
  const [flashSaleData, setFlashSaleData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch backend flash sales & offers
  useEffect(() => {
    const fetchPromos = async () => {
      try {
        setLoading(true);
        const [flashRes, offerRes] = await Promise.allSettled([
          axios.get("/api/flash-sale"),
          axios.get("/api/offer"),
        ]);

        if (flashRes.status === "fulfilled" && flashRes.value.data) {
          setFlashSaleData(flashRes.value.data);
        }
      } catch (err) {
        console.warn("Could not fetch dynamic promo stream:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPromos();
  }, []);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Coupon code "${code}" copied to clipboard! Paste at checkout to save.`);
    setTimeout(() => {
      setCopiedCode(null);
    }, 2500);
  };

  const handleSubscribeNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) {
      toast.error("Please enter a valid email address.");
      return;
    }
    toast.success("Subscribed! We will notify you whenever exclusive deals and secret coupons drop.");
    setEmailInput("");
  };

  const categories = ["All", "Site-wide", "Delivery", "Electronics", "Groceries & Farm", "Fashion", "Payment Offer"];

  const filteredCoupons = PROMOTIONAL_COUPONS.filter((coupon) => {
    if (selectedCategory === "All") return true;
    return coupon.category === selectedCategory;
  });

  return (
    <div className="bg-[#f8fafc] dark:bg-slate-950 min-h-screen text-slate-800 dark:text-slate-100">
      {/* ─── Hero Banner ─── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0052ff] via-[#2563eb] to-[#1e40af] text-white">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -right-32 w-[450px] h-[450px] rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-[450px] h-[450px] rounded-full bg-white/10 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-sky-300/[0.08] blur-2xl" />
        </div>

        <div className="container max-w-5xl mx-auto px-4 py-16 md:py-24 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/25 text-white text-xs md:text-sm font-semibold px-4 py-1.5 rounded-full mb-6 shadow-sm">
            <Flame size={16} className="text-amber-300 animate-pulse" />
            Active Deals & Mega Savings
          </div>

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-5 leading-tight">
            Exclusive Deals, Vouchers & Promotions
          </h1>

          <p className="text-blue-100 text-sm md:text-base max-w-2xl mx-auto leading-relaxed mb-8 font-normal">
            Save extra on every order! Unlock verified discount promo codes, flash sales, free delivery vouchers,
            and digital wallet cashback offers.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="#coupons"
              className="inline-flex items-center gap-2 bg-white text-[#2563eb] font-bold px-7 py-3 rounded-full hover:bg-blue-50 transition-all text-xs md:text-sm shadow-lg hover:shadow-xl"
            >
              <Tag size={16} />
              Browse Discount Coupons ({PROMOTIONAL_COUPONS.length})
            </a>
            <Link
              href="/flash-sales"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white font-semibold px-7 py-3 rounded-full transition-all text-xs md:text-sm"
            >
              <Zap size={16} className="text-yellow-300" />
              Live Flash Sales
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Highlights Promo Strip ─── */}
      <section className="container max-w-6xl mx-auto px-4 -mt-8 relative z-20 mb-14">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: "Up to 50% Off",
              subtitle: "Seasonal Clearance",
              icon: Percent,
              color: "text-rose-600 dark:text-rose-400",
              bg: "bg-rose-50 dark:bg-rose-950/40",
            },
            {
              title: "Free Delivery",
              subtitle: "Orders over ৳1,500",
              icon: Truck,
              color: "text-emerald-600 dark:text-emerald-400",
              bg: "bg-emerald-50 dark:bg-emerald-950/40",
            },
            {
              title: "Instant Cashback",
              subtitle: "Via bKash & Cards",
              icon: CreditCard,
              color: "text-blue-600 dark:text-blue-400",
              bg: "bg-blue-50 dark:bg-blue-950/40",
            },
            {
              title: "100% Genuine",
              subtitle: "Guaranteed Authentic",
              icon: ShieldCheck,
              color: "text-amber-600 dark:text-amber-400",
              bg: "bg-amber-50 dark:bg-amber-950/40",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.06)] border border-slate-100 dark:border-slate-800 flex items-center gap-4 hover:shadow-[0_8px_30px_rgba(0,0,0,0.1)] transition-all"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${item.bg} ${item.color}`}>
                <item.icon size={22} />
              </div>
              <div>
                <p className="text-sm md:text-base font-extrabold text-slate-900 dark:text-slate-100">{item.title}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{item.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Active Flash Sales & Campaigns Section ─── */}
      {flashSaleData && flashSaleData.products && flashSaleData.products.length > 0 && (
        <section className="container max-w-6xl mx-auto px-4 mb-16">
          <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 rounded-3xl p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1 bg-white/20 px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider">
                <Flame size={14} className="text-yellow-300" /> Hourly Flash Sale Event
              </span>
              <h3 className="text-2xl md:text-3xl font-black">
                {flashSaleData.title || "Super Saver Flash Deals"}
              </h3>
              <p className="text-white/90 text-xs md:text-sm max-w-lg">
                Limited-stock flash discounts on selected bestsellers. Deals refresh continuously!
              </p>
            </div>
            <div className="shrink-0">
              <Link
                href="/flash-sales"
                className="inline-flex items-center gap-2 bg-white text-orange-600 font-extrabold px-7 py-3 rounded-full text-xs md:text-sm shadow-lg hover:bg-orange-50 transition-all hover:scale-105"
              >
                Explore Flash Deals
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ─── Main Promo Codes & Vouchers Catalog ─── */}
      <section id="coupons" className="container max-w-6xl mx-auto px-4 mb-20 scroll-mt-20">
        <div className="text-center mb-10">
          <span className="text-xs font-bold text-[#2563eb] bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900 px-3 py-1 rounded-full uppercase tracking-wider">
            Coupon Vault
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-2">
            Active Discount Codes
          </h2>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
            Click on any coupon code below to copy it instantly and apply during checkout.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === cat
                  ? "bg-[#2563eb] text-white shadow-md"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Coupons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCoupons.map((coupon) => (
            <div
              key={coupon.id}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-[0_2px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(37,99,235,0.08)] transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1 relative overflow-hidden"
            >
              {/* Coupon Cutout Notch Decorations */}
              <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#f8fafc] dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800" />
              <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#f8fafc] dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800" />

              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${coupon.bg} ${coupon.color}`}>
                    {coupon.badge}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                    <Clock size={12} />
                    {coupon.expiry}
                  </span>
                </div>

                <div className="mb-2">
                  <p className="text-2xl font-black text-[#2563eb] tracking-tight">{coupon.discount}</p>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1">{coupon.title}</h3>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                  {coupon.description}
                </p>
              </div>

              <div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-between gap-2">
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-slate-400">Coupon Code</span>
                    <span className="font-mono font-extrabold text-sm tracking-wider text-slate-900 dark:text-slate-100">
                      {coupon.code}
                    </span>
                  </div>

                  <Button
                    onClick={() => handleCopyCode(coupon.code)}
                    size="sm"
                    className={`rounded-xl text-xs font-bold transition-all ${
                      copiedCode === coupon.code
                        ? "bg-emerald-600 text-white"
                        : "bg-[#2563eb] hover:bg-blue-700 text-white shadow-sm"
                    }`}
                  >
                    {copiedCode === coupon.code ? (
                      <>
                        <Check size={14} className="mr-1" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={13} className="mr-1" />
                        Copy Code
                      </>
                    )}
                  </Button>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2.5 px-1">
                  <span>{coupon.minSpend}</span>
                  <span className="text-[#2563eb] font-semibold">{coupon.category}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── How to Redeem Promo Codes Guide ─── */}
      <section className="container max-w-5xl mx-auto px-4 mb-20">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
          <div className="text-center mb-8">
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
              How to Redeem Your Promotion
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Apply discount vouchers in 3 simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="space-y-2 p-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-[#2563eb] font-extrabold text-lg flex items-center justify-center mx-auto">
                1
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">Copy Voucher Code</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Choose any eligible coupon from this page and click "Copy Code".
              </p>
            </div>

            <div className="space-y-2 p-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-[#2563eb] font-extrabold text-lg flex items-center justify-center mx-auto">
                2
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">Add Items to Cart</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Shop your favorite groceries, gadgets, and apparel fulfilling minimum spend limits.
              </p>
            </div>

            <div className="space-y-2 p-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-[#2563eb] font-extrabold text-lg flex items-center justify-center mx-auto">
                3
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">Apply at Checkout</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Paste the code in the "Apply Coupon" box on the checkout page for instant savings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Promo Alerts Subscription ─── */}
      <section className="container max-w-5xl mx-auto px-4 pb-20">
        <div className="bg-gradient-to-br from-[#0052ff] to-[#2563eb] rounded-3xl p-8 md:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-xs font-bold text-yellow-300 bg-white/10 px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1">
              <Gift size={14} /> Never Miss a Deal
            </span>
            <h3 className="text-2xl md:text-3xl font-extrabold">Get Secret Coupons in Your Inbox</h3>
            <p className="text-blue-100 text-xs md:text-sm max-w-md leading-relaxed">
              Subscribe to Bangla Bazar Deal Alerts and be the first to know about flash sales and VIP voucher codes.
            </p>
          </div>

          <form onSubmit={handleSubscribeNewsletter} className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
            <Input
              type="email"
              required
              placeholder="Enter your email address..."
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              className="bg-white/15 border-white/30 text-white placeholder:text-blue-200 rounded-full px-5 py-3 text-xs w-full sm:w-72 focus-visible:ring-white"
            />
            <Button
              type="submit"
              className="bg-white hover:bg-blue-50 text-[#2563eb] font-bold px-7 py-3 rounded-full text-xs shadow-lg shrink-0"
            >
              Get Alerts
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
}
