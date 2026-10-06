"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Truck,
  Package,
  CheckCircle2,
  Clock,
  MapPin,
  Store,
  ShieldCheck,
  RotateCcw,
  ArrowRight,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Loader2,
  XCircle,
  Hourglass,
  BadgeCheck,
  Star,
} from "lucide-react";

// ─── Types ───
interface DeliveryStats {
  totalOrders: number;
  deliveredOrders: number;
  processingOrders: number;
  shippedOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
  successRate: number;
  avgDeliveryDays: number;
  activeStores: number;
  activeSellers: number;
  citiesCovered: number;
}

interface Courier {
  name: string;
  count: number;
}

// ─── FAQ data ───
const faqs = [
  {
    q: "How long does delivery take?",
    a: "Within Dhaka city, delivery typically takes 1–2 business days. For other districts across Bangladesh, it takes 3–5 business days depending on your location.",
  },
  {
    q: "What are the delivery charges?",
    a: "Delivery within Dhaka costs BDT 60–80, and outside Dhaka costs BDT 100–150. Free delivery is available on orders above a certain amount.",
  },
  {
    q: "Can I track my delivery?",
    a: "Yes! Once your order is shipped, a tracking number will be sent to your email and SMS. You can also track your order in real time from your customer dashboard.",
  },
  {
    q: "What if I don't receive my order or it's damaged?",
    a: "If your order is missing or arrives damaged, submit a return request within 7 days of delivery. We will arrange a replacement or issue a full refund.",
  },
  {
    q: "Which areas do you deliver to?",
    a: "We deliver to all 64 districts across Bangladesh. Remote areas may take an additional 1–2 days.",
  },
  {
    q: "What happens if my order has products from multiple sellers?",
    a: "Since Bangla Bazar is a multivendor marketplace, products from different sellers in the same order may arrive in separate shipments.",
  },
];

// ─── Zone data ───
const deliveryZones = [
  {
    zone: "Dhaka City",
    time: "1–2 Business Days",
    charge: "BDT 60–80",
    color: "bg-blue-50 border-blue-200",
    badge: "text-blue-700 bg-blue-100",
  },
  {
    zone: "Dhaka Division",
    time: "2–3 Business Days",
    charge: "BDT 80–100",
    color: "bg-violet-50 border-violet-200",
    badge: "text-violet-700 bg-violet-100",
  },
  {
    zone: "Chittagong Division",
    time: "3–4 Business Days",
    charge: "BDT 100–130",
    color: "bg-emerald-50 border-emerald-200",
    badge: "text-emerald-700 bg-emerald-100",
  },
  {
    zone: "Sylhet / Rajshahi",
    time: "3–5 Business Days",
    charge: "BDT 100–130",
    color: "bg-orange-50 border-orange-200",
    badge: "text-orange-700 bg-orange-100",
  },
  {
    zone: "Khulna / Barisal",
    time: "3–5 Business Days",
    charge: "BDT 100–130",
    color: "bg-teal-50 border-teal-200",
    badge: "text-teal-700 bg-teal-100",
  },
  {
    zone: "Mymensingh / Rangpur",
    time: "4–5 Business Days",
    charge: "BDT 120–150",
    color: "bg-rose-50 border-rose-200",
    badge: "text-rose-700 bg-rose-100",
  },
];

// ─── Courier color map ───
const courierColors: Record<string, string> = {
  Pathao: "bg-orange-100 text-orange-700",
  Paperfly: "bg-blue-100 text-blue-700",
  RedX: "bg-red-100 text-red-700",
  "SA Paribahan": "bg-green-100 text-green-700",
  Sundarban: "bg-yellow-100 text-yellow-700",
};

