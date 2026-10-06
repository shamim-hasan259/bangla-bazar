"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Package,
  Truck,
  RotateCcw,
  CreditCard,
  UserCheck,
  Store,
  HelpCircle,
  PhoneCall,
  Mail,
  MessageCircle,
  Clock,
  ChevronDown,
  ShieldCheck,
  ExternalLink,
  MapPin,
  FileQuestion,
  Headphones,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    id: "faq-1",
    category: "orders",
    question: "How do I track my order status on Bangla Bazar?",
    answer:
      "You can track your active order by navigating to your Customer Dashboard > Orders. There you will see real-time updates including Pending, Processing, Shipped, and Delivered statuses along with the courier tracking ID.",
  },
  {
    id: "faq-2",
    category: "orders",
    question: "Can I cancel or modify an order after placing it?",
    answer:
      "Yes, you can cancel an order directly from your Customer Dashboard as long as its status is still 'Pending' or 'Processing'. Once an order has been dispatched/shipped by the seller, it cannot be cancelled directly and must be processed via our return policy.",
  },
  {
    id: "faq-3",
    category: "shipping",
    question: "What are the delivery charges and estimated delivery timelines?",
    answer:
      "Inside Dhaka delivery typically takes 24 to 48 hours with a standard delivery fee of ৳60–৳80. Outside Dhaka delivery takes 2 to 4 business days with fees ranging from ৳120–৳150 depending on parcel weight and destination.",
  },
  {
    id: "faq-4",
    category: "shipping",
    question: "Do you offer Express / Same-day delivery?",
    answer:
      "Yes! For selected items located in Dhaka metropolitan warehouses, we offer Same-Day Express Delivery if the order is placed before 12:00 PM. Look for the 'Express Delivery' badge on eligible product pages.",
  },
  {
    id: "faq-5",
    category: "returns",
    question: "What is Bangla Bazar's Return & Refund policy?",
    answer:
      "We offer a 7-day hassle-free return window starting from the delivery date. If an item is damaged, defective, wrong size, or significantly not as described, you can initiate a return request from your dashboard for a full refund or replacement.",
  },
  {
    id: "faq-6",
    category: "returns",
    question: "How long does it take to receive a refund?",
    answer:
      "Once the returned item is inspected and accepted by the merchant/warehouse, refunds are credited back to your original payment method (bKash, Nagad, or Bank Card) within 3 to 7 business working days.",
  },
  {
    id: "faq-7",
    category: "payments",
    question: "What payment methods are supported on Bangla Bazar?",
    answer:
      "We accept Cash on Delivery (COD), Mobile Financial Services (bKash, Nagad, Rocket, Upay), and all major Visa, Mastercard, and UnionPay debit/credit cards through secure encrypted SSLCommerz gateways.",
  },
  {
    id: "faq-8",
    category: "payments",
    question: "Is it safe to use my credit/debit card on Bangla Bazar?",
    answer:
      "Absolutely. All online payments are processed through 256-bit SSL encrypted bank-grade payment gateways compliant with PCI-DSS standards. Bangla Bazar never stores your card CVV or PIN numbers.",
  },
  {
    id: "faq-9",
    category: "account",
    question: "How do I update my profile, password, or billing address?",
    answer:
      "Log in to your account and click on Dashboard > Settings. From there you can update your personal profile, change your login password, and modify your saved delivery & billing addresses.",
  },
  {
    id: "faq-10",
    category: "account",
    question: "How do I write a review and rate a purchased product?",
    answer:
      "Only verified customers who have logged in can submit ratings and reviews. Visit the product page, scroll to the Reviews tab, select your 1-5 star rating and enter your honest feedback. You can also manage all your reviews under Dashboard > My Reviews.",
  },
  {
    id: "faq-11",
    category: "seller",
    question: "How can I start selling products on Bangla Bazar?",
    answer:
      "You can register as a merchant by visiting the Seller Registration page. Fill in your store details, Trade License/NID info, and bank details. Our merchant onboarding team will verify and activate your shop within 24 hours.",
  },
  {
    id: "faq-12",
    category: "seller",
    question: "What commission does Bangla Bazar charge from sellers?",
    answer:
      "Commission rates vary from 2% to 8% depending on the product category (Fashion, Electronics, Groceries, Lifestyle). All seller payouts are disbursed weekly directly to your verified bank account.",
  },
];

