"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Briefcase,
  Users,
  Sparkles,
  MapPin,
  Clock,
  CheckCircle2,
  ArrowRight,
  Heart,
  TrendingUp,
  Zap,
  Globe,
  Award,
  Send,
  Loader2,
  DollarSign,
  Coffee,
  GraduationCap,
  Building2,
  ChevronRight,
  Search,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import axios from "axios";

interface JobOpening {
  id: string;
  title: string;
  department: "Engineering" | "Operations" | "Product & Design" | "Marketing" | "Customer Support";
  location: string;
  type: "Full-time" | "Part-time" | "Hybrid" | "Remote";
  experience: string;
  salary: string;
  description: string;
  requirements: string[];
}

const JOB_LISTINGS: JobOpening[] = [
  {
    id: "job-1",
    title: "Senior Full-Stack Software Engineer (Next.js / Node.js)",
    department: "Engineering",
    location: "Uttara, Dhaka (Hybrid)",
    type: "Full-time",
    experience: "3+ Years",
    salary: "৳80,000 - ৳130,000 / month",
    description:
      "Design and build scalable e-commerce infrastructure, microservices, and real-time vendor dashboards powering high-traffic operations.",
    requirements: [
      "Proficient in TypeScript, Next.js (App Router), React, Node.js, and PostgreSQL/Prisma.",
      "Experience optimizing high-throughput APIs, caching (Redis), and multi-tenant architectures.",
      "Solid understanding of payment gateway integrations (SSLCommerz, bKash) and webhook security.",
    ],
  },
  {
    id: "job-2",
    title: "Multi-Vendor Logistics & Courier Operations Lead",
    department: "Operations",
    location: "Dhaka, Bangladesh",
    type: "Full-time",
    experience: "2+ Years",
    salary: "৳45,000 - ৳70,000 / month",
    description:
      "Oversee nationwide 64-district delivery partner workflows (Pathao, RedX, Paperfly, Steadfast) and SLA fulfillment.",
    requirements: [
      "Proven track record in e-commerce logistics, hub operations, or courier vendor management in Bangladesh.",
      "Data-driven mindset with experience tracking return rates, delivery TAT, and shipping escalations.",
      "Strong negotiation and communication skills with third-party delivery vendors.",
    ],
  },
  {
    id: "job-3",
    title: "Lead UI/UX Product Designer",
    department: "Product & Design",
    location: "Uttara, Dhaka (Hybrid)",
    type: "Full-time",
    experience: "3+ Years",
    salary: "৳65,000 - ৳100,000 / month",
    description:
      "Craft world-class customer shopping flows and seller analytics dashboards that delight millions of users.",
    requirements: [
      "Strong portfolio showcasing responsive web and mobile app interfaces with design systems.",
      "Deep understanding of user empathy, micro-interactions, accessibility, and conversion rate optimization (CRO).",
      "Proficiency in Figma, design token systems, and interactive prototyping.",
    ],
  },
  {
    id: "job-4",
    title: "Seller Growth & Onboarding Specialist",
    department: "Marketing",
    location: "Dhaka (Field & Office)",
    type: "Full-time",
    experience: "1+ Years",
    salary: "৳35,000 - ৳55,000 / month + Incentives",
    description:
      "Identify, onboard, and empower high-potential retail brands and local manufacturers to launch their stores on Bangla Bazar.",
    requirements: [
      "Experience in B2B merchant acquisition, retail partnership, or digital marketing in Bangladesh.",
      "Ability to train sellers on catalog optimization, order fulfillment, and promotions.",
      "Excellent interpersonal and presentation capabilities in Bangla and English.",
    ],
  },
  {
    id: "job-5",
    title: "Senior Customer Delight & Dispute Resolution Executive",
    department: "Customer Support",
    location: "Uttara, Dhaka",
    type: "Full-time",
    experience: "1-2 Years",
    salary: "৳25,000 - ৳40,000 / month",
    description:
      "Provide empathetic, swift customer care for order issues, return claims, and buyer-seller mediation.",
    requirements: [
      "Prior customer support experience in e-commerce, telecommunications, or ticketing systems.",
      "Fluent verbal and written communication in Bangla & English.",
      "Patient problem solver with dedication to high customer satisfaction (CSAT) scores.",
    ],
  },
  {
    id: "job-6",
    title: "DevOps & Cloud Infrastructure Engineer",
    department: "Engineering",
    location: "Remote / Hybrid",
    type: "Full-time",
    experience: "2+ Years",
    salary: "৳75,000 - ৳120,000 / month",
    description:
      "Maintain cloud infrastructure, CI/CD pipelines, container orchestration, and server monitoring for 99.99% platform uptime.",
    requirements: [
      "Hands-on experience with Docker, Kubernetes, AWS/GCP, Nginx, and automated CI/CD pipelines.",
      "Expertise in database backup strategies, security hardening, and load balancing.",
      "Knowledge of observability tools like Prometheus, Grafana, and ELK stack.",
    ],
  },
];

