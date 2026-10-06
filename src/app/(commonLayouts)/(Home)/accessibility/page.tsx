"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Eye,
  Sparkles,
  Volume2,
  MousePointer,
  Contrast,
  Sliders,
  CheckCircle2,
  Phone,
  Mail,
  HelpCircle,
  Keyboard,
  ShieldCheck,
  Send,
  Loader2,
  BookOpen,
  Headphones,
  FileText,
  Check,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Type,
  Sun,
  Moon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function AccessibilityPage() {
  const [fontSize, setFontSize] = useState<"normal" | "large" | "xlarge">("normal");
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [readableFont, setReadableFont] = useState<boolean>(false);
  const [highlightLinks, setHighlightLinks] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const [feedbackForm, setFeedbackForm] = useState({
    name: "",
    email: "",
    phone: "",
    issueType: "Screen Reader Support",
    details: "",
    device: "",
  });

  const handleResetSettings = () => {
    setFontSize("normal");
    setHighContrast(false);
    setReadableFont(false);
    setHighlightLinks(false);
    toast.info("Accessibility tool settings reset to default.");
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackForm.name || !feedbackForm.email || !feedbackForm.details) {
      toast.error("Please fill in the required fields.");
      return;
    }

    try {
      setSubmitting(true);
      await new Promise((res) => setTimeout(res, 900));
      toast.success("Thank you! Your accessibility feedback has been submitted to our digital inclusion team.");
      setFeedbackForm({
        name: "",
        email: "",
        phone: "",
        issueType: "Screen Reader Support",
        details: "",
        device: "",
      });
    } catch {
      toast.error("Failed to submit feedback. Please call our hotline at 16269.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${highContrast
          ? "bg-black text-yellow-300"
          : "bg-[#f8fafc] dark:bg-slate-950 text-slate-800 dark:text-slate-100"
        } ${readableFont ? "font-sans tracking-wide" : ""}`}
    >
      {/* ─── Hero Header ─── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0052ff] via-[#2563eb] to-[#1e40af] text-white">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -right-32 w-[450px] h-[450px] rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-[450px] h-[450px] rounded-full bg-white/10 blur-3xl" />
        </div>

        <div className="container max-w-5xl mx-auto px-4 py-16 md:py-24 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/25 text-white text-xs md:text-sm font-semibold px-4 py-1.5 rounded-full mb-6 shadow-sm">
            <Sparkles size={16} className="text-yellow-300" />
            Digital Inclusion & Universal Access
          </div>

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-5 leading-tight">
            Accessibility & Inclusion at Bangla Bazar
          </h1>

          <p className="text-blue-100 text-sm md:text-base max-w-2xl mx-auto leading-relaxed mb-8">
            We are dedicated to ensuring that digital commerce is barrier-free and empowering for all users,
            including individuals with visual, auditory, motor, or cognitive disabilities.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="#tools"
              className="inline-flex items-center gap-2 bg-white text-[#2563eb] font-bold px-7 py-3 rounded-full hover:bg-blue-50 transition-all text-xs md:text-sm shadow-lg hover:shadow-xl"
            >
              <Sliders size={16} />
              Interactive Reading Tools
            </a>
            <a
              href="#feedback"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white font-semibold px-7 py-3 rounded-full transition-all text-xs md:text-sm"
            >
              Report an Accessibility Hurdle
            </a>
          </div>
        </div>
      </section>

      {/* ─── Interactive Quick Adjustment Toolbar ─── */}
      <section id="tools" className="container max-w-5xl mx-auto px-4 -mt-8 relative z-20 mb-14">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.08)] border border-slate-100 dark:border-slate-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-[11px] font-bold text-[#2563eb] uppercase tracking-wider bg-blue-50 dark:bg-blue-950/50 px-2.5 py-1 rounded-md">
                Live Customization
              </span>
              <h3 className="text-lg md:text-xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">
                Customize Your Browsing Experience
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Adjust font size, contrast, and element highlights for comfortable reading.
              </p>
            </div>
            <Button
              onClick={handleResetSettings}
              variant="outline"
              className="self-start md:self-auto text-xs rounded-xl flex items-center gap-1.5 text-slate-600 dark:text-slate-300"
            >
              <RotateCcw size={13} />
              Reset Preferences
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
            {/* Font Size Scaling */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 mb-1">
                  <Type size={16} className="text-[#2563eb]" />
                  Text Size
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Scale text for clarity</p>
              </div>
              <div className="flex items-center gap-1 mt-3">
                <button
                  onClick={() => setFontSize("normal")}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${fontSize === "normal"
                      ? "bg-[#2563eb] text-white"
                      : "bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                    }`}
                >
                  100%
                </button>
                <button
                  onClick={() => setFontSize("large")}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${fontSize === "large"
                      ? "bg-[#2563eb] text-white"
                      : "bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                    }`}
                >
                  125%
                </button>
                <button
                  onClick={() => setFontSize("xlarge")}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${fontSize === "xlarge"
                      ? "bg-[#2563eb] text-white"
                      : "bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                    }`}
                >
                  150%
                </button>
              </div>
            </div>

            {/* High Contrast Mode */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 mb-1">
                  <Contrast size={16} className="text-[#2563eb]" />
                  High Contrast
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Boost text visibility</p>
              </div>
              <button
                onClick={() => setHighContrast(!highContrast)}
                className={`w-full mt-3 py-2 text-xs font-bold rounded-xl transition-all ${highContrast
                    ? "bg-amber-400 text-black font-extrabold"
                    : "bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                  }`}
              >
                {highContrast ? "High Contrast: ON" : "Enable High Contrast"}
              </button>
            </div>

            {/* Clear Typography */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 mb-1">
                  <BookOpen size={16} className="text-[#2563eb]" />
                  Dyslexia / Open Font
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Enhanced character spacing</p>
              </div>
              <button
                onClick={() => setReadableFont(!readableFont)}
                className={`w-full mt-3 py-2 text-xs font-bold rounded-xl transition-all ${readableFont
                    ? "bg-[#2563eb] text-white"
                    : "bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                  }`}
              >
                {readableFont ? "Enhanced Font: ON" : "Readable Typography"}
              </button>
            </div>

            {/* Highlight Links */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 mb-1">
                  <MousePointer size={16} className="text-[#2563eb]" />
                  Highlight Interactive
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Outline clickable links</p>
              </div>
              <button
                onClick={() => setHighlightLinks(!highlightLinks)}
                className={`w-full mt-3 py-2 text-xs font-bold rounded-xl transition-all ${highlightLinks
                    ? "bg-[#2563eb] text-white"
                    : "bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                  }`}
              >
                {highlightLinks ? "Outlines: ON" : "Highlight Links"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── WCAG Compliance & Accessibility Pillars ─── */}
      <section className="container max-w-5xl mx-auto px-4 mb-16">
        <div className="text-center mb-12">
          <span className="text-xs font-bold text-[#2563eb] bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900 px-3 py-1 rounded-full uppercase tracking-wider">
            WCAG 2.1 (Level AA) Alignment
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-3">
            Our Core Accessibility Standards
          </h2>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto mt-2">
            Bangla Bazar continuously upgrades its digital platform following international Web Content Accessibility Guidelines (WCAG).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              icon: Keyboard,
              title: "Full Keyboard Navigation",
              description:
                "Browse catalogs, filter items, add to cart, and checkout seamlessly without requiring a mouse. Logical TAB index ordering and visible focus rings across all active elements.",
              tag: "Keyboard Operable",
            },
            {
              icon: Volume2,
              title: "Screen Reader Compatibility",
              description:
                "Optimized semantic HTML structure with ARIA labels, image alt-texts, descriptive button tags, and screen reader announcements for NVDA, JAWS, VoiceOver, and TalkBack.",
              tag: "ARIA Compliant",
            },
            {
              icon: Eye,
              title: "High Visual Clarity & Contrast",
              description:
                "Strict adherence to minimum 4.5:1 color contrast ratio for normal text and 3:1 for large graphical elements, ensuring optimal visibility for low-vision and color-blind users.",
              tag: "Visual Ergonomics",
            },
            {
              icon: Headphones,
              title: "Bilingual Assistance & Audio Support",
              description:
                "Full bilingual interface in both Bangla (বাংলা) and English with clear plain-language product descriptions, error alerts, and 24/7 telephonic shopping assistance.",
              tag: "Multilingual Care",
            },
          ].map((pillar, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-100 dark:border-slate-800 shadow-[0_2px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-[#2563eb] flex items-center justify-center">
                    <pillar.icon size={24} />
                  </div>
                  <span className="text-[10px] font-bold text-[#2563eb] bg-blue-50 dark:bg-blue-950/50 px-2.5 py-0.5 rounded-full border border-blue-100 dark:border-blue-900">
                    {pillar.tag}
                  </span>
                </div>
                <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
                  {pillar.title}
                </h3>
                <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {pillar.description}
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                <CheckCircle2 size={15} />
                <span>Verified & Actively Maintained</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Telephonic Shopping & Special Assistance Hotline ─── */}
      <section className="container max-w-5xl mx-auto px-4 mb-16">
        <div className="bg-gradient-to-br from-[#0052ff] to-[#2563eb] rounded-3xl p-8 md:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-xs font-bold text-yellow-300 bg-white/10 px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1">
              <Phone size={13} /> Dedicated Assisted Shopping
            </span>
            <h3 className="text-2xl font-extrabold">Need Help Placing an Order?</h3>
            <p className="text-blue-100 text-xs md:text-sm max-w-lg leading-relaxed">
              If you experience any visual, physical, or technical difficulty navigating our online store,
              our accessibility care specialists are standing by to take your order by phone.
            </p>
          </div>

          <div className="shrink-0 flex flex-col items-center sm:items-end gap-2">
            <a
              href="tel:16269"
              className="bg-white hover:bg-blue-50 text-[#2563eb] font-extrabold text-sm md:text-base px-8 py-3.5 rounded-full shadow-lg flex items-center gap-2 transition-transform hover:scale-105"
            >
              <Phone size={18} />
              Call Hotline: 16269
            </a>
            <span className="text-[11px] text-blue-100">Every day from 8:00 AM – 10:00 PM</span>
          </div>
        </div>
      </section>

      {/* ─── Accessibility Feedback Form ─── */}
      <section id="feedback" className="container max-w-4xl mx-auto px-4 pb-20 scroll-mt-20">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-10 border border-slate-100 dark:border-slate-800 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
          <div className="text-center mb-8">
            <span className="text-xs font-bold text-[#2563eb] bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900 px-3 py-1 rounded-full uppercase tracking-wider">
              We Value Your Feedback
            </span>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-2">
              Report an Accessibility Issue
            </h3>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
              Encountered a barrier on our website? Let our engineering & inclusion team know so we can fix it promptly.
            </p>
          </div>

          <form onSubmit={handleSubmitFeedback} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Your Name <span className="text-rose-500">*</span>
                </label>
                <Input
                  required
                  placeholder="Full Name"
                  value={feedbackForm.name}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, name: e.target.value })}
                  className="rounded-xl border-slate-200 dark:border-slate-800 text-xs py-4"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={feedbackForm.email}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, email: e.target.value })}
                  className="rounded-xl border-slate-200 dark:border-slate-800 text-xs py-4"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Phone Number (Optional)
                </label>
                <Input
                  placeholder="+880 1XXXXXXXXX"
                  value={feedbackForm.phone}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, phone: e.target.value })}
                  className="rounded-xl border-slate-200 dark:border-slate-800 text-xs py-4"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Area of Difficulty
                </label>
                <select
                  value={feedbackForm.issueType}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, issueType: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Screen Reader Support">Screen Reader Compatibility</option>
                  <option value="Keyboard Navigation">Keyboard Navigation / Focus Trapping</option>
                  <option value="Color Contrast & Text Size">Color Contrast / Font Size</option>
                  <option value="Checkout Flow Assistance">Checkout or Payment Accessibility</option>
                  <option value="Product Media & Alt-Text">Product Images / Missing Alt Text</option>
                  <option value="Other">Other Accessibility Suggestion</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Describe the Issue or Feature Request <span className="text-rose-500">*</span>
              </label>
              <Textarea
                required
                rows={4}
                placeholder="Please describe what page you were on, what assistive technology you were using, and what issue occurred..."
                value={feedbackForm.details}
                onChange={(e) => setFeedbackForm({ ...feedbackForm, details: e.target.value })}
                className="rounded-xl border-slate-200 dark:border-slate-800 text-xs resize-none"
              />
            </div>

            <div className="pt-2 text-center">
              <Button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto bg-[#2563eb] hover:bg-blue-700 text-white font-bold px-10 py-3.5 rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 mx-auto"
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send size={15} />
                    Send Accessibility Feedback
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
