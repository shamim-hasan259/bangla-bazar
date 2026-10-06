"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ImageIcon, UploadCloud, CheckCircle, XCircle, Loader2, ShieldAlert } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { StoreSetupFormSchema } from "../../../create/_components/StoreSetupFormSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Image from "next/image";
import axios from "axios";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Loader from "@/components/ui/Loader";
import { uploadImages } from "../../../_action";
import { resubmitStore } from "../../_action";

interface IStore {
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
  status: string;
  rejectionReason: string | null;
  masterCategoryId: string;
}

interface ICategory {
  id: string;
  name: string;
}

export default function ResubmitStoreForm({
  store,
  categories,
}: {
  store: IStore;
  categories: ICategory[];
}) {
  const [storeLogoImg, setStoreLogoImg] = useState<File | null>(null);
  const [storeBannerImg, setStoreBannerImg] = useState<File | null>(null);
  const [loader, setLoader] = useState(false);
  const [slugStatus, setSlugStatus] = useState<"idle" | "checking" | "available" | "unavailable">("idle");

  const router = useRouter();

  const form = useForm<z.infer<typeof StoreSetupFormSchema>>({
    resolver: zodResolver(StoreSetupFormSchema),
    defaultValues: {
      storeNameBn: store.storeNameBn || "",
      storeNameEn: store.storeNameEn || "",
      slug: store.slug || "",
      masterCategoryId: store.masterCategoryId || "",
      description: store.description || "",
      phone: store.phone || "",
      email: store.email || "",
      address: store.address || "",
      facebook: store.facebook || "",
      instagram: store.instagram || "",
      x: store.x || "",
    },
  });

  const watchedSlug = form.watch("slug");

  useEffect(() => {
    if (!watchedSlug || watchedSlug.length < 3) {
      setSlugStatus("idle");
      return;
    }

    if (watchedSlug === store.slug) {
      setSlugStatus("available");
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      const formatIsValid = /^[a-z0-9-]+$/.test(watchedSlug);
      if (!formatIsValid) {
        setSlugStatus("unavailable");
        return;
      }

      setSlugStatus("checking");
      try {
        const res = await axios.get(`/api/store/check-slug?slug=${watchedSlug}`);
        if (res.data.available) {
          setSlugStatus("available");
        } else {
          setSlugStatus("unavailable");
        }
      } catch {
        setSlugStatus("unavailable");
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [watchedSlug, store.slug]);

  const handleStoreResubmit = async (
    formData: z.infer<typeof StoreSetupFormSchema>
  ) => {
    if (slugStatus === "unavailable" || slugStatus === "checking") {
      toast.error("Please enter a unique, valid URL slug.");
      return;
    }

    try {
      setLoader(true);

      // Upload Logo only if a new image was chosen
      let uploadedStoreLogo = store.storeLogo || "";
      if (storeLogoImg) {
        const logoData = new FormData();
        logoData.append("files", storeLogoImg);
        const uploadRes = await uploadImages(logoData, "");
        if (uploadRes.data.success) {
          uploadedStoreLogo = uploadRes.data.urls[0];
        } else {
          throw new Error("Logo upload failed");
        }
      }

      // Upload Banner only if a new image was chosen
      let uploadedStoreBanner = store.storeBanner || "";
      if (storeBannerImg) {
        const bannerData = new FormData();
        bannerData.append("files", storeBannerImg);
        const uploadRes = await uploadImages(bannerData, "");
        if (uploadRes.data.success) {
          uploadedStoreBanner = uploadRes.data.urls[0];
        } else {
          throw new Error("Banner upload failed");
        }
      }

      const res = await resubmitStore(store.id, {
        ...formData,
        uploadedStoreLogo,
        uploadedStoreBanner,
      });

      if (res.success) {
        toast.success("Store resubmitted successfully! Awaiting admin review.");
        router.refresh();
        router.push("/dashboard/seller/store");
      } else {
        toast.error(res.error || "Failed to resubmit store details");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to resubmit store details");
    } finally {
      setLoader(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleStoreResubmit)}
        className="w-full space-y-8"
      >
        {/* Rejection Alert Header */}
        <div className="bg-red-50 dark:bg-red-950/10 border border-red-200 dark:border-red-950/20 rounded-3xl p-5 flex items-start gap-4">
          <ShieldAlert className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-red-700 dark:text-red-400">Store Registration Rejected</h3>
            <p className="text-xs text-red-600 dark:text-red-500 mt-1 leading-relaxed">
              Reason: {store.rejectionReason || "No details provided."}
            </p>
            <p className="text-[10px] text-red-500 mt-2 font-medium">
              Please correct the store information below and resubmit for approval.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Column 1: Store Details */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Store Details</h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Edit store profile information.</p>
            </div>

            {/* Store Name (English) */}
            <FormField
              control={form.control}
              name="storeNameEn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 dark:text-slate-300 font-semibold text-xs">Store Name (English) *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Apple World" className="rounded-xl" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Store Name (Bangla) */}
            <FormField
              control={form.control}
              name="storeNameBn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 dark:text-slate-300 font-semibold text-xs">Store Name (Bangla) *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. অ্যাপেল ওয়ার্ল্ড" className="rounded-xl font-medium" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Unique Slug */}
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 dark:text-slate-300 font-semibold text-xs">Store URL Slug *</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        placeholder="e.g. apple-world"
                        className="rounded-xl pr-10 lowercase"
                        {...field}
                        onChange={(e) => {
                          const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-");
                          field.onChange(val);
                        }}
                      />
                    </FormControl>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                      {slugStatus === "checking" && <Loader2 className="w-4 h-4 text-[#1E60ED] animate-spin" />}
                      {slugStatus === "available" && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                      {slugStatus === "unavailable" && <XCircle className="w-4 h-4 text-rose-500" />}
                    </div>
                  </div>
                  {slugStatus === "available" && (
                    <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                      URL slug is available: shop.banglabazar.com/store/{watchedSlug}
                    </p>
                  )}
                  {slugStatus === "unavailable" && (
                    <p className="text-[11px] text-rose-500 font-semibold mt-1">
                      Slug is taken or invalid.
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Master Category */}
            <FormField
              control={form.control}
              name="masterCategoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 dark:text-slate-300 font-semibold text-xs">Master Category *</FormLabel>
                  <FormControl>
                    <select
                      className="w-full bg-background border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E60ED]/20 focus:border-[#1E60ED]"
                      {...field}
                    >
                      <option value="">Select Master Category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 dark:text-slate-300 font-semibold text-xs">Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your store..."
                      {...field}
                      className="h-28 rounded-xl"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Column 2: Media & Connections */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Media</h2>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Customize your brand appearance.</p>
              </div>

              {/* Logo Upload */}
              <div className="space-y-2">
                <label className="text-slate-700 dark:text-slate-300 font-semibold text-xs block">Store Logo</label>
                <div className="relative border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-4 hover:border-[#1E60ED] transition-colors flex flex-col items-center justify-center min-h-[120px] bg-slate-50/50 dark:bg-slate-950/20">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setStoreLogoImg(e.target.files?.[0] || null)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                  />
                  {storeLogoImg || store.storeLogo ? (
                    <div className="flex flex-col items-center gap-2">
                      <Image
                        src={storeLogoImg ? URL.createObjectURL(storeLogoImg) : store.storeLogo!}
                        alt="Logo Preview"
                        width={64}
                        height={64}
                        className="rounded-xl object-cover aspect-square border"
                      />
                      <span className="text-xs text-slate-500 truncate max-w-[180px] font-semibold">
                        {storeLogoImg ? storeLogoImg.name : "Current Store Logo"}
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-slate-400 text-center">
                      <UploadCloud size={28} className="text-[#1E60ED] mb-1" />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Upload Store Logo</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Banner Upload */}
              <div className="space-y-2">
                <label className="text-slate-700 dark:text-slate-300 font-semibold text-xs block">Store Banner</label>
                <div className="relative border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-4 hover:border-[#1E60ED] transition-colors flex flex-col items-center justify-center min-h-[140px] bg-slate-50/50 dark:bg-slate-950/20">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setStoreBannerImg(e.target.files?.[0] || null)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                  />
                  {storeBannerImg || store.storeBanner ? (
                    <div className="flex flex-col items-center gap-2 w-full h-full">
                      <div className="relative w-full h-20 rounded-xl overflow-hidden border">
                        <Image
                          src={storeBannerImg ? URL.createObjectURL(storeBannerImg) : store.storeBanner!}
                          alt="Banner Preview"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <span className="text-xs text-slate-500 truncate max-w-[200px] font-semibold">
                        {storeBannerImg ? storeBannerImg.name : "Current Store Banner"}
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-slate-400 text-center">
                      <ImageIcon size={28} className="text-[#1E60ED] mb-1" />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Upload Store Banner</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Contacts & Social links Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Contact & Socials</h2>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Provide customer connect points.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 dark:text-slate-300 font-semibold text-xs">Phone *</FormLabel>
                      <FormControl>
                        <Input placeholder="Phone" className="rounded-xl" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 dark:text-slate-300 font-semibold text-xs">Email *</FormLabel>
                      <FormControl>
                        <Input placeholder="Email" className="rounded-xl" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 dark:text-slate-300 font-semibold text-xs">Store Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Street address" className="rounded-xl" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4 pt-2">
                <FormField
                  control={form.control}
                  name="facebook"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 dark:text-slate-300 font-semibold text-xs">Facebook</FormLabel>
                      <FormControl>
                        <Input placeholder="Facebook Link" className="rounded-xl text-xs" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="instagram"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 dark:text-slate-300 font-semibold text-xs">Instagram</FormLabel>
                      <FormControl>
                        <Input placeholder="Instagram Link" className="rounded-xl text-xs" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="x"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 dark:text-slate-300 font-semibold text-xs">X (Twitter)</FormLabel>
                      <FormControl>
                        <Input placeholder="X Link" className="rounded-xl text-xs" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-6 border-t">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.back()}
            className="rounded-xl font-bold"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-[#1E60ED] hover:bg-blue-600 text-white font-bold rounded-xl px-8"
          >
            Resubmit for Approval
          </Button>
        </div>
      </form>
      <Loader isOpen={loader} onClose={setLoader} title="Resubmitting store registration..." />
    </Form>
  );
}
