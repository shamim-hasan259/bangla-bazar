"use client";

import React from "react";
import PageTitle from "@/components/ui/PageTitle";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Mail,
  Phone,
  MessageSquare,
  HelpCircle,
  ShieldAlert,
  Server,
  FileCode2,
  ExternalLink,
  LifeBuoy,
  BookOpen,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminHelpSupportPage() {
  const adminGuides = [
    {
      category: "Escrow & Payout Approvals",
      questions: [
        {
          q: "How does the Escrow Release mechanism work?",
          a: "When a customer receives and confirms an order, the funds remain in the system escrow until delivery completion. Admins can view and approve release requests from the Escrow Management dashboard.",
        },
        {
          q: "How are seller payout requests processed?",
          a: "Vendors submit payout requests from their seller wallet. Admins review pending requests in Marketplace > Payout Requests, verify bank/MFS details, and approve or reject with a transaction ledger note.",
        },
      ],
    },
    {
      category: "Flash Sales & Mega Campaigns",
      questions: [
        {
          q: "How do I create and activate a new Flash Sale slot?",
          a: "Go to Marketing > Flash Sales and click 'Schedule Flash Sale'. Set the time window, mandatory discount threshold, and maximum product limit. Sellers can then register products for moderation.",
        },
        {
          q: "How do I moderate seller campaign submissions?",
          a: "Open any active campaign from Marketing > Campaigns. Review seller submitted products and click Approve or Reject to update their live marketplace availability.",
        },
      ],
    },
    {
      category: "Product & Vendor Management",
      questions: [
        {
          q: "How do I activate or suspend a store?",
          a: "In Marketplace > Stores, click on the store actions dropdown. You can review store details, change status to Active or Suspended, and notify the vendor.",
        },
        {
          q: "Can admins edit customer details and orders?",
          a: "Yes. In Management > Customers, admins can update customer contact details and view individual customer ledger histories.",
        },
      ],
    },
  ];

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Dashboard / Administration
          </span>
          <PageTitle title="Help & Admin Support" className="text-2xl font-bold text-slate-900 dark:text-white mt-1" />
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Documentation, operation manuals, system diagnostics, and developer support.
          </p>
        </div>
      </div>

      {/* Quick Contact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-[#1E60ED] flex items-center justify-center shrink-0">
            <Mail className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">Tech Support Email</h4>
            <p className="text-xs text-slate-400 truncate">support@banglabazar.com</p>
            <span className="text-[10px] text-emerald-600 font-bold mt-1 inline-flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Mon-Sat (9 AM - 8 PM)
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center shrink-0">
            <Phone className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">Admin Hotline</h4>
            <p className="text-xs text-slate-400 truncate">+880 1800-000000</p>
            <span className="text-[10px] text-emerald-600 font-bold mt-1 inline-flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Priority Hotline
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center shrink-0">
            <Server className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">System Status</h4>
            <p className="text-xs text-slate-400">All services operational</p>
            <span className="text-[10px] text-emerald-600 font-bold mt-1 inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" /> Live v1.0.0
            </span>
          </div>
        </div>
      </div>

      {/* Admin FAQs & Knowledge Base */}
      <Card className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-5">
          <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-800 dark:text-white">
            <BookOpen className="w-5 h-5 text-[#1E60ED]" />
            Administrator Operating Procedures & FAQs
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <Accordion type="single" collapsible className="w-full space-y-3">
            {adminGuides.map((group, idx) => (
              <div key={idx} className="space-y-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 pt-2">
                  {group.category}
                </h3>
                {group.questions.map((faq, fIdx) => (
                  <AccordionItem
                    key={fIdx}
                    value={`item-${idx}-${fIdx}`}
                    className="border border-slate-100 dark:border-slate-800 rounded-2xl px-4 bg-slate-50/50 dark:bg-slate-950/20"
                  >
                    <AccordionTrigger className="text-xs font-bold text-slate-800 dark:text-slate-200 hover:no-underline py-3.5">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-xs text-slate-500 dark:text-slate-400 pb-4 leading-relaxed">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </div>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
