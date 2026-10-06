"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { BannerFormSchema } from "../BannerFormSchema";
import { createBanner, updateBanner, handleDelete } from "../_action";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  Edit2,
  Layers,
  CheckCircle,
  XCircle,
  Image as ImageIcon,
} from "lucide-react";
import ImageUpload from "@/components/ui/ImageUpload";

interface RightPromoClientProps {
  initialBanners: any[];
}

export default function RightPromoClient({ initialBanners }: RightPromoClientProps) {
  const [banners, setBanners] = useState<any[]>(initialBanners);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof BannerFormSchema>>({
    resolver: zodResolver(BannerFormSchema),
    defaultValues: {
      title: "",
      subtitle: "",
      imageUrl: "",
      link: "",
      type: "RightPromo",
      status: "Active",
      order: 0,
    },
  });

  const handleCreateOpen = () => {
    setEditingBanner(null);
    form.reset({
      title: "",
      subtitle: "",
      imageUrl: "",
      link: "",
      type: "RightPromo",
      status: "Active",
      order: banners.length > 0 ? Math.max(...banners.map((b) => b.order || 0)) + 1 : 0,
    });
    setIsDialogOpen(true);
  };

  const handleEditOpen = (banner: any) => {
    setEditingBanner(banner);
    form.reset({
      title: banner.title || "",
      subtitle: banner.subtitle || "",
      imageUrl: banner.imageUrl || "",
      link: banner.link || "",
      type: "RightPromo",
      status: banner.status || "Active",
      order: banner.order || 0,
    });
    setIsDialogOpen(true);
  };

  const onSubmit = async (values: z.infer<typeof BannerFormSchema>) => {
    setLoading(true);
    try {
      if (editingBanner) {
        const result = await updateBanner(editingBanner.id, {
          ...values,
          type: "RightPromo",
        });
        if (result.success && result.data) {
          toast.success("Right promo banner updated successfully!");
          setBanners(
            banners.map((b) => (b.id === editingBanner.id ? result.data : b))
          );
          setIsDialogOpen(false);
        } else {
          toast.error(result.error || "Failed to update banner");
        }
      } else {
        const result = await createBanner({
          ...values,
          type: "RightPromo",
        });
        if (result.success && result.data) {
          toast.success("Right promo banner created successfully!");
          setBanners([...banners, result.data].sort((a, b) => (a.order || 0) - (b.order || 0)));
          setIsDialogOpen(false);
        } else {
          toast.error(result.error || "Failed to create banner");
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this promo banner?")) return;

    try {
      const result = await handleDelete(id);
      if (result.success) {
        toast.success("Promo banner deleted successfully!");
        setBanners(banners.filter((b) => b.id !== id));
      } else {
        toast.error(result.error || "Failed to delete banner");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete banner");
    }
  };

  const toggleStatus = async (banner: any) => {
    const nextStatus = banner.status === "Active" ? "Inactive" : "Active";
    try {
      const result = await updateBanner(banner.id, {
        title: banner.title || "",
        subtitle: banner.subtitle || "",
        imageUrl: banner.imageUrl,
        link: banner.link || "",
        type: "RightPromo",
        status: nextStatus,
        order: banner.order || 0,
      });

      if (result.success && result.data) {
        toast.success(`Banner status updated to ${nextStatus}!`);
        setBanners(banners.map((b) => (b.id === banner.id ? result.data : b)));
      } else {
        toast.error(result.error || "Failed to toggle status");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to toggle status");
    }
  };

  const activeBanners = banners.filter((b) => b.status === "Active");

  return (
    <div className="space-y-8">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-6 rounded-2xl border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-2xl text-primary">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold tracking-tight">Right Promo Cards (Hero 3-Card Stack)</h3>
            <p className="text-sm text-muted-foreground">
              Total cards: <span className="font-semibold text-foreground">{banners.length}</span> ({activeBanners.length} active) &bull; Displayed directly on the right side of the main homepage slider.
            </p>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreateOpen} className="gap-2 rounded-xl">
              <Plus className="h-4 w-4" /> Add Promo Card
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingBanner ? "Edit Right Promo Card" : "Add Right Promo Card"}
              </DialogTitle>
              <DialogDescription>
                Fill out the details to {editingBanner ? "update" : "create"} a promotional card for the right stack.
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-sm font-semibold">Card Product Image</FormLabel>
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
                      <FormLabel className="text-sm font-semibold">Title (e.g. SONY TELEVISION)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. SONY TELEVISION"
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
                  name="subtitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold">Subtitle / Price (e.g. Start from ৳2,999)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Start from ৳2,999"
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
                      <FormLabel className="text-sm font-semibold">Redirect Link / URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. /products?category=electronics"
                          disabled={loading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="order"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold">Display Order</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            disabled={loading}
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
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
                        <FormLabel className="text-sm font-semibold">Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
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
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    disabled={loading}
                    className="rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading} className="rounded-xl">
                    {loading ? "Saving..." : "Save Card"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Main Grid: Card List (3 cols) + Live Preview Simulator (2 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Left Side: Cards list */}
        <div className="lg:col-span-3 space-y-4">
          <h4 className="font-bold text-sm text-muted-foreground uppercase tracking-wider">
            Configured Promo Cards ({banners.length})
          </h4>

          {banners.length === 0 ? (
            <div className="text-center p-12 bg-card border rounded-2xl flex flex-col items-center justify-center gap-4">
              <ImageIcon className="h-12 w-12 text-muted-foreground animate-pulse" />
              <h4 className="font-bold text-lg">No promo cards created yet</h4>
              <p className="text-sm text-muted-foreground max-w-sm">
                Add your promo cards to customize the 3 cards appearing on the right side of the homepage hero slider.
              </p>
              <Button onClick={handleCreateOpen} className="gap-2 rounded-xl">
                <Plus className="h-4 w-4" /> Add Promo Card
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {banners.map((banner, idx) => {
                const bg =
                  idx % 3 === 0
                    ? "bg-[#e11d48]"
                    : idx % 3 === 1
                    ? "bg-[#1e293b]"
                    : "bg-[#eab308]";

                return (
                  <div
                    key={banner.id}
                    className="bg-card border rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    {/* Visual Card Preview Mini */}
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div
                        className={`w-20 h-16 rounded-xl shrink-0 p-2 flex items-center justify-center ${bg} text-white shadow-xs overflow-hidden relative`}
                      >
                        {banner.imageUrl ? (
                          <img
                            src={banner.imageUrl}
                            alt={banner.title || "Card"}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <ImageIcon className="h-6 w-6 opacity-60" />
                        )}
                      </div>

                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h5 className="font-bold text-sm truncate text-foreground">
                            {banner.title || "Untitled Card"}
                          </h5>
                          <span className="bg-slate-100 dark:bg-slate-800 text-[10px] font-bold px-2 py-0.5 rounded-full text-muted-foreground">
                            Order: {banner.order}
                          </span>
                        </div>
                        {banner.subtitle && (
                          <p className="text-xs text-muted-foreground font-medium truncate">
                            {banner.subtitle}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-3 sm:pt-0">
                      <button
                        onClick={() => toggleStatus(banner)}
                        className={`font-semibold text-xs px-2.5 py-1 rounded-full flex items-center gap-1 transition-all cursor-pointer shadow-xs ${
                          banner.status === "Active"
                            ? "bg-emerald-500 text-white hover:bg-emerald-600"
                            : "bg-amber-500 text-white hover:bg-amber-600"
                        }`}
                      >
                        {banner.status === "Active" ? (
                          <>
                            <CheckCircle className="h-3 w-3" /> Active
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3" /> Inactive
                          </>
                        )}
                      </button>

                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEditOpen(banner)}
                        className="h-8 w-8 hover:text-primary hover:border-primary/50"
                        title="Edit card"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => onDelete(banner.id)}
                        className="h-8 w-8"
                        title="Delete card"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Side: Live Mockup Simulator (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-card border p-6 rounded-2xl shadow-sm space-y-4 sticky top-6">
            <div className="flex items-center justify-between border-b pb-4">
              <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                Live Homepage Simulator
              </h4>
              <span className="text-xs bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full">
                {activeBanners.length} Active in Stack
              </span>
            </div>

            <p className="text-xs text-muted-foreground">
              This preview shows how your promo cards are stacked beside the hero slider on the homepage.
            </p>

            {/* Mockup Container */}
            <div className="border rounded-2xl p-3 bg-slate-50 dark:bg-slate-950 space-y-3">
              <div className="grid grid-cols-12 gap-2 h-[260px]">
                {/* Simulated Center Slider (7 cols) */}
                <div className="col-span-7 bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-3 flex flex-col justify-between text-white border border-slate-700">
                  <div className="space-y-1">
                    <span className="bg-rose-600 text-[8px] font-black px-1.5 py-0.5 rounded uppercase">
                      Featured
                    </span>
                    <h6 className="text-[11px] font-black leading-tight">MAIN HERO SLIDER</h6>
                    <p className="text-[9px] text-slate-300">Auto-playing slides</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="bg-white text-slate-900 text-[8px] font-extrabold px-2 py-1 rounded">
                      SHOP NOW
                    </span>
                    <div className="flex gap-1">
                      <div className="w-1 h-1 rounded-full bg-white"></div>
                      <div className="w-1 h-1 rounded-full bg-white/40"></div>
                      <div className="w-1 h-1 rounded-full bg-white/40"></div>
                    </div>
                  </div>
                </div>

                {/* Simulated Right Promo Stack (5 cols) */}
                <div className="col-span-5 flex flex-col justify-between gap-1.5 h-full">
                  {activeBanners.length === 0 ? (
                    <div className="h-full bg-slate-200 dark:bg-slate-800 rounded-xl flex flex-col items-center justify-center p-2 text-center border border-dashed">
                      <ImageIcon className="h-5 w-5 text-muted-foreground mb-1" />
                      <span className="text-[9px] font-semibold text-muted-foreground">
                        No active promo cards (Using fallback)
                      </span>
                    </div>
                  ) : (
                    activeBanners.slice(0, 3).map((b, idx) => {
                      const bg =
                        idx % 3 === 0
                          ? "bg-[#e11d48] text-white"
                          : idx % 3 === 1
                          ? "bg-[#1e293b] text-white"
                          : "bg-[#eab308] text-slate-950";

                      return (
                        <div
                          key={b.id || idx}
                          className={`${bg} rounded-lg p-2 flex items-center justify-between overflow-hidden shadow-xs flex-1`}
                        >
                          <div className="space-y-0.5 min-w-0 pr-1">
                            <p className="text-[8px] font-black uppercase truncate">
                              {b.title || "Promo Title"}
                            </p>
                            <p className="text-[7px] opacity-80 truncate">
                              {b.subtitle || "Start from ৳..."}
                            </p>
                            <span className="inline-block text-[7px] font-bold bg-white/20 px-1.5 py-0.5 rounded mt-0.5">
                              Shop
                            </span>
                          </div>
                          <div className="w-8 h-8 shrink-0 flex items-center justify-center">
                            {b.imageUrl ? (
                              <img
                                src={b.imageUrl}
                                alt="Promo"
                                className="w-full h-full object-contain drop-shadow-xs"
                              />
                            ) : (
                              <ImageIcon className="h-4 w-4 opacity-50" />
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            <div className="pt-2 text-xs text-muted-foreground flex items-center justify-between">
              <span>Ordering by: Order Ascending</span>
              <span className="font-semibold text-foreground">Auto-updates on Homepage</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

