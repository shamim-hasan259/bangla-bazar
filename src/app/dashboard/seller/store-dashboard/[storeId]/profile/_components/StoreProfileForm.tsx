"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  User,
  Shield,
  Clock,
  CreditCard,
  QrCode,
  UploadCloud,
  ImageIcon,
  CheckCircle,
  Download,
  AlertCircle,
  HelpCircle,
  FileText,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { updateStoreProfile } from "../_action";
import { uploadImages } from "../../../../store/_action";
import Loader from "@/components/ui/Loader";
import { useRouter } from "next/navigation";

interface IStoreProfile {
  id: string;
  storeNameBn: string;
  storeNameEn: string;
  slug: string;
  description: string | null;
  phone: string;
  email: string;
  storeLogo: string | null;
  storeBanner: string | null;
  address: string | null;
  facebook: string | null;
  instagram: string | null;
  x: string | null;
  settings: {
    returnPolicy: string | null;
    shippingPolicy: string | null;
    warrantyPolicy: string | null;
    businessHours: any;
    vacationMode: boolean;
    vacationStart: Date | string | null;
    vacationEnd: Date | string | null;
    seoTitle: string | null;
    seoDescription: string | null;
    seoKeywords: string | null;
  } | null;
  paymentSettings: {
    bankName: string | null;
    bankAccountName: string | null;
    bankAccountNumber: string | null;
    routingNo: string | null;
    bkashNumber: string | null;
    nagadNumber: string | null;
  } | null;
}

const DAYS_OF_WEEK = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