export default function DeliveryInfoPage() {
  const [stats, setStats] = useState<DeliveryStats | null>(null);
  const [couriers, setCouriers] = useState<Courier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/delivery-info")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setStats(data.stats);
          setCouriers(data.topCouriers || []);
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const statCards = stats
    ? [
        {
          label: "Total Orders",
          value: stats.totalOrders.toLocaleString(),
          icon: Package,
          color: "text-blue-600",
          bg: "bg-blue-50",
        },
        {
          label: "Delivered",
          value: stats.deliveredOrders.toLocaleString(),
          icon: CheckCircle2,
          color: "text-emerald-600",
          bg: "bg-emerald-50",
        },
        {
          label: "Success Rate",
          value: `${stats.successRate}%`,
          icon: Star,
          color: "text-violet-600",
          bg: "bg-violet-50",
        },
        {
          label: "Avg. Delivery",
          value: `${stats.avgDeliveryDays} days`,
          icon: Clock,
          color: "text-orange-600",
          bg: "bg-orange-50",
        },
        {
          label: "Active Sellers",
          value: stats.activeSellers.toLocaleString(),
          icon: Store,
          color: "text-rose-600",
          bg: "bg-rose-50",
        },
        {
          label: "Districts",
          value: `${stats.citiesCovered}`,
          icon: MapPin,
          color: "text-teal-600",
          bg: "bg-teal-50",
        },
      ]
    : [];

  const orderStatusBreakdown = stats
    ? [
        { label: "Delivered", count: stats.deliveredOrders, color: "bg-emerald-500", icon: CheckCircle2 },
        { label: "Shipped", count: stats.shippedOrders, color: "bg-blue-500", icon: Truck },
        { label: "Processing", count: stats.processingOrders, color: "bg-violet-500", icon: Hourglass },
        { label: "Pending", count: stats.pendingOrders, color: "bg-orange-400", icon: Clock },
        { label: "Cancelled", count: stats.cancelledOrders, color: "bg-rose-400", icon: XCircle },
      ]
    : [];

  const maxCount = orderStatusBreakdown.reduce((m, s) => Math.max(m, s.count), 1);

  return (
    <div className="bg-[#f8fafc] min-h-screen">
      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0052ff] via-[#2563eb] to-[#1e40af] text-white">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-white/5 blur-3xl" />
        </div>
        <div className="container max-w-5xl mx-auto px-4 py-20 md:py-28 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-sm font-medium px-4 py-2 rounded-full mb-6">
            <Truck size={14} />
            Nationwide Delivery Network
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">
            Delivery Information
          </h1>
          <p className="text-blue-100 text-lg max-w-xl mx-auto">
            Fast, safe and reliable delivery to all 64 districts across Bangladesh.
          </p>
        </div>
      </section>

      {/* ─── Live Stats ─── */}
      <section className="container max-w-5xl mx-auto px-4 -mt-10 relative z-20 mb-16">
        {loading ? (
          <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-12 flex flex-col items-center gap-3">
            <Loader2 size={32} className="text-[#2563eb] animate-spin" />
            <p className="text-slate-500 text-sm">Loading delivery data...</p>
          </div>
        ) : error ? (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-8 flex items-center gap-3 text-rose-700">
            <AlertCircle size={22} />
            <p className="text-sm font-medium">Failed to load delivery data. Please try again later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {statCards.map((s) => (
              <div
                key={s.label}
                className="bg-white rounded-2xl p-5 shadow-[0_4px_24px_rgba(0,0,0,0.07)] border border-slate-100 flex flex-col items-center text-center hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`w-11 h-11 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>
                  <s.icon size={20} className={s.color} />
                </div>
                <p className={`text-xl font-extrabold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-slate-500 mt-1 font-medium leading-tight">{s.label}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ─── Order Status Breakdown ─── */}
      {!loading && !error && stats && (
        <section className="container max-w-5xl mx-auto px-4 mb-16">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-8">
            <h2 className="text-xl font-extrabold text-slate-900 mb-6">Order Status Breakdown</h2>
            <div className="space-y-4">
              {orderStatusBreakdown.map((item) => (
                <div key={item.label} className="flex items-center gap-4">
                  <div className="w-28 flex items-center gap-2 shrink-0">
                    <item.icon size={15} className="text-slate-500" />
                    <span className="text-sm text-slate-600 font-medium">{item.label}</span>
                  </div>
                  <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-3 rounded-full ${item.color} transition-all duration-700`}
                      style={{ width: `${Math.max(2, (item.count / maxCount) * 100)}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-slate-700 w-16 text-right">
                    {item.count.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── Delivery Zones ─── */}
      <section className="container max-w-5xl mx-auto px-4 mb-16">
        <div className="text-center mb-10">
          <span className="inline-block text-xs font-bold text-[#2563eb] bg-blue-50 border border-blue-100 px-3 py-1 rounded-full uppercase tracking-widest mb-3">
            Delivery Zones
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">
            Estimated Delivery Time & Charges by Zone
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {deliveryZones.map((z) => (
            <div
              key={z.zone}
              className={`rounded-2xl border p-5 ${z.color} hover:shadow-md transition-all duration-200 hover:-translate-y-0.5`}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-bold text-slate-800">{z.zone}</h3>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${z.badge}`}>
                  {z.charge}
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Clock size={14} />
                <span className="text-sm">{z.time}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Courier Partners ─── */}
      {!loading && couriers.length > 0 && (
        <section className="container max-w-5xl mx-auto px-4 mb-16">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-8">
            <h2 className="text-xl font-extrabold text-slate-900 mb-2">Courier Partners</h2>
            <p className="text-slate-500 text-sm mb-6">
              Courier services used across our platform for order fulfillment.
            </p>
            <div className="flex flex-wrap gap-3">
              {couriers.map((c) => (
                <div
                  key={c.name}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm ${
                    courierColors[c.name] || "bg-slate-100 text-slate-700"
                  }`}
                >
                  <Truck size={15} />
                  {c.name}
                  {c.count > 0 && (
                    <span className="text-xs opacity-70">({c.count.toLocaleString()} shipments)</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── Delivery Features ─── */}
      <section className="container max-w-5xl mx-auto px-4 mb-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            {
              icon: BadgeCheck,
              title: "Verified Sellers",
              desc: "Every seller on our platform is verified — ensuring safe and trustworthy purchases.",
              color: "text-blue-600",
              bg: "bg-blue-50",
              border: "border-blue-100",
            },
            {
              icon: ShieldCheck,
              title: "Product Protection",
              desc: "If your package is damaged during shipping, we guarantee a 100% refund or replacement.",
              color: "text-emerald-600",
              bg: "bg-emerald-50",
              border: "border-emerald-100",
            },
            {
              icon: RotateCcw,
              title: "Easy Returns",
              desc: "Return any item within 7 days of delivery — no questions asked.",
              color: "text-violet-600",
              bg: "bg-violet-50",
              border: "border-violet-100",
            },
            {
              icon: Truck,
              title: "Real-Time Tracking",
              desc: "Get live tracking updates via SMS and your customer dashboard.",
              color: "text-orange-600",
              bg: "bg-orange-50",
              border: "border-orange-100",
            },
          ].map((f) => (
            <div
              key={f.title}
              className={`bg-white rounded-2xl p-6 border ${f.border} shadow-[0_2px_16px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_28px_rgba(0,0,0,0.09)] transition-all duration-300 hover:-translate-y-1`}
            >
              <div className={`w-11 h-11 ${f.bg} rounded-xl flex items-center justify-center mb-4`}>
                <f.icon size={20} className={f.color} />
              </div>
              <h3 className="font-bold text-slate-900 mb-1.5 text-sm">{f.title}</h3>
              <p className="text-slate-500 text-xs leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="container max-w-3xl mx-auto px-4 mb-20">
        <div className="text-center mb-10">
          <span className="inline-block text-xs font-bold text-[#2563eb] bg-blue-50 border border-blue-100 px-3 py-1 rounded-full uppercase tracking-widest mb-3">
            FAQ
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">
            Frequently Asked Questions
          </h2>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-4 text-left"
              >
                <span className="font-semibold text-slate-800 text-sm pr-4">{faq.q}</span>
                {openFaq === i ? (
                  <ChevronUp size={18} className="text-[#2563eb] shrink-0" />
                ) : (
                  <ChevronDown size={18} className="text-slate-400 shrink-0" />
                )}
              </button>
              {openFaq === i && (
                <div className="px-6 pb-5 text-slate-600 text-sm leading-relaxed border-t border-slate-50 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="container max-w-5xl mx-auto px-4 pb-20">
        <div className="bg-gradient-to-br from-[#0052ff] to-[#2563eb] rounded-3xl p-8 md:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-extrabold mb-2">Start Shopping Now</h2>
            <p className="text-blue-100 text-sm">
              Choose from thousands of products with fast and reliable delivery guaranteed.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-white text-[#2563eb] font-semibold px-7 py-3 rounded-full hover:bg-blue-50 transition-all shadow-lg"
            >
              Browse Products
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/dashboard/customer/orders"
              className="inline-flex items-center gap-2 bg-white/10 border border-white/30 text-white font-semibold px-7 py-3 rounded-full hover:bg-white/20 transition-all"
            >
              Track Your Order
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