const CATEGORIES = [
  { id: "all", label: "All Topics", icon: FileQuestion },
  { id: "orders", label: "Orders & Tracking", icon: Package },
  { id: "shipping", label: "Shipping & Delivery", icon: Truck },
  { id: "returns", label: "Returns & Refunds", icon: RotateCcw },
  { id: "payments", label: "Payments & Pricing", icon: CreditCard },
  { id: "account", label: "Account & Profile", icon: UserCheck },
  { id: "seller", label: "Seller Inquiries", icon: Store },
];

export default function HelpCenterClient() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [openFaqId, setOpenFaqId] = useState<string | null>("faq-1");

  const toggleFaq = (id: string) => {
    setOpenFaqId((prev) => (prev === id ? null : id));
  };

  const filteredFaqs = useMemo(() => {
    return FAQ_DATA.filter((item) => {
      const matchesCategory =
        selectedCategory === "all" || item.category === selectedCategory;
      const matchesQuery =
        searchQuery.trim() === "" ||
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="container mx-auto px-4 max-w-6xl space-y-12">
      {/* Hero Banner Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1E60ED] via-[#1550c7] to-[#0d3ea6] text-white p-8 md:p-14 shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-60 h-60 bg-blue-300/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-blue-100 border border-white/20">
            <Headphones className="w-3.5 h-3.5" /> 24/7 Dedicated Customer Care
          </div>

          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
            How can we help you today?
          </h1>

          <p className="text-sm md:text-base text-blue-100/90 leading-relaxed max-w-2xl mx-auto">
            Search our knowledge base, explore frequent questions, or contact our customer support team directly for fast assistance.
          </p>

          {/* Search Box */}
          <div className="relative max-w-2xl mx-auto pt-2">
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search topics (e.g., track order, return, bKash, refund, seller)..."
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white text-slate-900 placeholder:text-slate-400 font-medium text-sm md:text-base shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-400/30 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 text-xs font-bold text-slate-400 hover:text-slate-700 bg-slate-100 rounded-lg px-2 py-1"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/dashboard/customer/orders"
          className="group bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-md hover:border-[#1E60ED] transition-all flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-[#1E60ED] flex items-center justify-center group-hover:scale-110 transition-transform">
              <Package className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-[#1E60ED] transition-colors">
              Track My Order
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
              Check real-time package delivery progress and live courier status.
            </p>
          </div>
          <div className="mt-4 flex items-center text-xs font-bold text-[#1E60ED] gap-1">
            View Orders <ExternalLink className="w-3 h-3" />
          </div>
        </Link>

        <Link
          href="/dashboard/customer/reviews"
          className="group bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-md hover:border-[#1E60ED] transition-all flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <RotateCcw className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-[#1E60ED] transition-colors">
              Returns & Reviews
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
              Manage your submitted ratings, product feedback, and return requests.
            </p>
          </div>
          <div className="mt-4 flex items-center text-xs font-bold text-[#1E60ED] gap-1">
            My Reviews <ExternalLink className="w-3 h-3" />
          </div>
        </Link>

        <Link
          href="/dashboard/customer/setting"
          className="group bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-md hover:border-[#1E60ED] transition-all flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <UserCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-[#1E60ED] transition-colors">
              Account Settings
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
              Update your delivery address, phone number, and security passwords.
            </p>
          </div>
          <div className="mt-4 flex items-center text-xs font-bold text-[#1E60ED] gap-1">
            Manage Profile <ExternalLink className="w-3 h-3" />
          </div>
        </Link>

        <a
          href="#contact-support"
          className="group bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-md hover:border-[#1E60ED] transition-all flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <PhoneCall className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-[#1E60ED] transition-colors">
              Direct Support
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
              Call our support helpline or chat with a live representative.
            </p>
          </div>
          <div className="mt-4 flex items-center text-xs font-bold text-[#1E60ED] gap-1">
            Contact Us <ChevronDown className="w-3 h-3" />
          </div>
        </a>
      </div>

      {/* Category Tabs */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">
              Browse by Topics
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Select a category to view specific questions and guides
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 border ${
                  isActive
                    ? "bg-[#1E60ED] text-white border-[#1E60ED] shadow-sm shadow-blue-500/20"
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* FAQ Accordion Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-[#1E60ED]" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Frequently Asked Questions
            </h3>
          </div>
          <span className="text-xs font-semibold text-slate-400">
            {filteredFaqs.length} {filteredFaqs.length === 1 ? "answer" : "answers"}
          </span>
        </div>

        {filteredFaqs.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
              <Search className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-white">
              No matching help articles found
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try searching with different keywords or reach out to our customer care team below.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
              className="rounded-xl text-xs font-bold"
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="space-y-3 divide-y divide-slate-100 dark:divide-slate-800/60">
            {filteredFaqs.map((faq) => {
              const isOpen = openFaqId === faq.id;
              return (
                <div key={faq.id} className="pt-3 first:pt-0">
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full flex items-center justify-between text-left py-2 group focus:outline-none"
                  >
                    <span
                      className={`text-sm font-bold transition-colors ${
                        isOpen
                          ? "text-[#1E60ED]"
                          : "text-slate-800 dark:text-slate-200 group-hover:text-[#1E60ED]"
                      }`}
                    >
                      {faq.question}
                    </span>
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center transition-transform shrink-0 ml-4 ${
                        isOpen
                          ? "bg-blue-50 dark:bg-blue-950/40 text-[#1E60ED] rotate-180"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="mt-2 text-xs md:text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50/70 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Trust & Guarantee Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
              100% Genuine Products
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified authorized sellers and authentic brand warranties.
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-[#1E60ED] flex items-center justify-center shrink-0">
            <RotateCcw className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
              7 Days Easy Return
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Hassle-free replacement or quick refund guarantee.
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Fast Nationwide Dispatch
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Doorstep delivery across all 64 districts in Bangladesh.
            </p>
          </div>
        </div>
      </div>

      {/* Contact & Support Channels */}
      <div
        id="contact-support"
        className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 md:p-10 shadow-sm space-y-6"
      >
        <div className="text-center max-w-xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1E60ED] bg-blue-50 dark:bg-blue-950/40 px-3 py-1 rounded-full">
            <MessageCircle className="w-3.5 h-3.5" /> Still Need Assistance?
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white">
            Connect With Our Support Team
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            We are here to help you 7 days a week from 9:00 AM to 10:00 PM BST.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          {/* Phone Helpline */}
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 text-center space-y-3 border border-slate-100 dark:border-slate-800 hover:border-[#1E60ED] transition-all">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/40 text-[#1E60ED] flex items-center justify-center mx-auto">
              <PhoneCall className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-white">Helpline Hotline</h4>
            <p className="text-xs text-slate-500">Instant phone support</p>
            <div className="pt-1">
              <a
                href="tel:+8801789785509"
                className="text-sm font-black text-[#1E60ED] hover:underline block"
              >
                +880 1789-785509
              </a>
              <span className="text-[10px] text-slate-400 mt-0.5 block">Everyday: 9:00 AM - 10:00 PM</span>
            </div>
          </div>

          {/* Email Support */}
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 text-center space-y-3 border border-slate-100 dark:border-slate-800 hover:border-[#1E60ED] transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 flex items-center justify-center mx-auto">
              <Mail className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-white">Email Desk</h4>
            <p className="text-xs text-slate-500">Official inquiries & disputes</p>
            <div className="pt-1">
              <a
                href="mailto:support@banglabazar.com"
                className="text-sm font-black text-[#1E60ED] hover:underline block"
              >
                support@banglabazar.com
              </a>
              <span className="text-[10px] text-slate-400 mt-0.5 block">Response within 24 business hours</span>
            </div>
          </div>

          {/* Head Office Address */}
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 text-center space-y-3 border border-slate-100 dark:border-slate-800 hover:border-[#1E60ED] transition-all">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 flex items-center justify-center mx-auto">
              <MapPin className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-white">Head Office</h4>
            <p className="text-xs text-slate-500">Dhaka Operations Center</p>
            <div className="pt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              House 12, Road 4, Sector 7<br />
              Uttara, Dhaka-1230, Bangladesh
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
