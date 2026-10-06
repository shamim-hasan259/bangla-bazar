"use client";
import React, { useState } from "react";
import Link from "next/link";
import {
  FileText,
  ShieldCheck,
  RotateCcw,
  Truck,
  CreditCard,
  UserCheck,
  Scale,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  ChevronRight,
  Building2,
  Mail,
  Phone,
  CheckCircle2,
} from "lucide-react";

export default function TermsAndConditionsPage() {
  const [activeSection, setActiveSection] = useState<string>("intro");

  const sections = [
    { id: "intro", title: "1. Introduction & Acceptance", icon: FileText },
    { id: "account", title: "2. User Accounts & Security", icon: UserCheck },
    { id: "marketplace", title: "3. Multi-Vendor Marketplace", icon: Building2 },
    { id: "orders", title: "4. Pricing, Orders & Payments", icon: CreditCard },
    { id: "shipping", title: "5. Shipping & Delivery", icon: Truck },
    { id: "returns", title: "6. Returns, Refunds & Cancellations", icon: RotateCcw },
    { id: "conduct", title: "7. User Conduct & Prohibited Acts", icon: AlertCircle },
    { id: "ip", title: "8. Intellectual Property", icon: ShieldCheck },
    { id: "liability", title: "9. Limitation of Liability", icon: Scale },
    { id: "law", title: "10. Governing Law & Dispute Resolution", icon: Scale },
    { id: "contact", title: "11. Contact & Grievances", icon: HelpCircle },
  ];

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="bg-[#f8fafc] dark:bg-slate-950 min-h-screen">
      {/* ─── Hero Section ─── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0052ff] via-[#2563eb] to-[#1e40af] text-white">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-white/[0.02] blur-2xl" />
        </div>

        <div className="container max-w-5xl mx-auto px-4 py-16 md:py-24 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white text-xs md:text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <ShieldCheck size={16} className="text-yellow-300" />
            Legal & Compliance
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 leading-tight">
            Terms & Conditions
          </h1>
          <p className="text-blue-100 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            Please read these terms carefully before using the Bangla Bazar marketplace platform.
            These terms govern your access and use of our services.
          </p>
          <div className="mt-6 text-xs text-blue-200">
            Last Updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </div>
        </div>
      </section>

      {/* ─── Quick Feature Highlights ─── */}
      <section className="container max-w-6xl mx-auto px-4 -mt-8 relative z-20 mb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              icon: ShieldCheck,
              title: "Buyer Protection",
              desc: "100% verified orders & payment protection",
              color: "text-blue-600 dark:text-blue-400",
              bg: "bg-blue-50 dark:bg-blue-950/40",
            },
            {
              icon: RotateCcw,
              title: "7-Day Return Policy",
              desc: "Hassle-free replacement or refund guarantee",
              color: "text-emerald-600 dark:text-emerald-400",
              bg: "bg-emerald-50 dark:bg-emerald-950/40",
            },
            {
              icon: Truck,
              title: "Nationwide Shipping",
              desc: "Standard 64-district delivery framework",
              color: "text-orange-600 dark:text-orange-400",
              bg: "bg-orange-50 dark:bg-orange-950/40",
            },
            {
              icon: CreditCard,
              title: "Secure Payments",
              desc: "SSLCommerz, bKash & Cash on Delivery",
              color: "text-violet-600 dark:text-violet-400",
              bg: "bg-violet-50 dark:bg-violet-950/40",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.06)] border border-slate-100 dark:border-slate-800 flex items-center gap-4 hover:shadow-[0_8px_30px_rgba(0,0,0,0.1)] transition-all duration-200"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${item.bg} ${item.color}`}>
                <item.icon size={22} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{item.title}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Main Content Layout ─── */}
      <section className="container max-w-6xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Navigation Sidebar (Sticky) */}
          <aside className="lg:col-span-4 lg:sticky lg:top-24 bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-[0_4px_24px_rgba(0,0,0,0.05)]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4 px-2">
              Table of Contents
            </h3>
            <nav className="space-y-1">
              {sections.map((sec) => {
                const Icon = sec.icon;
                const isActive = activeSection === sec.id;
                return (
                  <button
                    key={sec.id}
                    onClick={() => scrollToSection(sec.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left text-xs font-semibold transition-all duration-200 ${isActive
                      ? "bg-[#2563eb] text-white shadow-sm font-bold"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
                      }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon size={15} className={isActive ? "text-white" : "text-slate-400"} />
                      <span className="truncate">{sec.title}</span>
                    </div>
                    <ChevronRight size={14} className={isActive ? "text-white opacity-80" : "text-slate-400 opacity-40"} />
                  </button>
                );
              })}
            </nav>

            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Have questions about our terms?</p>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/50 text-[#2563eb] dark:text-blue-400 text-xs font-bold transition-all border border-slate-200/80 dark:border-slate-700"
              >
                <HelpCircle size={14} /> Contact Support
              </Link>
            </div>
          </aside>

          {/* Right Content Area */}
          <main className="lg:col-span-8 space-y-8">
            {/* Section 1 */}
            <article id="intro" className="bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 border border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.04)] scroll-mt-28">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-[#2563eb] flex items-center justify-center">
                  <FileText size={20} />
                </div>
                <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                  1. Introduction & Acceptance of Terms
                </h2>
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-300 space-y-4 leading-relaxed">
                <p>
                  Welcome to <strong>Bangla Bazar</strong> ("Company", "we", "our", or "us"). By visiting, browsing, registering for an account, purchasing items, or operating a seller storefront on the Bangla Bazar platform (including our website, mobile site, and associated services), you acknowledge and agree to be bound by these Terms and Conditions ("Terms"), along with our Privacy Policy and Delivery Guidelines.
                </p>
                <p>
                  If you do not agree to these Terms, you must immediately cease accessing or using the platform. We reserve the right to revise and update these Terms at any time without prior individual notice. Your continued use of the platform following the posting of revised Terms means that you accept and agree to the changes.
                </p>
                <div className="bg-blue-50/70 dark:bg-blue-950/30 border-l-4 border-[#2563eb] p-4 rounded-r-xl">
                  <p className="text-xs md:text-sm text-blue-900 dark:text-blue-200 font-medium">
                    Important: Bangla Bazar operates in full compliance with the Digital Commerce Operation Guidelines (ডিজিটাল কমার্স পরিচালনা নির্দেশিকা) and the Consumer Rights Protection Act of Bangladesh.
                  </p>
                </div>
              </div>
            </article>

            {/* Section 2 */}
            <article id="account" className="bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 border border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.04)] scroll-mt-28">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center">
                  <UserCheck size={20} />
                </div>
                <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                  2. User Accounts, Registration & Security
                </h2>
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-300 space-y-4 leading-relaxed">
                <p>
                  To place orders or open a vendor store on Bangla Bazar, you may be required to create an account. You represent and warrant that:
                </p>
                <ul className="space-y-2.5 pl-2">
                  {[
                    "All information submitted during registration is true, accurate, current, and complete.",
                    "You will maintain the accuracy of such information and promptly update it when necessary.",
                    "You are at least 18 years of age or possess legal parental or guardian consent to use this platform.",
                    "You are solely responsible for maintaining the confidentiality of your account credentials (passwords, OTP codes, session tokens) and for all activities that occur under your account.",
                  ].map((text, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span>{text}</span>
                    </li>
                  ))}
                </ul>
                <p>
                  You agree to notify Bangla Bazar immediately at <a href="mailto:support@banglabazar.com.bd" className="text-[#2563eb] hover:underline font-semibold">support@banglabazar.com.bd</a> if you discover or suspect any unauthorized use or security breach of your account.
                </p>
              </div>
            </article>

            {/* Section 3 */}
            <article id="marketplace" className="bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 border border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.04)] scroll-mt-28">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/50 text-violet-600 flex items-center justify-center">
                  <Building2 size={20} />
                </div>
                <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                  3. Multi-Vendor Marketplace Ecosystem
                </h2>
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-300 space-y-4 leading-relaxed">
                <p>
                  Bangla Bazar is an online multivendor marketplace that enables independent third-party sellers ("Vendors" or "Sellers") to list and sell their merchandise directly to buyers.
                </p>
                <p>
                  Unless explicitly stated otherwise for select items branded directly by Bangla Bazar, the actual contract for sale is directly between the buyer and the individual seller. While Bangla Bazar facilitates transactions, payment escrow, logistics coordination, and customer dispute resolution, each seller is solely responsible for:
                </p>
                <div className="grid sm:grid-cols-2 gap-3 pt-1">
                  {[
                    "Accurate item descriptions, specifications, photos, and stock counts",
                    "Authenticity and condition of listed products",
                    "Compliance with local warranty policies and consumer laws",
                    "Packaging goods securely according to standards",
                  ].map((pt, i) => (
                    <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">✓ {pt}</span>
                    </div>
                  ))}
                </div>
              </div>
            </article>

            {/* Section 4 */}
            <article id="orders" className="bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 border border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.04)] scroll-mt-28">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center">
                  <CreditCard size={20} />
                </div>
                <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                  4. Pricing, Orders & Payment Processing
                </h2>
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-300 space-y-4 leading-relaxed">
                <p>
                  All prices listed on Bangla Bazar are in Bangladeshi Taka (BDT / ৳) and inclusive of applicable taxes (VAT) unless stated otherwise.
                </p>
                <ul className="space-y-2.5 pl-2">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>Order Confirmation:</strong> An electronic order confirmation does not signify our final acceptance of your order. We reserve the right to limit quantities, decline, or cancel orders due to pricing errors, stock unavailability, or fraud detection.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>Payment Methods:</strong> We support secure online payment gateways (SSLCommerz, bKash, Nagad, Visa, Mastercard, Maestro) as well as Cash on Delivery (COD) for eligible locations.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>Pricing Errors:</strong> In the rare event that a product is mistakenly listed at an incorrect price, the seller and Bangla Bazar reserve the right to cancel the order and refund any paid amounts in full.</span>
                  </li>
                </ul>
              </div>
            </article>

            {/* Section 5 */}
            <article id="shipping" className="bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 border border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.04)] scroll-mt-28">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-950/50 text-orange-600 flex items-center justify-center">
                  <Truck size={20} />
                </div>
                <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                  5. Shipping, Delivery & Tracking
                </h2>
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-300 space-y-4 leading-relaxed">
                <p>
                  We coordinate with trusted nationwide courier partners (Pathao, RedX, Paperfly, Steadfast, Sundarban) to deliver orders across all 64 districts of Bangladesh.
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-1 text-xs uppercase tracking-wider text-[#2563eb]">Inside Dhaka</h4>
                    <p className="text-slate-600 dark:text-slate-400 text-xs">Standard delivery timeframe is 1 to 2 business days from seller dispatch.</p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-1 text-xs uppercase tracking-wider text-[#2563eb]">Outside Dhaka</h4>
                    <p className="text-slate-600 dark:text-slate-400 text-xs">Standard delivery timeframe is 3 to 5 business days nationwide.</p>
                  </div>
                </div>
                <p>
                  For full shipping policies and real-time statistics, visit our dedicated <Link href="/delivery-information" className="text-[#2563eb] hover:underline font-bold">Delivery Information Page</Link>.
                </p>
              </div>
            </article>

            {/* Section 6 */}
            <article id="returns" className="bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 border border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.04)] scroll-mt-28">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 flex items-center justify-center">
                  <RotateCcw size={20} />
                </div>
                <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                  6. Returns, Refunds & Replacement Policy
                </h2>
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-300 space-y-4 leading-relaxed">
                <p>
                  Customers may request a return or replacement within <strong>7 calendar days</strong> of receiving their parcel if:
                </p>
                <ul className="space-y-2.5 pl-2">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                    <span>The item received is damaged, defective, or non-functional.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                    <span>The item is materially different from the product catalog description or wrong size/color.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                    <span>The package has missing parts, accessories, or tags.</span>
                  </li>
                </ul>
                <p>
                  Returned items must remain in original unused condition with manufacturer packaging, warranty cards, and user manuals intact. Refunds for validated returns are processed back to the original payment channel or customer wallet within 5–10 business days.
                </p>
              </div>
            </article>

            {/* Section 7 */}
            <article id="conduct" className="bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 border border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.04)] scroll-mt-28">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 flex items-center justify-center">
                  <AlertCircle size={20} />
                </div>
                <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                  7. Prohibited Conduct & Account Termination
                </h2>
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-300 space-y-3 leading-relaxed">
                <p>Users and sellers agree NOT to engage in any of the following activities:</p>
                <ul className="list-disc pl-6 space-y-1.5 text-slate-600 dark:text-slate-400">
                  <li>Listing counterfeit, stolen, illegal, hazardous, or restricted items under Bangladeshi law.</li>
                  <li>Using automated scrapers, bots, or unauthorized APIs to disrupt marketplace performance.</li>
                  <li>Manipulating product reviews, submitting fake orders, or participating in fraudulent activities.</li>
                  <li>Harassing, threatening, or abusing other platform users, sellers, or customer care representatives.</li>
                </ul>
                <p>
                  Violation of these guidelines will result in immediate suspension, storefront closure, and potential legal action.
                </p>
              </div>
            </article>

            {/* Section 8, 9 & 10 */}
            <article id="ip" className="bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 border border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.04)] scroll-mt-28">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-[#2563eb] flex items-center justify-center">
                  <ShieldCheck size={20} />
                </div>
                <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                  8. Intellectual Property Rights
                </h2>
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-300 space-y-3 leading-relaxed">
                <p>
                  All logos, trademarks, website layout, UX designs, graphics, software code, and promotional content belong exclusively to Bangla Bazar or its licensors. You may not reproduce, modify, distribute, or create derivative works without prior written consent.
                </p>
              </div>
            </article>

            <article id="liability" className="bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 border border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.04)] scroll-mt-28">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center">
                  <Scale size={20} />
                </div>
                <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                  9. Limitation of Liability
                </h2>
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-300 space-y-3 leading-relaxed">
                <p>
                  To the maximum extent permitted by applicable law, Bangla Bazar, its directors, officers, employees, and affiliates shall not be liable for any indirect, incidental, punitive, or consequential damages arising from the use or inability to use the marketplace services.
                </p>
              </div>
            </article>

            <article id="law" className="bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 border border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.04)] scroll-mt-28">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/50 text-sky-600 flex items-center justify-center">
                  <Scale size={20} />
                </div>
                <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                  10. Governing Law & Jurisdiction
                </h2>
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-300 space-y-3 leading-relaxed">
                <p>
                  These Terms shall be governed by and construed in accordance with the laws of the People's Republic of Bangladesh. Any disputes arising in connection with these Terms shall be subject to the exclusive jurisdiction of the courts of Dhaka, Bangladesh.
                </p>
              </div>
            </article>

            {/* Section 11: Contact */}
            <article id="contact" className="bg-gradient-to-br from-[#0052ff] to-[#2563eb] rounded-3xl p-8 md:p-10 text-white shadow-lg scroll-mt-28">
              <h3 className="text-2xl font-bold mb-3">11. Grievances & Contact Support</h3>
              <p className="text-blue-100 text-sm mb-6 leading-relaxed">
                If you have any questions, legal queries, or complaints regarding these Terms & Conditions, our dedicated compliance team is here to assist you.
              </p>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
                  <p className="text-blue-200 text-xs font-medium mb-1">Email Legal Department</p>
                  <p className="font-semibold text-white">support@banglabazar.com.bd</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
                  <p className="text-blue-200 text-xs font-medium mb-1">Customer Helpline</p>
                  <p className="font-semibold text-white">+8801789-785509 / 16269</p>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-4 items-center">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 bg-white text-[#2563eb] font-bold px-6 py-2.5 rounded-full hover:bg-blue-50 transition-all text-xs"
                >
                  Go to Contact Page
                  <ArrowRight size={14} />
                </Link>
                <Link
                  href="/privacy-policy"
                  className="inline-flex items-center gap-2 bg-white/10 border border-white/30 text-white font-semibold px-6 py-2.5 rounded-full hover:bg-white/20 transition-all text-xs"
                >
                  View Privacy Policy
                </Link>
              </div>
            </article>

          </main>
        </div>
      </section>
    </div>
  );
}
