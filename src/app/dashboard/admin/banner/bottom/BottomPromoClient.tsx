"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { BannerFormSchema } from "../BannerFormSchema";
import { upsertSinglePromoBanner } from "../_action";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Percent,
  ExternalLink,
  Save,
  CheckCircle,
  XCircle,
  ChevronRight,
  Image as ImageIcon,
} from "lucide-react";
import ImageUpload from "@/components/ui/ImageUpload";

interface BottomPromoClientProps {
  initialBanner: any | null;
}

export default function BottomPromoClient({ initialBanner }: BottomPromoClientProps) {
  const [banner, setBanner] = useState<any | null>(initialBanner);
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof BannerFormSchema>>({
    resolver: zodResolver(BannerFormSchema),
    defaultValues: {
      title: banner?.title || "",
      imageUrl: banner?.imageUrl || "",
      link: banner?.link || "",
      type: "BottomPromo",
      status: banner?.status || "Active",
      order: 0,
    },
  });

  const onSubmit = async (values: z.infer<typeof BannerFormSchema>) => {
    setLoading(true);
    try {
      const result = await upsertSinglePromoBanner("BottomPromo", {
        title: values.title,
        imageUrl: values.imageUrl,
        link: values.link,
        status: values.status,
        order: 0,
      });

      if (result.success && result.data) {
        toast.success("Bottom Promo Banner saved successfully!");
        setBanner(result.data);
      } else {
        toast.error(result.error || "Failed to save Bottom Promo Banner");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const imageUrl = form.watch("imageUrl");
  const title = form.watch("title");
  const status = form.watch("status");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
      
      {/* Left side: Configuration Form (3 cols) */}
      <div className="lg:col-span-3 space-y-6">
        <div className="bg-card border p-6 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center gap-3 border-b pb-4">
            <div className="p-3 bg-primary/10 rounded-2xl text-primary">
              <Percent className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Bottom Banner Configuration</h3>
              <p className="text-xs text-muted-foreground">
                Configure the wide horizontal banner appearing directly underneath the homepage main section.
              </p>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-sm font-semibold">Banner Image (Wide Horizontal)</FormLabel>
                    <FormControl>
                      <ImageUpload
                        value={field.value}
                        onChange={field.onChange}
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">Internal Title / Label (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Mega Discount Offer Banner"
                        disabled={loading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="link"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">Redirect Link / URL (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. /promotions/sales or https://..."
                        disabled={loading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">Display Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end pt-4 border-t">
                <Button type="submit" disabled={loading} className="gap-2 rounded-xl px-6">
                  <Save className="h-4 w-4" />
                  {loading ? "Saving..." : "Save Configuration"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>

      {/* Right side: Live Preview Simulator (2 cols) */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-card border p-6 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-4">
            <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              Live Mockup Preview
            </h4>
            <div className="flex items-center gap-1.5 text-xs">
              {status === "Active" && imageUrl ? (
                <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" /> Live
                </span>
              ) : (
                <span className="bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <XCircle className="h-3 w-3" /> Offline
                </span>
              )}
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            This simulator simulates the wide horizontal aspect ratio of the bottom promo banner on the live homepage.
          </p>

          {/* Banner Simulator Card */}
          <div className="border rounded-xl p-2 bg-slate-50 dark:bg-slate-950">
            <div className="flex flex-col gap-2">
              {/* Main Shop Mockup */}
              <div className="h-[70px] bg-slate-200 dark:bg-slate-800 rounded-lg flex items-center justify-center border border-dashed border-slate-300">
                <span className="text-[10px] font-semibold text-muted-foreground">Homepage Content Section</span>
              </div>
              
              {/* Bottom Wide Banner Mockup */}
              <div className="relative rounded-lg overflow-hidden border border-blue-200 bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center h-[55px]">
                {imageUrl && status === "Active" ? (
                  <div className="relative w-full h-full group">
                    <img
                      src={imageUrl}
                      alt={title || "Bottom promo"}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 bg-primary text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                      <ChevronRight className="h-3 w-3" />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center p-2 text-center h-full w-full bg-slate-100 dark:bg-slate-850">
                    <ImageIcon className="h-5 w-5 text-muted-foreground mr-2 animate-bounce" />
                    <span className="text-[9px] font-bold text-muted-foreground leading-tight">
                      Bottom Banner: No Image / Inactive
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Details list */}
          <div className="space-y-3 pt-3 border-t text-sm">
            <div className="flex justify-between py-1 border-b">
              <span className="text-muted-foreground">Internal Label:</span>
              <span className="font-semibold text-foreground truncate max-w-[200px]">
                {title || "Not configured"}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b">
              <span className="text-muted-foreground">Action URL:</span>
              <span className="font-semibold text-primary flex items-center gap-1 max-w-[200px] truncate">
                {form.watch("link") ? (
                  <>
                    <ExternalLink className="h-3 w-3" />
                    {form.watch("link")}
                  </>
                ) : (
                  "Static (None)"
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