export default function StoreProfileForm({ store }: { store: IStoreProfile }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"general" | "policies" | "timings" | "payouts" | "qrcode">("general");
  const [loader, setLoader] = useState(false);

  // Forms state variables
  const [storeNameEn, setStoreNameEn] = useState(store.storeNameEn);
  const [storeNameBn, setStoreNameBn] = useState(store.storeNameBn);
  const [description, setDescription] = useState(store.description || "");
  const [phone, setPhone] = useState(store.phone);
  const [email, setEmail] = useState(store.email);
  const [address, setAddress] = useState(store.address || "");
  const [facebook, setFacebook] = useState(store.facebook || "");
  const [instagram, setInstagram] = useState(store.instagram || "");
  const [xLinks, setXLinks] = useState(store.x || "");

  // Files
  const [storeLogoImg, setStoreLogoImg] = useState<File | null>(null);
  const [storeBannerImg, setStoreBannerImg] = useState<File | null>(null);

  // Policies & SEO
  const [returnPolicy, setReturnPolicy] = useState(store.settings?.returnPolicy || "");
  const [shippingPolicy, setShippingPolicy] = useState(store.settings?.shippingPolicy || "");
  const [warrantyPolicy, setWarrantyPolicy] = useState(store.settings?.warrantyPolicy || "");
  const [seoTitle, setSeoTitle] = useState(store.settings?.seoTitle || "");
  const [seoDescription, setSeoDescription] = useState(store.settings?.seoDescription || "");
  const [seoKeywords, setSeoKeywords] = useState(store.settings?.seoKeywords || "");

  // Timings & Vacation
  const defaultHours = {
    monday: { open: "09:00", close: "18:00", closed: false },
    tuesday: { open: "09:00", close: "18:00", closed: false },
    wednesday: { open: "09:00", close: "18:00", closed: false },
    thursday: { open: "09:00", close: "18:00", closed: false },
    friday: { open: "09:00", close: "18:00", closed: true },
    saturday: { open: "09:00", close: "18:00", closed: false },
    sunday: { open: "09:00", close: "18:00", closed: false },
  };

  const initialHours = store.settings?.businessHours 
    ? { ...defaultHours, ...(store.settings.businessHours as any) }
    : defaultHours;

  const [businessHours, setBusinessHours] = useState<any>(initialHours);
  const [vacationMode, setVacationMode] = useState(store.settings?.vacationMode || false);
  const [vacationStart, setVacationStart] = useState(
    store.settings?.vacationStart 
      ? new Date(store.settings.vacationStart).toISOString().split("T")[0] 
      : ""
  );
  const [vacationEnd, setVacationEnd] = useState(
    store.settings?.vacationEnd 
      ? new Date(store.settings.vacationEnd).toISOString().split("T")[0] 
      : ""
  );

  // Payment settings
  const [bankName, setBankName] = useState(store.paymentSettings?.bankName || "");
  const [bankAccountName, setBankAccountName] = useState(store.paymentSettings?.bankAccountName || "");
  const [bankAccountNumber, setBankAccountNumber] = useState(store.paymentSettings?.bankAccountNumber || "");
  const [routingNo, setRoutingNo] = useState(store.paymentSettings?.routingNo || "");
  const [bkashNumber, setBkashNumber] = useState(store.paymentSettings?.bkashNumber || "");
  const [nagadNumber, setNagadNumber] = useState(store.paymentSettings?.nagadNumber || "");

  const handleHourChange = (day: string, field: "open" | "close" | "closed", value: any) => {
    setBusinessHours((prev: any) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoader(true);

      // Upload files if modified
      let uploadedLogo = store.storeLogo;
      if (storeLogoImg) {
        const logoData = new FormData();
        logoData.append("files", storeLogoImg);
        const res = await uploadImages(logoData, "");
        if (res.data.success) {
          uploadedLogo = res.data.urls[0];
        }
      }

      let uploadedBanner = store.storeBanner;
      if (storeBannerImg) {
        const bannerData = new FormData();
        bannerData.append("files", storeBannerImg);
        const res = await uploadImages(bannerData, "");
        if (res.data.success) {
          uploadedBanner = res.data.urls[0];
        }
      }

      // Vacation dates validation
      if (vacationMode && (!vacationStart || !vacationEnd)) {
        toast.error("Please provide both start and end dates for vacation mode.");
        setLoader(false);
        return;
      }

      const res = await updateStoreProfile(store.id, {
        storeNameEn,
        storeNameBn,
        description,
        phone,
        email,
        address,
        storeLogo: uploadedLogo,
        storeBanner: uploadedBanner,
        facebook,
        instagram,
        x: xLinks,

        // Settings
        returnPolicy,
        shippingPolicy,
        warrantyPolicy,
        businessHours,
        vacationMode,
        vacationStart: vacationMode ? vacationStart : null,
        vacationEnd: vacationMode ? vacationEnd : null,
        seoTitle,
        seoDescription,
        seoKeywords,

        // Payments
        bankName,
        bankAccountName,
        bankAccountNumber,
        routingNo,
        bkashNumber,
        nagadNumber,
      });

      if (res.success) {
        toast.success("Store settings updated successfully!");
        router.push("/dashboard/seller");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to update store settings.");
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong.");
    } finally {
      setLoader(false);
    }
  };

  // QR Code download handler
  const publicStoreUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/store/${store.slug}`;
  const qrCodeApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(publicStoreUrl)}`;

  const handleDownloadQR = async () => {
    try {
      const response = await fetch(qrCodeApiUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${store.slug}-store-qr.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error("Failed to download QR code. Try copying the link directly.");
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs flex flex-col md:flex-row min-h-[600px] animate-in fade-in duration-300">
      
      {/* ── Left Sidebar: Settings Tabs ── */}
      <div className="w-full md:w-64 border-r border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 p-4 shrink-0 flex flex-col gap-1">
        
        {/* General */}
        <button
          onClick={() => setActiveTab("general")}
          className={`flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-xs font-bold transition-all text-left ${
            activeTab === "general"
              ? "bg-[#1E60ED] text-white shadow-md shadow-blue-500/10"
              : "text-slate-500 hover:bg-slate-100/50 dark:hover:bg-slate-800/40"
          }`}
        >
          <User className="w-4 h-4" />
          <span>General Profile</span>
        </button>

        {/* Policies */}
        <button
          onClick={() => setActiveTab("policies")}
          className={`flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-xs font-bold transition-all text-left ${
            activeTab === "policies"
              ? "bg-[#1E60ED] text-white shadow-md shadow-blue-500/10"
              : "text-slate-500 hover:bg-slate-100/50 dark:hover:bg-slate-800/40"
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Policies & SEO</span>
        </button>

        {/* Timings */}
        <button
          onClick={() => setActiveTab("timings")}
          className={`flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-xs font-bold transition-all text-left ${
            activeTab === "timings"
              ? "bg-[#1E60ED] text-white shadow-md shadow-blue-500/10"
              : "text-slate-500 hover:bg-slate-100/50 dark:hover:bg-slate-800/40"
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Operating Hours</span>
        </button>

        {/* Payouts */}
        <button
          onClick={() => setActiveTab("payouts")}
          className={`flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-xs font-bold transition-all text-left ${
            activeTab === "payouts"
              ? "bg-[#1E60ED] text-white shadow-md shadow-blue-500/10"
              : "text-slate-500 hover:bg-slate-100/50 dark:hover:bg-slate-800/40"
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Payout Settings</span>
        </button>

        {/* QR Code */}
        <button
          onClick={() => setActiveTab("qrcode")}
          className={`flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-xs font-bold transition-all text-left ${
            activeTab === "qrcode"
              ? "bg-[#1E60ED] text-white shadow-md shadow-blue-500/10"
              : "text-slate-500 hover:bg-slate-100/50 dark:hover:bg-slate-800/40"
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>QR Code & Links</span>
        </button>
      </div>

      {/* ── Right Content Form Area ── */}
      <form onSubmit={handleSave} className="flex-1 p-6 md:p-8 flex flex-col justify-between">
        
        {/* Tab Sections */}
        <div className="space-y-6 flex-1">
          
          {/* TAB 1: GENERAL PROFILE */}
          {activeTab === "general" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h3 className="text-base font-bold text-slate-850 dark:text-white">Store Identity & Media</h3>
                <p className="text-xs text-slate-400">Configure your storefront details and connections.</p>
              </div>

              {/* Names */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-350">Store Name (English) *</label>
                  <Input value={storeNameEn} onChange={(e) => setStoreNameEn(e.target.value)} required className="rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-350">Store Name (Bangla) *</label>
                  <Input value={storeNameBn} onChange={(e) => setStoreNameBn(e.target.value)} required className="rounded-xl font-medium" />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-350">Store Description</label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="h-24 rounded-xl resize-none" placeholder="Provide store details..." />
              </div>

              {/* Contacts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-350">Store Phone *</label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} required className="rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-350">Store Email *</label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="rounded-xl" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-350">Store Address</label>
                <Input value={address} onChange={(e) => setAddress(e.target.value)} className="rounded-xl" />
              </div>

              {/* Media upload */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                
                {/* Logo picker */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-350">Store Logo</label>
                  <div className="relative border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[110px] bg-slate-50/50 dark:bg-slate-950/20">
                    <Input type="file" accept="image/*" onChange={(e) => setStoreLogoImg(e.target.files?.[0] || null)} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10" />
                    {storeLogoImg || store.storeLogo ? (
                      <div className="flex flex-col items-center gap-1.5">
                        <Image src={storeLogoImg ? URL.createObjectURL(storeLogoImg) : store.storeLogo!} alt="" width={48} height={48} className="rounded-lg object-cover aspect-square border" />
                        <span className="text-[10px] text-slate-400 font-medium truncate max-w-[150px]">{storeLogoImg ? storeLogoImg.name : "Current Logo"}</span>
                      </div>
                    ) : (
                      <UploadCloud className="w-6 h-6 text-blue-500 mb-1" />
                    )}
                  </div>
                </div>

                {/* Banner picker */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-350">Store Banner</label>
                  <div className="relative border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[110px] bg-slate-50/50 dark:bg-slate-950/20">
                    <Input type="file" accept="image/*" onChange={(e) => setStoreBannerImg(e.target.files?.[0] || null)} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10" />
                    {storeBannerImg || store.storeBanner ? (
                      <div className="flex flex-col items-center gap-1.5 w-full">
                        <div className="relative w-full h-12 rounded-lg overflow-hidden border">
                          <Image src={storeBannerImg ? URL.createObjectURL(storeBannerImg) : store.storeBanner!} alt="" fill className="object-cover" />
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium truncate max-w-[150px]">{storeBannerImg ? storeBannerImg.name : "Current Banner"}</span>
                      </div>
                    ) : (
                      <ImageIcon className="w-6 h-6 text-blue-500 mb-1" />
                    )}
                  </div>
                </div>
              </div>

              {/* Social links */}
              <div className="border-t pt-4 space-y-4">
                <span className="text-xs font-bold text-slate-400 block">Social Channels</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-650">Facebook URL</label>
                    <Input value={facebook} onChange={(e) => setFacebook(e.target.value)} className="rounded-xl text-xs" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-655">Instagram URL</label>
                    <Input value={instagram} onChange={(e) => setInstagram(e.target.value)} className="rounded-xl text-xs" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-650">X / Twitter URL</label>
                    <Input value={xLinks} onChange={(e) => setXLinks(e.target.value)} className="rounded-xl text-xs" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: POLICIES & SEO */}
          {activeTab === "policies" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h3 className="text-base font-bold text-slate-850 dark:text-white">Store Policies & Search Optimization</h3>
                <p className="text-xs text-slate-400">Establish operational terms and configure details for Google searches.</p>
              </div>

              {/* Policies Textareas */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-350">Return Policy</label>
                  <Textarea value={returnPolicy} onChange={(e) => setReturnPolicy(e.target.value)} className="h-20 rounded-xl resize-none" placeholder="e.g. Return unused items within 7 days..." />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-350">Shipping Policy</label>
                  <Textarea value={shippingPolicy} onChange={(e) => setShippingPolicy(e.target.value)} className="h-20 rounded-xl resize-none" placeholder="e.g. Deliveries within Dhaka: 2 days, Outside: 5 days..." />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-350">Warranty Policy</label>
                  <Textarea value={warrantyPolicy} onChange={(e) => setWarrantyPolicy(e.target.value)} className="h-20 rounded-xl resize-none" placeholder="e.g. Brand warranty provided directly by the manufacturer..." />
                </div>
              </div>

              {/* SEO Configurations */}
              <div className="border-t pt-4 space-y-4">
                <span className="text-xs font-bold text-slate-400 block">SEO Configurations</span>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-700">SEO Meta Title</label>
                    <Input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} className="rounded-xl text-xs" placeholder="e.g. Buy authentic gadgets at Apple World" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-700">SEO Meta Description</label>
                    <Textarea value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} className="h-16 rounded-xl text-xs resize-none" placeholder="Short summary of store content..." />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-700">SEO Meta Keywords</label>
                    <Input value={seoKeywords} onChange={(e) => setSeoKeywords(e.target.value)} className="rounded-xl text-xs" placeholder="e.g. gadgets, apple, shop, original" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TIMINGS & VACATION */}
          {activeTab === "timings" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h3 className="text-base font-bold text-slate-850 dark:text-white">Operating Hours & Vacation Mode</h3>
                <p className="text-xs text-slate-400">Set weekly operational availability or toggle vacation schedules.</p>
              </div>

              {/* Timings Selector */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-400 block">Weekly Operations</span>
                
                {DAYS_OF_WEEK.map((day) => {
                  const hours = businessHours[day] || { open: "09:00", close: "18:00", closed: false };

                  return (
                    <div key={day} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850 rounded-xl gap-4">
                      <span className="text-xs font-bold capitalize w-20 text-slate-700 dark:text-slate-350">{day}</span>
                      
                      <div className="flex items-center gap-2">
                        <input
                          type="time"
                          value={hours.open}
                          disabled={hours.closed}
                          onChange={(e) => handleHourChange(day, "open", e.target.value)}
                          className="bg-background border border-slate-200 rounded-lg px-2 py-1 text-xs focus:outline-none disabled:opacity-50"
                        />
                        <span className="text-xs text-slate-400">to</span>
                        <input
                          type="time"
                          value={hours.close}
                          disabled={hours.closed}
                          onChange={(e) => handleHourChange(day, "close", e.target.value)}
                          className="bg-background border border-slate-200 rounded-lg px-2 py-1 text-xs focus:outline-none disabled:opacity-50"
                        />
                      </div>

                      <label className="flex items-center gap-2 cursor-pointer text-xs select-none">
                        <input
                          type="checkbox"
                          checked={hours.closed}
                          onChange={(e) => handleHourChange(day, "closed", e.target.checked)}
                          className="rounded text-[#1E60ED] focus:ring-blue-500"
                        />
                        <span className="font-semibold text-slate-500">Closed</span>
                      </label>
                    </div>
                  );
                })}
              </div>

              {/* Vacation Mode */}
              <div className="border-t pt-4 space-y-4">
                <div className="flex items-center justify-between bg-blue-50/50 dark:bg-slate-850 p-4 border border-blue-100/10 rounded-2xl">
                  <div className="flex gap-3">
                    <Clock className="w-5 h-5 text-[#1E60ED] mt-0.5" />
                    <div>
                      <span className="text-xs font-bold text-slate-850 dark:text-white block">Vacation Mode</span>
                      <span className="text-[10px] text-slate-450 mt-0.5 block">
                        Temporarily mark store as offline. Catalog remains browsable, but checkouts will be disabled.
                      </span>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={vacationMode}
                      onChange={(e) => setVacationMode(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#1E60ED]"></div>
                  </label>
                </div>

                {vacationMode && (
                  <div className="grid grid-cols-2 gap-4 text-xs animate-in slide-in-from-top-2 duration-200">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Vacation Start Date</label>
                      <Input
                        type="date"
                        value={vacationStart}
                        onChange={(e) => setVacationStart(e.target.value)}
                        required={vacationMode}
                        className="rounded-xl text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Vacation End Date</label>
                      <Input
                        type="date"
                        value={vacationEnd}
                        onChange={(e) => setVacationEnd(e.target.value)}
                        required={vacationMode}
                        className="rounded-xl text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: PAYOUT SETTINGS */}
          {activeTab === "payouts" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h3 className="text-base font-bold text-slate-850 dark:text-white">Payout Settings</h3>
                <p className="text-xs text-slate-400">Configure bank credentials and mobile finance details for payouts.</p>
              </div>

              {/* Bank Details */}
              <div className="space-y-4">
                <span className="text-xs font-bold text-slate-400 block">Bank Account Routing</span>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Bank Name</label>
                    <Input value={bankName} onChange={(e) => setBankName(e.target.value)} className="rounded-xl" placeholder="e.g. Dutch Bangla Bank" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Account Holder Name</label>
                    <Input value={bankAccountName} onChange={(e) => setBankAccountName(e.target.value)} className="rounded-xl" placeholder="e.g. John Doe" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Account Number</label>
                    <Input value={bankAccountNumber} onChange={(e) => setBankAccountNumber(e.target.value)} className="rounded-xl" placeholder="Bank Account No." />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Routing Number</label>
                    <Input value={routingNo} onChange={(e) => setRoutingNo(e.target.value)} className="rounded-xl" placeholder="9 digit Routing No." />
                  </div>
                </div>
              </div>

              {/* Mobile Banking */}
              <div className="border-t pt-4 space-y-4">
                <span className="text-xs font-bold text-slate-400 block">Mobile Financial Services (MFS)</span>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">bKash Account Number</label>
                    <Input value={bkashNumber} onChange={(e) => setBkashNumber(e.target.value)} className="rounded-xl" placeholder="017xxxxxxxx" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Nagad Account Number</label>
                    <Input value={nagadNumber} onChange={(e) => setNagadNumber(e.target.value)} className="rounded-xl" placeholder="017xxxxxxxx" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: QR CODE & LINKS */}
          {activeTab === "qrcode" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h3 className="text-base font-bold text-slate-850 dark:text-white">Storefront QR Code & Web Links</h3>
                <p className="text-xs text-slate-400">Share your digital store QR code with offline customers.</p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-8 bg-slate-50 dark:bg-slate-950/20 border rounded-3xl p-6">
                {/* QR Image */}
                <div className="w-48 h-48 bg-white rounded-2xl border flex items-center justify-center p-3 relative shadow-sm">
                  <img src={qrCodeApiUrl} alt="Store QR Code" className="w-full h-full object-contain" />
                </div>

                {/* QR Actions */}
                <div className="flex-1 space-y-4 text-center sm:text-left">
                  <div>
                    <span className="text-xs font-bold text-slate-850 dark:text-white block">Digital QR Code Reference</span>
                    <span className="text-[11px] text-slate-450 block mt-1 leading-relaxed">
                      Download this QR code and print it on product packages, flyers, or retail counters. Customers can scan it to instantly browse your live collections on Bangla Bazar.
                    </span>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-700 block">Web storefront Link</label>
                    <input
                      type="text"
                      readOnly
                      value={publicStoreUrl}
                      onClick={(e) => {
                        (e.target as HTMLInputElement).select();
                        navigator.clipboard.writeText(publicStoreUrl);
                        toast.success("Link copied to clipboard!");
                      }}
                      className="w-full max-w-sm bg-white dark:bg-slate-900 border rounded-lg px-2.5 py-1.5 text-xs focus:outline-none text-[#1E60ED] font-semibold cursor-pointer"
                    />
                  </div>

                  <Button
                    type="button"
                    onClick={handleDownloadQR}
                    className="bg-[#1E60ED] hover:bg-blue-600 text-white font-bold rounded-xl flex items-center gap-2 mx-auto sm:mx-0 px-5 text-xs py-2"
                  >
                    <Download className="w-4 h-4" /> Download PNG
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Save Operations (Not shown in QR tab) */}
        {activeTab !== "qrcode" && (
          <div className="flex items-center justify-end pt-6 border-t mt-8">
            <Button
              type="submit"
              className="bg-[#1E60ED] hover:bg-blue-600 active:bg-blue-700 text-white font-bold rounded-xl px-10 transition-all shadow-md shadow-blue-500/10"
            >
              Save Store Profile
            </Button>
          </div>
        )}
      </form>
      <Loader isOpen={loader} onClose={setLoader} title="Updating store configurations..." />
    </div>
  );
}
