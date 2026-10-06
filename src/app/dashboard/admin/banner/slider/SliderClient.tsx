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
  ExternalLink,
  Eye,
  Sliders,
  CheckCircle,
  XCircle,
  MoveUp,
  MoveDown,
} from "lucide-react";
import ImageUpload from "@/components/ui/ImageUpload";
import Image from "next/image";

interface SliderClientProps {
  initialBanners: any[];
}

export default function SliderClient({ initialBanners }: SliderClientProps) {
  const [banners, setBanners] = useState<any[]>(initialBanners);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof BannerFormSchema>>({
    resolver: zodResolver(BannerFormSchema),
    defaultValues: {
      title: "",
      badge: "",
      discount: "",
      subtitle: "",
      imageUrl: "",
      link: "",
      type: "MainSlider",
      status: "Active",
      order: 0,
    },
  });

  // Open dialog for creating a banner
  const handleCreateOpen = () => {
    setEditingBanner(null);
    form.reset({
      title: "",
      badge: "",
      discount: "",
      subtitle: "",
      imageUrl: "",
      link: "",
      type: "MainSlider",
      status: "Active",
      order: banners.length > 0 ? Math.max(...banners.map((b) => b.order || 0)) + 1 : 0,
    });
    setIsDialogOpen(true);
  };

  // Open dialog for editing a banner
  const handleEditOpen = (banner: any) => {
    setEditingBanner(banner);
    form.reset({
      title: banner.title || "",
      badge: banner.badge || "",
      discount: banner.discount || "",
      subtitle: banner.subtitle || "",
      imageUrl: banner.imageUrl || "",
      link: banner.link || "",
      type: "MainSlider",
      status: banner.status || "Active",
      order: banner.order || 0,
    });
    setIsDialogOpen(true);
  };

  const onSubmit = async (values: z.infer<typeof BannerFormSchema>) => {
    setLoading(true);
    try {
      if (editingBanner) {
        // Edit existing banner
        const result = await updateBanner(editingBanner.id, values);
        if (result.success && result.data) {
          toast.success("Slider banner updated successfully!");
          setBanners(
            banners.map((b) => (b.id === editingBanner.id ? result.data : b))
          );
          setIsDialogOpen(false);
        } else {
          toast.error(result.error || "Failed to update slider banner");
        }
      } else {
        // Create new banner
        const result = await createBanner(values);
        if (result.success && result.data) {
          toast.success("Slider banner created successfully!");
          setBanners([...banners, result.data].sort((a, b) => (a.order || 0) - (b.order || 0)));
          setIsDialogOpen(false);
        } else {
          toast.error(result.error || "Failed to create slider banner");
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
    if (!confirm("Are you sure you want to delete this slider banner?")) return;

    try {
      const result = await handleDelete(id);
      if (result.success) {
        toast.success("Slider banner deleted successfully!");
        setBanners(banners.filter((b) => b.id !== id));
      } else {
        toast.error(result.error || "Failed to delete slider banner");
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
        badge: banner.badge || "",
        discount: banner.discount || "",
        subtitle: banner.subtitle || "",
        imageUrl: banner.imageUrl,
        link: banner.link || "",
        type: banner.type,
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

  return (
    <div className="space-y-6">
      {/* Overview stats & action */}
      <div className="flex items-center justify-between bg-card p-6 rounded-2xl border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-2xl text-primary">
            <Sliders className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold tracking-tight">Main Sliders</h3>
            <p className="text-sm text-muted-foreground">
              Total slides uploaded: <span className="font-semibold text-foreground">{banners.length}</span> ({banners.filter(b => b.status === "Active").length} active)
            </p>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreateOpen} className="gap-2 rounded-xl">
              <Plus className="h-4 w-4" /> Add Slide
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingBanner ? "Edit Slider Banner" : "Add Slider Banner"}
              </DialogTitle>
              <DialogDescription>
                Fill out the fields to {editingBanner ? "edit" : "create"} a slider banner.
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-sm font-semibold">Slide Image</FormLabel>
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="badge"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold">Badge Text (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. 80% DISCOUNT ONLY THIS SUMMER"
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
                    name="discount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold">Discount Rate (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. 90%"
                            disabled={loading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold">Main Heading / Title (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. SUPER DISCOUNT"
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
                        <FormLabel className="text-sm font-semibold">Subtitle (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. THIS SUMMER ONLY"
                            disabled={loading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="link"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold">Redirect Link / URL (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. /products?category=fashion or https://..."
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
                    {loading ? "Saving..." : "Save Banner"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Grid of existing slides */}
      {banners.length === 0 ? (
        <div className="text-center p-12 bg-card border rounded-2xl flex flex-col items-center justify-center gap-4">
          <Sliders className="h-12 w-12 text-muted-foreground animate-pulse" />
          <h4 className="font-bold text-lg">No slides created yet</h4>
          <p className="text-sm text-muted-foreground max-w-sm">
            Add your first slider banner to begin displaying dynamic promotional banners on the homepage slider.
          </p>
          <Button onClick={handleCreateOpen} className="gap-2 rounded-xl">
            <Plus className="h-4 w-4" /> Add Slide
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {banners.map((banner) => (
            <div
              key={banner.id}
              className="group bg-card border rounded-2xl overflow-hidden flex flex-col shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/30"
            >
              {/* Aspect Ratio Box with Preview */}
              <div className="relative w-full h-[180px] bg-slate-100 dark:bg-slate-900 border-b overflow-hidden flex items-center justify-center">
                <img
                  src={banner.imageUrl}
                  alt={banner.title || "Banner slide"}
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                />

                {/* Badges on preview */}
                <div className="absolute top-3 left-3 flex gap-1.5">
                  <span className="bg-black/75 text-white font-semibold text-[10px] px-2.5 py-1 rounded-full flex items-center gap-1.5">
                    Order: {banner.order}
                  </span>
                  <button
                    onClick={() => toggleStatus(banner)}
                    className={`font-semibold text-[10px] px-2.5 py-1 rounded-full flex items-center gap-1 transition-all shadow-sm ${
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
                </div>
              </div>

              {/* Slider Info */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {banner.badge && (
                      <span className="bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 font-extrabold text-[9px] px-2 py-0.5 rounded border border-rose-200 dark:border-rose-800">
                        {banner.badge}
                      </span>
                    )}
                    {banner.discount && (
                      <span className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold text-[10px] px-2 py-0.5 rounded border border-amber-200">
                        {banner.discount} OFF
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-base truncate">
                    {banner.title || "Untitled Slide"}
                  </h4>
                  {banner.subtitle && (
                    <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate">
                      {banner.subtitle}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                    <ExternalLink className="h-3 w-3" />
                    {banner.link ? (
                      <a href={banner.link} target="_blank" className="hover:underline hover:text-primary">
                        {banner.link}
                      </a>
                    ) : (
                      "No redirection link"
                    )}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t pt-4 mt-4">
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                    Last modified: {new Date(banner.updatedAt).toLocaleDateString()}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEditOpen(banner)}
                      className="h-8 w-8 hover:text-primary hover:border-primary/50"
                      title="Edit slide"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => onDelete(banner.id)}
                      className="h-8 w-8"
                      title="Delete slide"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
