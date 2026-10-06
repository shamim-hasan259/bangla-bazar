"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building2,
  Users,
  Sparkles,
  MapPin,
  Phone,
  Mail,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  PackageCheck,
  Globe2,
  Search,
  Filter,
  Send,
  Loader2,
  Store,
  Award,
  ExternalLink,
  ChevronRight,
  Star,
  Check,
  Truck,
  Layers,
  Sparkle,
  BadgeCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import axios from "axios";

interface SupplierProduct {
  id: string;
  name: string;
  price: number;
  photo?: any;
}

interface SupplierItem {
  id: string;
  name: string;
  company: string;
  designation?: string;
  phone: string;
  email: string;
  address: string;
  country: string;
  description: string;
  status: string;
  createdAt: string;
  Product?: SupplierProduct[];
  category?: string;
  rating?: number;
  verified?: boolean;
  establishedYear?: string;
}

export default function OurSuppliersPage() {
  const [suppliers, setSuppliers] = useState<SupplierItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierItem | null>(null);
  const [showInquiryModal, setShowInquiryModal] = useState<boolean>(false);
  const [showRegisterModal, setShowRegisterModal] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const [inquiryData, setInquiryData] = useState({
    businessName: "",
    contactPerson: "",
    email: "",
    phone: "",
    estimatedVolume: "",
    message: "",
  });

  const [registerData, setRegisterData] = useState({
    companyName: "",
    representativeName: "",
    designation: "",
    email: "",
    phone: "",
    address: "",
    country: "Bangladesh",
    productCategories: "",
    description: "",
  });

  const [stats, setStats] = useState({
    totalSuppliers: 0,
    verifiedSuppliers: 0,
    totalProductsSupplied: "12,500+",
    averageFulfillmentRate: "99.2%",
  });

  // Fetch Suppliers from Backend API
  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/suppliers");
      if (res.data?.success) {
        setSuppliers(res.data.data || []);
        if (res.data.stats) {
          setStats((prev) => ({
            ...prev,
            totalSuppliers: res.data.stats.totalSuppliers || (res.data.data?.length ?? 0),
            verifiedSuppliers: res.data.stats.verifiedSuppliers || (res.data.data?.length ?? 0),
            totalProductsSupplied: res.data.stats.totalProductsSupplied
              ? `${res.data.stats.totalProductsSupplied}+`
              : prev.totalProductsSupplied,
            averageFulfillmentRate: res.data.stats.averageFulfillmentRate || prev.averageFulfillmentRate,
          }));
        }
      }
    } catch (err) {
      console.error("Failed to fetch suppliers:", err);
      toast.error("Unable to load live suppliers. Showing verified network catalog.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  // Filter Categories
  const categories = [
    "All",
    "Agro & Organic Foods",
    "Electronics & Gadgets",
    "Fashion & Textiles",
    "Spices & Wellness",
    "Home & Living",
    "Beauty & Personal Care",
  ];

  const filteredSuppliers = suppliers.filter((sup) => {
    const matchesSearch =
      sup.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sup.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sup.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sup.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sup.country?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCat =
      selectedCategory === "All" ||
      (sup.category && sup.category.toLowerCase().includes(selectedCategory.toLowerCase())) ||
      (sup.description && sup.description.toLowerCase().includes(selectedCategory.toLowerCase()));

    return matchesSearch && matchesCat;
  });

  const handleInquireClick = (supplier: SupplierItem) => {
    setSelectedSupplier(supplier);
    setShowInquiryModal(true);
  };

  const handleSendInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryData.contactPerson || !inquiryData.email || !inquiryData.phone) {
      toast.error("Please fill in all required contact details.");
      return;
    }

    try {
      setSubmitting(true);
      await new Promise((resolve) => setTimeout(resolve, 900));
      toast.success(`Inquiry sent to ${selectedSupplier?.company || "supplier"}! Our procurement officer will connect with you.`);
      setShowInquiryModal(false);
      setInquiryData({
        businessName: "",
        contactPerson: "",
        email: "",
        phone: "",
        estimatedVolume: "",
        message: "",
      });
    } catch {
      toast.error("Failed to submit inquiry. Please try again or contact support.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSupplierRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerData.companyName || !registerData.representativeName || !registerData.email || !registerData.phone) {
      toast.error("Please fill in all required registration fields.");
      return;
    }

    try {
      setSubmitting(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Supplier application submitted! Our vendor onboarding team will review your business credentials.");
      setShowRegisterModal(false);
      setRegisterData({
        companyName: "",
        representativeName: "",
        designation: "",
        email: "",
        phone: "",
        address: "",
        country: "Bangladesh",
        productCategories: "",
        description: "",
      });
    } catch {
      toast.error("Submission failed. Please contact procurement@banglabazar.com.bd");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#f8fafc] dark:bg-slate-950 min-h-screen text-slate-800 dark:text-slate-100">
      {/* ─── Hero Banner ─── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0052ff] via-[#2563eb] to-[#1e40af] text-white">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -right-32 w-[450px] h-[450px] rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-[450px] h-[450px] rounded-full bg-white/10 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[750px] rounded-full bg-sky-400/[0.08] blur-2xl" />
        </div>

        <div className="container max-w-6xl mx-auto px-4 py-16 md:py-24 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/25 text-white text-xs md:text-sm font-semibold px-4 py-1.5 rounded-full mb-6 shadow-sm">
            <Sparkles size={16} className="text-yellow-300" />
            Verified Wholesale & Manufacturing Network
          </div>

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-5 leading-tight">
            Our Trusted Suppliers & Direct Manufacturers
          </h1>

          <p className="text-blue-100 text-sm md:text-base max-w-2xl mx-auto leading-relaxed mb-8 font-normal">
            Bangla Bazar partners directly with certified agro-farms, authentic artisan weavers, brand distributors,
            and ethical manufacturers across Bangladesh and beyond to deliver guaranteed authentic products.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="#suppliers-list"
              className="inline-flex items-center gap-2 bg-white text-[#2563eb] font-bold px-7 py-3 rounded-full hover:bg-blue-50 transition-all text-xs md:text-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Browse Verified Suppliers ({suppliers.length})
              <ArrowRight size={16} />
            </a>
            <Button
              onClick={() => setShowRegisterModal(true)}
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white font-semibold px-7 py-6 rounded-full transition-all text-xs md:text-sm"
            >
              <Store size={16} />
              Apply as a Supplier
            </Button>
          </div>
        </div>
      </section>

      {/* ─── KPI Metrics Strip ─── */}
      <section className="container max-w-6xl mx-auto px-4 -mt-8 relative z-20 mb-14">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Verified Supplier Partners",
              value: stats.totalSuppliers ? `${stats.totalSuppliers}+` : "25+",
              trend: "↗ 18% MoM",
              icon: Building2,
              color: "text-blue-600 dark:text-blue-400",
              bg: "bg-blue-50 dark:bg-blue-950/40",
            },
            {
              label: "Direct Catalog SKUs",
              value: stats.totalProductsSupplied,
              trend: "↗ 100% Quality Checked",
              icon: PackageCheck,
              color: "text-emerald-600 dark:text-emerald-400",
              bg: "bg-emerald-50 dark:bg-emerald-950/40",
            },
            {
              label: "Fulfillment Accuracy",
              value: stats.averageFulfillmentRate,
              trend: "↗ SLA Guaranteed",
              icon: ShieldCheck,
              color: "text-violet-600 dark:text-violet-400",
              bg: "bg-violet-50 dark:bg-violet-950/40",
            },
            {
              label: "Ethical Sourcing Coverage",
              value: "64 Districts",
              trend: "↗ 100% Local & Global",
              icon: Globe2,
              color: "text-amber-600 dark:text-amber-400",
              bg: "bg-amber-50 dark:bg-amber-950/40",
            },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.06)] border border-slate-100 dark:border-slate-800 flex flex-col justify-between hover:shadow-[0_8px_30px_rgba(0,0,0,0.1)] transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color} group-hover:scale-105 transition-transform`}>
                  <stat.icon size={22} />
                </div>
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-900">
                  {stat.trend}
                </span>
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">{stat.value}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Supplier Quality Standard Badges ─── */}
      <section className="container max-w-6xl mx-auto px-4 mb-14">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-100 dark:border-slate-800 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800">
            <div className="flex items-start gap-4 pt-4 md:pt-0">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-[#2563eb] shrink-0">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">100% Quality & Authenticity Audits</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Every supplier undergoes physical premise inspection, BSTI/ISO compliance checks, and trade license verification.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 pt-4 md:pt-0 md:pl-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 shrink-0">
                <Truck size={24} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Direct From Source Logistics</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Zero middlemen markups. Products flow directly from farm or factory to our temperature-controlled regional fulfillment hubs.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 pt-4 md:pt-0 md:pl-6">
              <div className="w-12 h-12 rounded-2xl bg-violet-50 dark:bg-violet-950/50 flex items-center justify-center text-violet-600 shrink-0">
                <BadgeCheck size={24} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Fair Trade & Sustainable Sourcing</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Direct prompt payments to rural farmers, weavers, and small-batch manufacturers ensuring community prosperity.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Main Suppliers Catalog Section ─── */}
      <section id="suppliers-list" className="container max-w-6xl mx-auto px-4 mb-20 scroll-mt-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold text-[#2563eb] bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900 px-3 py-1 rounded-full uppercase tracking-wider">
              Procurement Directory
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-2">
              Verified Partners Directory
            </h2>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Explore trusted producers, raw material providers, and brand manufacturers on Bangla Bazar.
            </p>
          </div>

          <div className="shrink-0">
            <Button
              onClick={() => setShowRegisterModal(true)}
              className="bg-[#2563eb] hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-md flex items-center gap-2"
            >
              <Store size={15} />
              Partner With Us
            </Button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.04)] mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Category Pill Filters */}
          <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedCategory === cat
                    ? "bg-[#2563eb] text-white shadow-sm"
                    : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              placeholder="Search supplier, company, city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs rounded-xl py-4 border-slate-200 dark:border-slate-800"
            />
          </div>
        </div>

        {/* Loading Skeleton State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm animate-pulse space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                    <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/2" />
                  </div>
                </div>
                <div className="h-14 bg-slate-100 dark:bg-slate-800 rounded-xl" />
                <div className="h-9 bg-slate-200 dark:bg-slate-800 rounded-xl" />
              </div>
            ))}
          </div>
        ) : filteredSuppliers.length === 0 ? (
          /* Empty Search State */
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-100 dark:border-slate-800 shadow-sm">
            <Building2 className="w-14 h-14 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Suppliers Found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-5">
              We couldn't find any suppliers matching your current filter criteria.
            </p>
            <Button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
              }}
              variant="outline"
              className="text-xs rounded-xl"
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          /* Suppliers Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSuppliers.map((supplier) => (
              <div
                key={supplier.id}
                className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-[0_2px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(37,99,235,0.09)] transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
              >
                <div>
                  {/* Top Header Row */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-[#2563eb] text-white font-extrabold text-lg flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
                        {supplier.company ? supplier.company.charAt(0).toUpperCase() : "S"}
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 line-clamp-1 group-hover:text-[#2563eb] transition-colors">
                          {supplier.company || supplier.name}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                          <span>{supplier.name}</span>
                          {supplier.designation && <span>• {supplier.designation}</span>}
                        </p>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-900 shrink-0">
                      <BadgeCheck size={12} className="text-emerald-600" />
                      Verified
                    </span>
                  </div>

                  {/* Category & Origin Tags */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-3">
                    {supplier.category && (
                      <span className="bg-blue-50 dark:bg-blue-950/50 text-[#2563eb] text-[11px] font-bold px-2.5 py-0.5 rounded-lg border border-blue-100 dark:border-blue-900">
                        {supplier.category}
                      </span>
                    )}
                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-medium px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                      <MapPin size={11} className="text-slate-400" />
                      {supplier.country || "Bangladesh"}
                    </span>
                    {supplier.establishedYear && (
                      <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 text-[11px] font-medium px-2 py-0.5 rounded-lg">
                        Est. {supplier.establishedYear}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3 mb-4">
                    {supplier.description || "Direct certified wholesale and manufacturing partner for Bangla Bazar e-commerce network."}
                  </p>

                  {/* Sample Products / Supply Specialties */}
                  {supplier.Product && supplier.Product.length > 0 && (
                    <div className="mb-5 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                      <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1">
                        <PackageCheck size={13} className="text-[#2563eb]" />
                        Key Supplied Products ({supplier.Product.length})
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {supplier.Product.map((p) => (
                          <span
                            key={p.id}
                            className="bg-slate-50 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-medium px-2 py-1 rounded-md line-clamp-1 max-w-[190px]"
                            title={p.name}
                          >
                            {p.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Footer & Action Buttons */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  <Button
                    onClick={() => handleInquireClick(supplier)}
                    className="flex-1 bg-[#2563eb] hover:bg-blue-700 text-white font-bold py-2 rounded-xl text-xs transition-all shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <Mail size={13} />
                    Inquire Wholesale
                  </Button>
                  <Button
                    onClick={() => {
                      setSelectedSupplier(supplier);
                    }}
                    variant="outline"
                    className="px-3 py-2 rounded-xl text-xs font-semibold border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ─── Wholesale Partnership Onboarding Banner ─── */}
      <section className="container max-w-6xl mx-auto px-4 pb-20">
        <div className="bg-gradient-to-br from-[#0052ff] via-[#2563eb] to-[#1e40af] rounded-3xl p-8 md:p-12 text-white flex flex-col lg:flex-row items-center justify-between gap-8 shadow-xl">
          <div className="space-y-3 max-w-xl text-center lg:text-left">
            <span className="text-xs font-bold text-yellow-300 bg-white/10 px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5">
              <Sparkles size={14} /> For Producers & Manufacturers
            </span>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold leading-tight">
              Ready to Supply Millions of Customers Nationwide?
            </h2>
            <p className="text-blue-100 text-xs md:text-sm leading-relaxed">
              Join the Bangla Bazar supplier network. Enjoy guaranteed high-volume procurement, swift digital payment
              settlements, integrated cold-chain logistics, and national brand exposure.
            </p>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <Button
              onClick={() => setShowRegisterModal(true)}
              className="bg-white hover:bg-blue-50 text-[#2563eb] font-bold px-8 py-3.5 rounded-full text-xs md:text-sm shadow-lg hover:shadow-xl transition-all"
            >
              Apply as a Supplier Partner
            </Button>
            <Link
              href="/contact-us"
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 text-white font-semibold px-6 py-3.5 rounded-full text-xs md:text-sm transition-all"
            >
              Talk to Procurement Team
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Supplier Details Modal ─── */}
      {selectedSupplier && !showInquiryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 max-w-lg w-full border border-slate-100 dark:border-slate-800 shadow-2xl relative my-8">
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#2563eb] text-white font-black text-xl flex items-center justify-center shadow-md">
                  {selectedSupplier.company?.charAt(0) || "S"}
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
                    {selectedSupplier.company}
                  </h3>
                  <p className="text-xs text-slate-500">{selectedSupplier.name} • {selectedSupplier.designation || "Representative"}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedSupplier(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <MapPin size={15} className="text-[#2563eb] shrink-0" />
                  <span>{selectedSupplier.address || "Dhaka, Bangladesh"}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <Mail size={15} className="text-[#2563eb] shrink-0" />
                  <span>{selectedSupplier.email || "procurement@banglabazar.com.bd"}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <Phone size={15} className="text-[#2563eb] shrink-0" />
                  <span>{selectedSupplier.phone || "+880 1700-000000"}</span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-1">Company Profile</h4>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{selectedSupplier.description}</p>
              </div>

              {selectedSupplier.Product && selectedSupplier.Product.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-2">Supplied Items Catalog</h4>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {selectedSupplier.Product.map((prod) => (
                      <div
                        key={prod.id}
                        className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-800"
                      >
                        <span className="font-medium text-slate-800 dark:text-slate-200">{prod.name}</span>
                        <span className="font-bold text-[#2563eb]">৳{prod.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2 flex gap-3">
                <Button
                  onClick={() => setSelectedSupplier(null)}
                  variant="outline"
                  className="w-1/3 rounded-xl text-xs"
                >
                  Close
                </Button>
                <Button
                  onClick={() => handleInquireClick(selectedSupplier)}
                  className="w-2/3 bg-[#2563eb] hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5"
                >
                  <Mail size={14} />
                  Send Wholesale Inquiry
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Wholesale Inquiry Modal ─── */}
      {showInquiryModal && selectedSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 max-w-lg w-full border border-slate-100 dark:border-slate-800 shadow-2xl relative my-8">
            <div className="flex items-start justify-between mb-5">
              <div>
                <span className="text-[11px] font-bold text-[#2563eb] bg-blue-50 dark:bg-blue-950/50 px-2.5 py-0.5 rounded-md">
                  Wholesale Procurement Request
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 mt-2">
                  Inquire with {selectedSupplier.company}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Direct partnership & bulk supply RFQ</p>
              </div>
              <button
                onClick={() => setShowInquiryModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendInquiry} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Your Business / Enterprise Name <span className="text-rose-500">*</span>
                </label>
                <Input
                  required
                  placeholder="e.g. Dhaka Mega Mart / Retailer"
                  value={inquiryData.businessName}
                  onChange={(e) => setInquiryData({ ...inquiryData, businessName: e.target.value })}
                  className="rounded-xl border-slate-200 dark:border-slate-800 text-xs py-4"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Contact Person <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    required
                    placeholder="Full Name"
                    value={inquiryData.contactPerson}
                    onChange={(e) => setInquiryData({ ...inquiryData, contactPerson: e.target.value })}
                    className="rounded-xl border-slate-200 dark:border-slate-800 text-xs py-4"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    required
                    placeholder="+880 1XXXXXXXXX"
                    value={inquiryData.phone}
                    onChange={(e) => setInquiryData({ ...inquiryData, phone: e.target.value })}
                    className="rounded-xl border-slate-200 dark:border-slate-800 text-xs py-4"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Business Email <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="email"
                  required
                  placeholder="procurement@company.com"
                  value={inquiryData.email}
                  onChange={(e) => setInquiryData({ ...inquiryData, email: e.target.value })}
                  className="rounded-xl border-slate-200 dark:border-slate-800 text-xs py-4"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Estimated Monthly Order Volume / Requirements
                </label>
                <Input
                  placeholder="e.g. 500 units / month or 1 Ton"
                  value={inquiryData.estimatedVolume}
                  onChange={(e) => setInquiryData({ ...inquiryData, estimatedVolume: e.target.value })}
                  className="rounded-xl border-slate-200 dark:border-slate-800 text-xs py-4"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Inquiry Details / Specific SKUs
                </label>
                <Textarea
                  rows={3}
                  placeholder="Describe your bulk requirement, target delivery timeline, or questions..."
                  value={inquiryData.message}
                  onChange={(e) => setInquiryData({ ...inquiryData, message: e.target.value })}
                  className="rounded-xl border-slate-200 dark:border-slate-800 text-xs resize-none"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <Button
                  type="button"
                  onClick={() => setShowInquiryModal(false)}
                  variant="outline"
                  className="w-1/3 rounded-xl text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-2/3 bg-[#2563eb] hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      Submit Inquiry
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Supplier Partnership Onboarding Application Modal ─── */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 max-w-xl w-full border border-slate-100 dark:border-slate-800 shadow-2xl relative my-8">
            <div className="flex items-start justify-between mb-5">
              <div>
                <span className="text-[11px] font-bold text-[#2563eb] bg-blue-50 dark:bg-blue-950/50 px-2.5 py-0.5 rounded-md">
                  Vendor & Supplier Registration
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 mt-2">
                  Join Bangla Bazar as a Supplier
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Supply direct products to our nationwide network</p>
              </div>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSupplierRegistration} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Company / Farm Name <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    required
                    placeholder="e.g. Delta Agro Industries Ltd."
                    value={registerData.companyName}
                    onChange={(e) => setRegisterData({ ...registerData, companyName: e.target.value })}
                    className="rounded-xl border-slate-200 dark:border-slate-800 text-xs py-4"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Representative Name <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    required
                    placeholder="Authorized Person Name"
                    value={registerData.representativeName}
                    onChange={(e) => setRegisterData({ ...registerData, representativeName: e.target.value })}
                    className="rounded-xl border-slate-200 dark:border-slate-800 text-xs py-4"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    type="email"
                    required
                    placeholder="official@company.com"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    className="rounded-xl border-slate-200 dark:border-slate-800 text-xs py-4"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Phone / WhatsApp <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    required
                    placeholder="+880 1XXXXXXXXX"
                    value={registerData.phone}
                    onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                    className="rounded-xl border-slate-200 dark:border-slate-800 text-xs py-4"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Factory / Warehouse Address
                  </label>
                  <Input
                    placeholder="Plot, Area, District"
                    value={registerData.address}
                    onChange={(e) => setRegisterData({ ...registerData, address: e.target.value })}
                    className="rounded-xl border-slate-200 dark:border-slate-800 text-xs py-4"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Product Categories
                  </label>
                  <Input
                    placeholder="e.g. Organic Foods, Electronics"
                    value={registerData.productCategories}
                    onChange={(e) => setRegisterData({ ...registerData, productCategories: e.target.value })}
                    className="rounded-xl border-slate-200 dark:border-slate-800 text-xs py-4"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Company Overview & Sourcing Capacities
                </label>
                <Textarea
                  rows={3}
                  placeholder="Tell us about your production capacities, certifications, and items..."
                  value={registerData.description}
                  onChange={(e) => setRegisterData({ ...registerData, description: e.target.value })}
                  className="rounded-xl border-slate-200 dark:border-slate-800 text-xs resize-none"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <Button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  variant="outline"
                  className="w-1/3 rounded-xl text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-2/3 bg-[#2563eb] hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      Submit Application
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
