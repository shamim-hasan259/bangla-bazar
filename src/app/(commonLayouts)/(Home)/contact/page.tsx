"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  Building2,
  CheckCircle2,
  HelpCircle,
  Headphones,
  ShoppingBag,
  Sparkles,
  Loader2,
  ChevronDown,
  ChevronUp,
  Store,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    inquiryType: "General Inquiry",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const contactFaqs = [
    {
      q: "What is the fastest way to get support for an ongoing order?",
      a: "For immediate order support, you can reach our 24/7 hotline at 16269 or open a live chat directly with your assigned seller through your Customer Dashboard under Orders.",
    },
    {
      q: "How can I register as a seller on Bangla Bazar?",
      a: "Visit our Seller Registration page at /auth/seller/register or click 'Become a Seller'. The onboarding process is fast, easy, and typically approved within 24 hours.",
    },
    {
      q: "What are your customer support working hours?",
      a: "Our customer phone support operates daily from 8:00 AM to 10:00 PM. Our email support and live automated ticketing operate 24/7.",
    },
    {
      q: "Where is your corporate office located?",
      a: "Our headquarters is situated at Sector 11, Uttara, Dhaka-1230, Bangladesh.",
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      setSubmitting(true);
      // Simulate submission delay
      await new Promise((res) => setTimeout(res, 900));
      setSubmitted(true);
      toast.success("Thank you! Your message has been sent successfully. We will contact you shortly.");
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        inquiryType: "General Inquiry",
        message: "",
      });
    } catch {
      toast.error("Failed to send message. Please try again or reach our hotline.");
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
            <Headphones size={15} className="text-yellow-300" />
            24/7 Dedicated Support
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 leading-tight">
            We'd Love to Hear From You
          </h1>
          <p className="text-blue-100 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            Have a question, feedback, partnership request, or need help with your order?
            Our friendly team is always ready to assist you.
          </p>
        </div>
      </section>

      {/* ─── Quick Info Cards ─── */}
      <section className="container max-w-6xl mx-auto px-4 -mt-8 relative z-20 mb-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Phone */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-slate-100 dark:border-slate-800 flex flex-col hover:shadow-[0_8px_32px_rgba(0,0,0,0.1)] transition-all duration-200">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-[#2563eb] flex items-center justify-center mb-4">
              <Phone size={22} />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base mb-1">Call Us</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Toll-free hotline & customer care</p>
            <a href="tel:+8801789785509" className="text-sm font-bold text-[#2563eb] hover:underline">
              +8801789-785509
            </a>
            <span className="text-xs text-slate-400 mt-1">Hotline: 16269 (8am - 10pm)</span>
          </div>

          {/* Card 2: Email */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-slate-100 dark:border-slate-800 flex flex-col hover:shadow-[0_8px_32px_rgba(0,0,0,0.1)] transition-all duration-200">
            <div className="w-12 h-12 rounded-xl bg-violet-50 dark:bg-violet-950/50 text-violet-600 flex items-center justify-center mb-4">
              <Mail size={22} />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base mb-1">Email Support</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">For general & business queries</p>
            <a href="mailto:support@banglabazar.com.bd" className="text-sm font-bold text-violet-600 hover:underline break-all">
              support@banglabazar.com.bd
            </a>
            <span className="text-xs text-slate-400 mt-1">Average response: &lt; 2 hrs</span>
          </div>

          {/* Card 3: Location */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-slate-100 dark:border-slate-800 flex flex-col hover:shadow-[0_8px_32px_rgba(0,0,0,0.1)] transition-all duration-200">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center mb-4">
              <MapPin size={22} />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base mb-1">Our Location</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Corporate Headquarters</p>
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
              Sector 11, Uttara, Dhaka-1230, Bangladesh
            </p>
          </div>

          {/* Card 4: Hours */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-slate-100 dark:border-slate-800 flex flex-col hover:shadow-[0_8px_32px_rgba(0,0,0,0.1)] transition-all duration-200">
            <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-950/50 text-orange-600 flex items-center justify-center mb-4">
              <Clock size={22} />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base mb-1">Office Hours</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Operations & desk support</p>
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Sat – Thu: 10:00 AM – 6:00 PM
            </p>
            <span className="text-xs text-emerald-600 font-medium mt-1">Platform active 24/7</span>
          </div>

        </div>
      </section>

      {/* ─── Contact Form & Quick Channels Grid ─── */}
      <section className="container max-w-6xl mx-auto px-4 mb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Contact Form */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-10 border border-slate-100 dark:border-slate-800 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
            <div className="mb-6">
              <span className="text-xs font-bold text-[#2563eb] bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900 px-3 py-1 rounded-full uppercase tracking-wider">
                Send a Message
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-3">
                How Can We Help You?
              </h2>
              <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Fill out the form below and our customer support team will reply promptly.
              </p>
            </div>

            {submitted ? (
              <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-8 text-center flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 flex items-center justify-center mb-3">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-lg font-bold text-emerald-900 dark:text-emerald-200">Message Delivered!</h3>
                <p className="text-xs text-emerald-700 dark:text-emerald-300 max-w-sm mt-1 mb-6 leading-relaxed">
                  Thank you for reaching out to Bangla Bazar. One of our support officers will contact you shortly.
                </p>
                <Button
                  onClick={() => setSubmitted(false)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs px-6"
                >
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <Input
                      required
                      placeholder="e.g. Rahim Ahmed"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="rounded-xl border-slate-200 dark:border-slate-800 text-xs py-5"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <Input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="rounded-xl border-slate-200 dark:border-slate-800 text-xs py-5"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Phone Number
                    </label>
                    <Input
                      placeholder="+880 1XXXXXXXXX"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="rounded-xl border-slate-200 dark:border-slate-800 text-xs py-5"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Inquiry Type
                    </label>
                    <select
                      value={formData.inquiryType}
                      onChange={(e) => setFormData({ ...formData, inquiryType: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
                    >
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Order & Delivery Support">Order & Delivery Support</option>
                      <option value="Seller Partnership">Seller Onboarding & Partnership</option>
                      <option value="Payment & Refund Issue">Payment & Refund Issue</option>
                      <option value="Technical & App Feedback">Technical & App Feedback</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Subject
                  </label>
                  <Input
                    placeholder="Brief summary of your inquiry..."
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="rounded-xl border-slate-200 dark:border-slate-800 text-xs py-5"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Message <span className="text-rose-500">*</span>
                  </label>
                  <Textarea
                    required
                    rows={4}
                    placeholder="Write your detailed query or message here..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="rounded-xl border-slate-200 dark:border-slate-800 text-xs resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#2563eb] hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-xs md:text-sm"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Sending Message...
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>

          {/* Right: Support Channels & Help Cards */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Quick Channel 1: Customer Help Center */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
              <div className="relative z-10">
                <div className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center mb-4">
                  <MessageSquare size={22} className="text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">Customer Live Chat</h3>
                <p className="text-blue-100 text-xs leading-relaxed mb-6">
                  Chat instantly with our virtual assistant or message sellers directly for immediate order updates.
                </p>
                <Link
                  href="/dashboard/customer/chat"
                  className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-5 py-2.5 rounded-full hover:bg-blue-50 transition-all text-xs shadow"
                >
                  Open Live Chat
                </Link>
              </div>
            </div>

            {/* Quick Channel 2: Become a Seller */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-7 border border-slate-100 dark:border-slate-800 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Store size={22} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 text-base">Sell on Bangla Bazar</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Join thousands of entrepreneurs reaching millions of active shoppers across Bangladesh.
                  </p>
                  <Link
                    href="/auth/seller/register"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 mt-3"
                  >
                    Open Seller Account →
                  </Link>
                </div>
              </div>
            </div>

            {/* Quick Channel 3: Track Orders */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-7 border border-slate-100 dark:border-slate-800 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-950/50 text-orange-600 flex items-center justify-center shrink-0">
                  <ShoppingBag size={22} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 text-base">Track Your Parcel</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Check the real-time shipping status and estimated arrival date of your orders.
                  </p>
                  <Link
                    href="/track-order"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 hover:text-orange-700 mt-3"
                  >
                    Track Shipment →
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── Frequently Asked Questions ─── */}
      <section className="container max-w-4xl mx-auto px-4 mb-20">
        <div className="text-center mb-10">
          <span className="inline-block text-xs font-bold text-[#2563eb] bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900 px-3 py-1 rounded-full uppercase tracking-widest mb-3">
            FAQ
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            Frequently Asked Questions
          </h2>
        </div>
        <div className="space-y-3">
          {contactFaqs.map((faq, i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-4 text-left"
              >
                <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs md:text-sm pr-4">
                  {faq.q}
                </span>
                {openFaq === i ? (
                  <ChevronUp size={18} className="text-[#2563eb] shrink-0" />
                ) : (
                  <ChevronDown size={18} className="text-slate-400 shrink-0" />
                )}
              </button>
              {openFaq === i && (
                <div className="px-6 pb-5 text-slate-600 dark:text-slate-400 text-xs md:text-sm leading-relaxed border-t border-slate-50 dark:border-slate-800 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ─── Map / Office Location Strip ─── */}
      <section className="container max-w-6xl mx-auto px-4 pb-20">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-10 border border-slate-100 dark:border-slate-800 shadow-[0_4px_24px_rgba(0,0,0,0.06)] flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-[#2563eb] flex items-center justify-center shrink-0">
              <Building2 size={28} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Bangla Bazar Corporate Office</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Sector 11, Uttara Model Town, Dhaka-1230, Bangladesh
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="https://maps.google.com/?q=Uttara,Dhaka,Bangladesh"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#2563eb] hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-full text-xs transition-all shadow"
            >
              <MapPin size={14} />
              Open in Google Maps
            </a>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold px-6 py-2.5 rounded-full text-xs border border-slate-200 dark:border-slate-700 transition-all"
            >
              About Company
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
