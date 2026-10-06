"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ImageIcon, UploadCloud } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { StoreSetupFormSchema } from "./StoreSetupFormSchema";
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
import { uploadImages } from "../../_action";

interface ISeller {
  id: string;
  sellerId: string;
}

interface ICategory {
  id: string;
  name: string;
}

export default function StoreSetupForm({
  seller,
  categories,
}: {
  seller: ISeller | null;
  categories: ICategory[];
}) {
  const [storeLogoImg, setStoreLogoImg] = useState<File | null>(null);
  const [storeBannerImg, setStoreBannerImg] = useState<File | null>(null);
  const [loader, setLoader] = useState(false);

  const router = useRouter();
  const sellerId = seller?.id;

  const form = useForm<z.infer<typeof StoreSetupFormSchema>>({
    resolver: zodResolver(StoreSetupFormSchema),
    defaultValues: {
      storeNameBn: "",
      storeNameEn: "",
      slug: "",
      masterCategoryId: "",
      description: "",
      phone: seller?.id ? "01900000000" : "", // Fallback defaults
      email: "",
      address: "",
      facebook: "",
      instagram: "",
      x: "",
    },
  });

  const handleStoreSetupSubmit = async (
    formData: z.infer<typeof StoreSetupFormSchema>
  ) => {
    try {
      setLoader(true);

      // Upload Logo if present
      let uploadedStoreLogo = "";
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

      // Upload Banner if present
      let uploadedStoreBanner = "";
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

      const res = await axios.post("/api/store", {
        ...formData,
        sellerId,
        uploadedStoreLogo,
        uploadedStoreBanner,
      });

      if (res.status === 200) {
        toast.success("Store setup created successfully! Awaiting admin approval.");
        router.refresh();
        router.push("/dashboard/seller/store");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || error.message || "Failed to submit store setup");
    } finally {
      setLoader(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleStoreSetupSubmit)}
        className="w-full space-y-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Column 1: Store Details */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Basic Information</h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Define your store identity.</p>
            </div>

            {/* Store Name (English) */}
            <FormField
              control={form.control}
              name="storeNameEn"
              render={({ field }) => (
                <FormItem>
                  <FormItem>
                    <FormLabel className="text-slate-700 dark:text-slate-300 font-semibold text-xs">Store Name (English) *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Apple World" className="rounded-xl" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormItem>
              )}
            />

            {/* Store Name (Bangla) */}
            <FormField
              control={form.control}
              name="storeNameBn"
              render={({ field }) => (
                <FormItem>
                  <FormItem>
                    <FormLabel className="text-slate-700 dark:text-slate-300 font-semibold text-xs">Store Name (Bangla) *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. অ্যাপেল ওয়ার্ল্ড" className="rounded-xl font-medium" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
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
                  <FormControl>
                    <Input
                      placeholder="e.g. apple-world"
                      className="rounded-xl lowercase"
                      {...field}
                      onChange={(e) => {
                        const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-");
                        field.onChange(val);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Master Category selection */}
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
                  <p className="text-[10px] text-slate-400 mt-1">
                    Important: This sets the allowed category filter for this store. You will only be able to list products under this category branch. This choice cannot be changed once approved.
                  </p>
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
                      placeholder="Describe your store (hours, mission, policies, details...)"
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
            
            {/* Store Images Card */}
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
                  
                  {storeLogoImg ? (
                    <div className="flex flex-col items-center gap-2">
                      <Image
                        src={URL.createObjectURL(storeLogoImg)}
                        alt="Logo Preview"
                        width={64}
                        height={64}
                        className="rounded-xl object-cover aspect-square border"
                      />
                      <span className="text-xs text-slate-500 truncate max-w-[180px] font-semibold">{storeLogoImg.name}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-slate-400 dark:text-slate-500 text-center">
                      <UploadCloud size={28} className="text-[#1E60ED] mb-1" />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Upload Store Logo</span>
                      <span className="text-[10px] mt-0.5">Square size recommended (PNG/JPEG)</span>
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
                  
                  {storeBannerImg ? (
                    <div className="flex flex-col items-center gap-2 w-full h-full">
                      <div className="relative w-full h-20 rounded-xl overflow-hidden border">
                        <Image
                          src={URL.createObjectURL(storeBannerImg)}
                          alt="Banner Preview"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <span className="text-xs text-slate-500 truncate max-w-[200px] font-semibold">{storeBannerImg.name}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-slate-400 dark:text-slate-500 text-center">
                      <ImageIcon size={28} className="text-[#1E60ED] mb-1" />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Upload Store Banner</span>
                      <span className="text-[10px] mt-0.5">Landscape aspect ratio (16:9 or similar)</span>
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

              {/* Contact Info Group */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 dark:text-slate-300 font-semibold text-xs">Phone *</FormLabel>
                      <FormControl>
                        <Input placeholder="Store Phone" className="rounded-xl" {...field} />
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
                        <Input placeholder="Store Email" className="rounded-xl" {...field} />
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
                      <Input placeholder="Street address, City, District" className="rounded-xl" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Social Channels */}
              <div className="space-y-4 pt-2">
                <FormField
                  control={form.control}
                  name="facebook"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 dark:text-slate-300 font-semibold text-xs">Facebook Page</FormLabel>
                      <FormControl>
                        <Input placeholder="https://facebook.com/yourbrand" className="rounded-xl text-xs" {...field} />
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
                      <FormLabel className="text-slate-700 dark:text-slate-300 font-semibold text-xs">Instagram Profile</FormLabel>
                      <FormControl>
                        <Input placeholder="https://instagram.com/yourbrand" className="rounded-xl text-xs" {...field} />
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
                      <FormLabel className="text-slate-700 dark:text-slate-300 font-semibold text-xs">X (Twitter) Profile</FormLabel>
                      <FormControl>
                        <Input placeholder="https://x.com/yourbrand" className="rounded-xl text-xs" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Operations */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.back()}
            className="rounded-2xl px-6 py-2.5 font-bold"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            className="bg-[#1E60ED] hover:bg-blue-600 active:bg-blue-700 text-white font-bold rounded-2xl px-8 py-2.5 transition-all shadow-md shadow-blue-500/10"
          >
            Register Store
          </Button>
        </div>
      </form>
      <Loader isOpen={loader} onClose={setLoader} title="Creating your storefront..." />
    </Form>
  );
}