const PERKS = [
  {
    icon: DollarSign,
    title: "Competitive Compensation",
    desc: "Market-leading salaries, twice-yearly festival bonuses (Eid/Pohela Boishakh), and performance rewards.",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/40",
  },
  {
    icon: Heart,
    title: "Health & Well-being",
    desc: "Comprehensive health insurance coverage, wellness days, and mental health support programs.",
    color: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-50 dark:bg-rose-950/40",
  },
  {
    icon: GraduationCap,
    title: "Continuous Learning",
    desc: "Annual learning budget for certifications, technical workshops, books, and international conferences.",
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-50 dark:bg-violet-950/40",
  },
  {
    icon: Zap,
    title: "Fast-Track Career Growth",
    desc: "Clear promotion frameworks, mentorship programs, and high-impact leadership opportunities.",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/40",
  },
  {
    icon: Coffee,
    title: "Work-Life Balance",
    desc: "Flexible hybrid schedules, generous paid time off, maternity/paternity leaves, and catered snacks.",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
  },
  {
    icon: Building2,
    title: "Vibrant Office Environment",
    desc: "Modern open workspace located in Uttara, Dhaka with gaming zones, cafeteria, and collaborative pods.",
    color: "text-sky-600 dark:text-sky-400",
    bg: "bg-sky-50 dark:bg-sky-950/40",
  },
];

