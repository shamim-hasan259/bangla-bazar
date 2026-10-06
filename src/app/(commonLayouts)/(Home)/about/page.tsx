import React from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Users,
  Star,
  TrendingUp,
  Shield,
  Truck,
  HeartHandshake,
  Zap,
  MapPin,
  Phone,
  Mail,
  ArrowRight,
  CheckCircle2,
  Award,
  Globe,
  Package,
} from "lucide-react";
import prisma from "@/index";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "About Us | Bangla Bazar",
  description:
    "Learn about Bangla Bazar — Bangladesh's trusted online marketplace connecting buyers and sellers with quality products, fast delivery, and secure payments.",
};

// ─── Helper: format large numbers ───
function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M+`;
  if (n >= 1_000) return `${Math.floor(n / 1_000)}K+`;
  return `${n}+`;
}

// ─── Fetch real data from DB ───
async function getAboutStats() {
  try {
    const [totalCustomers, totalProducts, totalSellers, totalOrders] =
      await Promise.all([
        prisma.customer.count(),
        prisma.product.count(),
        prisma.seller.count({ where: { status: "Active" } }),
        prisma.sales.count(),
      ]);
    return { totalCustomers, totalProducts, totalSellers, totalOrders };
  } catch {
    return {
      totalCustomers: 0,
      totalProducts: 0,
      totalSellers: 0,
      totalOrders: 0,
    };
  }
}

const values = [
  {
    icon: Shield,
    title: "Trust & Safety",
    desc: "Every transaction is protected with end-to-end encryption and buyer protection policies.",
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-100",
  },
  {
    icon: Truck,
    title: "Fast Delivery",
    desc: "Lightning-fast nationwide delivery right to your doorstep within 2–5 business days.",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
  },
  {
    icon: HeartHandshake,
    title: "Seller Support",
    desc: "We empower local businesses with tools, analytics, and dedicated support to grow.",
    color: "text-rose-600",
    bg: "bg-rose-50",
    border: "border-rose-100",
  },
  {
    icon: Zap,
    title: "Innovation",
    desc: "Constantly evolving with smart technology to enhance your shopping experience.",
    color: "text-violet-600",
    bg: "bg-violet-50",
    border: "border-violet-100",
  },
];

const milestones = [
  { year: "2020", title: "Founded", desc: "Bangla Bazar was launched with a vision to digitize Bangladesh's retail market." },
  { year: "2021", title: "1,000 Sellers", desc: "Reached our first milestone of 1,000 verified sellers across 8 divisions." },
  { year: "2022", title: "Mobile App", desc: "Launched our Android & iOS apps, making shopping possible for millions on the go." },
  { year: "2023", title: "500K Customers", desc: "Half a million customers placed their trust in Bangla Bazar." },
  { year: "2024", title: "64 Districts", desc: "Expanded delivery network to cover all 64 districts of Bangladesh." },
  { year: "2025", title: "Thriving Future", desc: "Continuing to grow with AI-powered recommendations and seller empowerment tools." },
];

const team = [
  {
    name: "Manishankar Vakta",
    role: "Founder & CEO",
    desc: "Visionary entrepreneur passionate about empowering Bangladeshi businesses through technology.",
    initials: "MV",
    gradient: "from-blue-600 to-blue-400",
  },
  {
    name: "Ratul Ahmed",
    role: "Chief Technology Officer",
    desc: "Full-stack architect building scalable systems that power seamless commerce experiences.",
    initials: "RA",
    gradient: "from-violet-600 to-violet-400",
  },
  {
    name: "Shamim Hossain",
    role: "Head of Operations",
    desc: "Driving end-to-end logistics and seller partnerships across Bangladesh.",
    initials: "SH",
    gradient: "from-emerald-600 to-emerald-400",
  },
];

const AboutPage = async () => {
  const { totalCustomers, totalProducts, totalSellers, totalOrders } =
    await getAboutStats();

  const stats = [
    {
      label: "Active Customers",
      value: formatCount(totalCustomers),
      rawValue: totalCustomers,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Products Listed",
      value: formatCount(totalProducts),
      rawValue: totalProducts,
      icon: ShoppingBag,
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
    {
      label: "Active Sellers",
      value: formatCount(totalSellers),
      rawValue: totalSellers,
      icon: Award,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Orders Completed",
      value: formatCount(totalOrders),
      rawValue: totalOrders,
      icon: Package,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
  ];

  return (
    <div className="bg-[#f8fafc] min-h-screen">
      {/* ─── Hero Section ─── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0052ff] via-[#2563eb] to-[#1e40af] text-white">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-white/[0.02] blur-2xl" />
        </div>
        <div className="container max-w-5xl mx-auto px-4 py-24 md:py-32 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium px-4 py-2 rounded-full mb-8">
            <Star size={14} className="fill-yellow-300 text-yellow-300" />
            Bangladesh's Trusted Marketplace
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6 tracking-tight">
            We're Building the Future
            <br />
            <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
              of Shopping in Bangladesh
            </span>
          </h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed mb-10">
            Bangla Bazar connects millions of customers with thousands of local
            sellers — delivering quality, trust, and value every single day.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-white text-[#2563eb] font-semibold px-8 py-3.5 rounded-full hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Start Shopping
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/auth/seller/register"
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/30 text-white font-semibold px-8 py-3.5 rounded-full hover:bg-white/20 transition-all duration-200"
            >
              Become a Seller
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Stats Section (Dynamic) ─── */}
      <section className="container max-w-5xl mx-auto px-4 -mt-10 relative z-20 mb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-2xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.07)] border border-slate-100 flex flex-col items-center text-center hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center mb-3`}>
                <stat.icon size={22} className={stat.color} />
              </div>
              <p className="text-2xl md:text-3xl font-extrabold text-slate-900">
                {stat.rawValue === 0 ? "—" : stat.value}
              </p>
              <p className="text-xs text-slate-500 mt-1 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Mission Section ─── */}
      <section className="container max-w-5xl mx-auto px-4 mb-20">
        <div className="bg-white rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-slate-100 p-8 md:p-14 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-block text-xs font-bold text-[#2563eb] bg-blue-50 border border-blue-100 px-3 py-1 rounded-full uppercase tracking-widest mb-4">
              Our Mission
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight mb-5">
              Empowering Every{" "}
              <span className="text-[#2563eb]">Bangladeshi</span> to Buy & Sell
            </h2>
            <p className="text-slate-600 leading-relaxed mb-6">
              Bangla Bazar was born from a simple idea: every person in
              Bangladesh deserves access to a safe, affordable, and enjoyable
              online shopping experience — from the hills of Chittagong to the
              chars of Kurigram.
            </p>
            <p className="text-slate-600 leading-relaxed">
              We believe in small businesses. Every seller on our platform is a
              dream — and we provide the infrastructure, visibility, and support
              to make those dreams reality.
            </p>
          </div>
          <div className="space-y-4">
            {[
              "100% secure payment processing with SSLCommerz & bKash",
              "Verified seller program with quality assurance checks",
              "24/7 customer support in Bangla and English",
              "Easy returns and full refund guarantee",
              "Nationwide delivery network covering all 64 districts",
              "AI-powered product recommendations for better discovery",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <CheckCircle2 size={20} className="text-emerald-500 shrink-0 mt-0.5" />
                <p className="text-slate-700 text-sm leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Values Section ─── */}
      <section className="container max-w-5xl mx-auto px-4 mb-20">
        <div className="text-center mb-12">
          <span className="inline-block text-xs font-bold text-[#2563eb] bg-blue-50 border border-blue-100 px-3 py-1 rounded-full uppercase tracking-widest mb-4">
            Our Values
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">
            What We Stand For
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((v) => (
            <div
              key={v.title}
              className={`bg-white rounded-2xl p-6 border ${v.border} shadow-[0_2px_16px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.1)] transition-all duration-300 hover:-translate-y-1`}
            >
              <div className={`w-12 h-12 ${v.bg} rounded-xl flex items-center justify-center mb-4`}>
                <v.icon size={22} className={v.color} />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">{v.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Journey / Timeline ─── */}
      <section className="bg-gradient-to-br from-slate-900 to-slate-800 py-20 mb-20">
        <div className="container max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-block text-xs font-bold text-blue-300 bg-blue-900/40 border border-blue-700/40 px-3 py-1 rounded-full uppercase tracking-widest mb-4">
              Our Journey
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">
              From Idea to Impact
            </h2>
          </div>
          <div className="relative">
            <div className="hidden md:block absolute left-1/2 -translate-x-0.5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-violet-500 to-emerald-500 opacity-30 rounded-full" />
            <div className="space-y-10">
              {milestones.map((m, i) => (
                <div
                  key={m.year}
                  className={`flex flex-col md:flex-row items-center gap-6 ${
                    i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                >
                  <div className={`flex-1 ${i % 2 === 0 ? "md:text-right" : "md:text-left"}`}>
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 inline-block text-left max-w-sm">
                      <p className="text-blue-400 text-sm font-bold mb-1">{m.year}</p>
                      <h3 className="text-white font-bold text-lg mb-2">{m.title}</h3>
                      <p className="text-slate-400 text-sm leading-relaxed">{m.desc}</p>
                    </div>
                  </div>
                  <div className="hidden md:flex w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 border-4 border-slate-800 shrink-0 z-10" />
                  <div className="flex-1 hidden md:block" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Team Section ─── */}
      <section className="container max-w-5xl mx-auto px-4 mb-20">
        <div className="text-center mb-12">
          <span className="inline-block text-xs font-bold text-[#2563eb] bg-blue-50 border border-blue-100 px-3 py-1 rounded-full uppercase tracking-widest mb-4">
            The Team
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">
            People Behind Bangla Bazar
          </h2>
          <p className="text-slate-500 mt-3 max-w-lg mx-auto text-sm">
            A passionate team committed to revolutionizing e-commerce in Bangladesh.
          </p>
        </div>
        <div className="grid sm:grid-cols-3 gap-6">
          {team.map((member) => (
            <div
              key={member.name}
              className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.10)] transition-all duration-300 hover:-translate-y-1 text-center"
            >
              <div
                className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${member.gradient} flex items-center justify-center text-white text-2xl font-extrabold mx-auto mb-4 shadow-lg`}
              >
                {member.initials}
              </div>
              <h3 className="font-bold text-slate-900 text-lg">{member.name}</h3>
              <p className="text-[#2563eb] text-sm font-semibold mb-3">{member.role}</p>
              <p className="text-slate-500 text-sm leading-relaxed">{member.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Contact Strip ─── */}
      <section className="container max-w-5xl mx-auto px-4 mb-20">
        <div className="bg-gradient-to-br from-[#0052ff] to-[#2563eb] rounded-3xl p-8 md:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold mb-2">Get in Touch</h2>
            <p className="text-blue-100 text-sm">Have questions? We'd love to hear from you.</p>
            <div className="mt-5 space-y-2">
              <p className="flex items-center gap-2 text-sm text-blue-100">
                <MapPin size={16} /> Dhaka, Bangladesh
              </p>
              <p className="flex items-center gap-2 text-sm text-blue-100">
                <Phone size={16} /> +8801789-785509
              </p>
              <p className="flex items-center gap-2 text-sm text-blue-100">
                <Mail size={16} /> support@banglabazar.com.bd
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 shrink-0">
            <Link
              href="/dashboard/customer/help-center"
              className="inline-flex items-center gap-2 bg-white text-[#2563eb] font-semibold px-7 py-3 rounded-full hover:bg-blue-50 transition-all shadow-lg"
            >
              Help Center
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-white/10 border border-white/30 text-white font-semibold px-7 py-3 rounded-full hover:bg-white/20 transition-all"
            >
              <ShoppingBag size={16} />
              Shop Now
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Trust Badges ─── */}
      <section className="container max-w-5xl mx-auto px-4 pb-20">
        <div className="flex flex-wrap justify-center gap-4 md:gap-6">
          {[
            { icon: TrendingUp, label: "Top Marketplace 2024", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
            { icon: Shield, label: "100% Secure Payments", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
            { icon: Star, label: "4.8★ Customer Rating", color: "text-orange-500", bg: "bg-orange-50", border: "border-orange-100" },
            { icon: Award, label: "Verified Sellers Only", color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-100" },
            { icon: Globe, label: "64 Districts Covered", color: "text-teal-600", bg: "bg-teal-50", border: "border-teal-100" },
          ].map((b) => (
            <div
              key={b.label}
              className={`flex items-center gap-2 ${b.bg} border ${b.border} rounded-full px-5 py-2.5 text-sm font-semibold ${b.color}`}
            >
              <b.icon size={16} />
              {b.label}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