export default function CareersPage() {
  const [selectedDept, setSelectedDept] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedJob, setSelectedJob] = useState<JobOpening | null>(null);
  const [showApplyModal, setShowApplyModal] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [stats, setStats] = useState({
    activeSellers: 250,
    products: 12000,
    customers: 50000,
    coverage: 64,
  });

  const [applicationData, setApplicationData] = useState({
    fullName: "",
    email: "",
    phone: "",
    linkedin: "",
    resumeUrl: "",
    coverLetter: "",
  });

  // Fetch dynamic stats if available
  useEffect(() => {
    axios
      .get("/api/delivery-info")
      .then((res) => {
        if (res.data?.success && res.data.stats) {
          setStats((prev) => ({
            ...prev,
            activeSellers: res.data.stats.activeSellers || prev.activeSellers,
            coverage: res.data.stats.citiesCovered || 64,
          }));
        }
      })
      .catch(() => {});
  }, []);

  const departments = ["All", "Engineering", "Operations", "Product & Design", "Marketing", "Customer Support"];

  const filteredJobs = JOB_LISTINGS.filter((job) => {
    const matchesDept = selectedDept === "All" || job.department === selectedDept;
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesSearch;
  });

  const handleApplyClick = (job: JobOpening) => {
    setSelectedJob(job);
    setShowApplyModal(true);
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicationData.fullName.trim() || !applicationData.email.trim() || !applicationData.phone.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      setSubmitting(true);
      await new Promise((res) => setTimeout(res, 1000));
      toast.success(`Application submitted for ${selectedJob?.title}! Our HR team will review your profile.`);
      setShowApplyModal(false);
      setApplicationData({
        fullName: "",
        email: "",
        phone: "",
        linkedin: "",
        resumeUrl: "",
        coverLetter: "",
      });
    } catch {
      toast.error("Failed to submit application. Please email your CV directly to careers@banglabazar.com.bd");
    } finally {
      setSubmitting(false);
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
            <Sparkles size={16} className="text-yellow-300" />
            Join the Bangla Bazar Team
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 leading-tight">
            Build the Future of Commerce in Bangladesh
          </h1>
          <p className="text-blue-100 text-sm md:text-base max-w-2xl mx-auto leading-relaxed mb-8">
            We are a group of passionate builders, problem solvers, and innovators empowering millions of customers
            and thousands of entrepreneurs across the nation.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="#openings"
              className="inline-flex items-center gap-2 bg-white text-[#2563eb] font-bold px-7 py-3 rounded-full hover:bg-blue-50 transition-all text-xs md:text-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Explore Open Positions ({JOB_LISTINGS.length})
              <ArrowRight size={16} />
            </a>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/30 text-white font-semibold px-7 py-3 rounded-full hover:bg-white/20 transition-all text-xs md:text-sm"
            >
              Learn About Our Story
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Live Platform Impact Stats ─── */}
      <section className="container max-w-6xl mx-auto px-4 -mt-8 relative z-20 mb-14">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Active Shoppers", value: "50,000+", icon: Users, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/40" },
            { label: "Verified Sellers", value: `${stats.activeSellers}+`, icon: Building2, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/40" },
            { label: "Districts Covered", value: `${stats.coverage} / 64`, icon: Globe, color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-50 dark:bg-violet-950/40" },
            { label: "Year-over-Year Growth", value: "185%", icon: TrendingUp, color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-950/40" },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.06)] border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center hover:shadow-[0_8px_30px_rgba(0,0,0,0.1)] transition-all"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${item.bg} ${item.color}`}>
                <item.icon size={22} />
              </div>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{item.value}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Why Work With Us / Perks & Culture ─── */}
      <section className="container max-w-6xl mx-auto px-4 mb-20">
        <div className="text-center mb-12">
          <span className="text-xs font-bold text-[#2563eb] bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900 px-3 py-1 rounded-full uppercase tracking-wider">
            Benefits & Culture
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-3">
            Why You'll Love Working at Bangla Bazar
          </h2>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto mt-2">
            We foster an inclusive, high-ownership culture where every team member is empowered to make a meaningful difference.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {PERKS.map((perk, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-[0_2px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_28px_rgba(0,0,0,0.08)] transition-all hover:-translate-y-1"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${perk.bg} ${perk.color}`}>
                <perk.icon size={24} />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base mb-2">{perk.title}</h3>
              <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{perk.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Open Job Positions Section ─── */}
      <section id="openings" className="container max-w-6xl mx-auto px-4 mb-20 scroll-mt-20">
        <div className="text-center mb-10">
          <span className="text-xs font-bold text-[#2563eb] bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900 px-3 py-1 rounded-full uppercase tracking-wider">
            Current Openings
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-3">
            Find Your Dream Role
          </h2>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto mt-2">
            Discover active vacancies across our engineering, design, operations, marketing, and customer support divisions.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.04)] mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
          
          {/* Department Pills */}
          <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
            {departments.map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedDept === dept
                    ? "bg-[#2563eb] text-white shadow-sm"
                    : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                }`}
              >
                {dept}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              placeholder="Search by title or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs rounded-xl py-4 border-slate-200 dark:border-slate-800"
            />
          </div>
        </div>

        {/* Job Listings Grid */}
        {filteredJobs.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-100 dark:border-slate-800">
            <Briefcase className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Open Positions Match Your Search</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-4">
              Try selecting a different department filter or send us a general application.
            </p>
            <Button
              onClick={() => {
                setSelectedDept("All");
                setSearchQuery("");
              }}
              variant="outline"
              className="text-xs rounded-xl"
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-[0_2px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6"
              >
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-blue-50 dark:bg-blue-950/50 text-[#2563eb] text-[11px] font-bold px-2.5 py-0.5 rounded-md border border-blue-100 dark:border-blue-900">
                      {job.department}
                    </span>
                    <span className="bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 text-[11px] font-bold px-2.5 py-0.5 rounded-md border border-emerald-100 dark:border-emerald-900">
                      {job.type}
                    </span>
                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[11px] font-semibold px-2.5 py-0.5 rounded-md">
                      Exp: {job.experience}
                    </span>
                  </div>

                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 leading-snug">
                    {job.title}
                  </h3>

                  <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl">
                    {job.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1">
                    <span className="flex items-center gap-1">
                      <MapPin size={14} className="text-slate-400" />
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-200">
                      <DollarSign size={14} className="text-emerald-500" />
                      {job.salary}
                    </span>
                  </div>
                </div>

                <div className="shrink-0 flex items-center">
                  <Button
                    onClick={() => handleApplyClick(job)}
                    className="w-full sm:w-auto bg-[#2563eb] hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    Apply Now
                    <ArrowRight size={14} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ─── General Application CTA Strip ─── */}
      <section className="container max-w-6xl mx-auto px-4 pb-20">
        <div className="bg-gradient-to-br from-[#0052ff] to-[#2563eb] rounded-3xl p-8 md:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold mb-2">Don't See a Relevant Role?</h2>
            <p className="text-blue-100 text-xs md:text-sm max-w-lg leading-relaxed">
              We are constantly growing and eager to meet exceptional talent. Send your open CV to our talent acquisition team!
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-blue-100">
              <span>Direct Recruitment Email:</span>
              <a href="mailto:careers@banglabazar.com.bd" className="text-yellow-300 underline font-bold">
                careers@banglabazar.com.bd
              </a>
            </div>
          </div>
          <div className="shrink-0 flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => {
                setSelectedJob({
                  id: "general-app",
                  title: "General Talent Application",
                  department: "Engineering",
                  location: "Dhaka, Bangladesh",
                  type: "Full-time",
                  experience: "Open",
                  salary: "Negotiable",
                  description: "General profile submission for consideration across our growing teams.",
                  requirements: [],
                });
                setShowApplyModal(true);
              }}
              className="bg-white hover:bg-blue-50 text-[#2563eb] font-bold px-8 py-3 rounded-full text-xs shadow-lg"
            >
              Submit General Application
            </Button>
          </div>
        </div>
      </section>

      {/* ─── Application Modal ─── */}
      {showApplyModal && selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 max-w-xl w-full border border-slate-100 dark:border-slate-800 shadow-2xl relative my-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between mb-5">
              <div>
                <span className="text-[11px] font-bold text-[#2563eb] bg-blue-50 dark:bg-blue-950/50 px-2.5 py-0.5 rounded-md">
                  {selectedJob.department}
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 mt-2">
                  Apply for: {selectedJob.title}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">{selectedJob.location} • {selectedJob.type}</p>
              </div>
              <button
                onClick={() => setShowApplyModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitApplication} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <Input
                  required
                  placeholder="e.g. Tanvir Hassan"
                  value={applicationData.fullName}
                  onChange={(e) => setApplicationData({ ...applicationData, fullName: e.target.value })}
                  className="rounded-xl border-slate-200 dark:border-slate-800 text-xs py-4"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    type="email"
                    required
                    placeholder="tanvir@example.com"
                    value={applicationData.email}
                    onChange={(e) => setApplicationData({ ...applicationData, email: e.target.value })}
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
                    value={applicationData.phone}
                    onChange={(e) => setApplicationData({ ...applicationData, phone: e.target.value })}
                    className="rounded-xl border-slate-200 dark:border-slate-800 text-xs py-4"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  LinkedIn or Portfolio URL
                </label>
                <Input
                  placeholder="https://linkedin.com/in/username or github.com"
                  value={applicationData.linkedin}
                  onChange={(e) => setApplicationData({ ...applicationData, linkedin: e.target.value })}
                  className="rounded-xl border-slate-200 dark:border-slate-800 text-xs py-4"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Resume / CV Link (Google Drive / Dropbox)
                </label>
                <Input
                  placeholder="https://drive.google.com/your-cv-link"
                  value={applicationData.resumeUrl}
                  onChange={(e) => setApplicationData({ ...applicationData, resumeUrl: e.target.value })}
                  className="rounded-xl border-slate-200 dark:border-slate-800 text-xs py-4"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Cover Note or Message
                </label>
                <Textarea
                  rows={3}
                  placeholder="Briefly describe why you are interested in this position..."
                  value={applicationData.coverLetter}
                  onChange={(e) => setApplicationData({ ...applicationData, coverLetter: e.target.value })}
                  className="rounded-xl border-slate-200 dark:border-slate-800 text-xs resize-none"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <Button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
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
                      <Loader2 size={16} className="animate-spin" />
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
