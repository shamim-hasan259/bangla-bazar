"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, UploadCloud, Trash2, ChevronRight, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import Loader from "@/components/ui/Loader";
import { CategoryFormSchema } from "../CategoryFormSchema";
import { saveCategory } from "../_action";

interface CategoryItem {
  id: string;
  name: string;
  code: string;
  parentId: string | null;
}

interface CreateCategoryFormProps {
  masterCategories: CategoryItem[];
}

export default function CreateCategoryForm({ masterCategories }: CreateCategoryFormProps) {
  const router = useRouter();
  const [loader, setLoader] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Selections at each level
  const [sel1, setSel1] = useState<CategoryItem | null>(null);
  const [sel2, setSel2] = useState<CategoryItem | null>(null);
  const [sel3, setSel3] = useState<CategoryItem | null>(null);
  const [sel4, setSel4] = useState<CategoryItem | null>(null);

  // Search/Filter queries for each level
  const [q1, setQ1] = useState("");
  const [q2, setQ2] = useState("");
  const [q3, setQ3] = useState("");
  const [q4, setQ4] = useState("");

  const level1Cats = masterCategories.filter((c) => c.parentId === null);
  const level2Cats = sel1 ? masterCategories.filter((c) => c.parentId === sel1.id) : [];
  const level3Cats = sel2 ? masterCategories.filter((c) => c.parentId === sel2.id) : [];
  const level4Cats = sel3 ? masterCategories.filter((c) => c.parentId === sel3.id) : [];

  const filteredL1 = level1Cats.filter((c) => c.name.toLowerCase().includes(q1.toLowerCase()));
  const filteredL2 = level2Cats.filter((c) => c.name.toLowerCase().includes(q2.toLowerCase()));
  const filteredL3 = level3Cats.filter((c) => c.name.toLowerCase().includes(q3.toLowerCase()));
  const filteredL4 = level4Cats.filter((c) => c.name.toLowerCase().includes(q4.toLowerCase()));

  const hasChildren = (catId: string) => {
    return masterCategories.some((c) => c.parentId === catId);
  };

  const getSelectedPathString = () => {
    const parts = [sel1?.name, sel2?.name, sel3?.name, sel4?.name].filter(Boolean);
    return parts.length > 0 ? parts.join(" > ") : "";
  };

  const form = useForm<z.infer<typeof CategoryFormSchema>>({
    resolver: zodResolver(CategoryFormSchema),
    defaultValues: {
      name: "",
      description: "",
      code: "",
      photo: "",
      parentId: null,
      status: "Active",
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    }
  };

  const handleRemoveImage = () => {
    setFile(null);
    setPreviewUrl(null);
  };

  async function onSubmit(data: any) {
    try {
      setLoader(true);
      let photoName = "";

      if (file) {
        const uploadData = new FormData();
        uploadData.append("files", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: uploadData,
        });

        if (!res.ok) {
          throw new Error("Image upload failed");
        }

        const resData = await res.json();
        if (resData.success && resData.urls && resData.urls.length > 0) {
          photoName = resData.urls[0];
        } else {
          throw new Error(resData.message || "Image upload failed");
        }
      }

      const finalData = {
        ...data,
        photo: photoName,
      };

      const category = await saveCategory(finalData);
      if (category) {
        toast.success("Category created successfully!");
        router.push("/dashboard/admin/category");
        router.refresh();
      } else {
        toast.error("Failed to save category.");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Something went wrong.");
    } finally {
      setLoader(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/admin/category">
          <Button variant="outline" size="icon" className="rounded-xl h-10 w-10 border-slate-200/60 dark:border-slate-800/60 bg-white hover:bg-slate-50 shadow-sm animate-fade-in">
            <ArrowLeft className="h-4 w-4 text-slate-600" />
          </Button>
        </Link>
        <div className="flex flex-col">
          <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Create New Category</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Add a new category to group and classify your store products.</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 p-6 rounded-2xl shadow-sm">
          <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">Category Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {/* Category Name */}
            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-slate-700 dark:text-slate-300">Category Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter category name (e.g. Electronics)" className="rounded-xl focus-visible:ring-[#2563eb] focus-visible:border-[#2563eb]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Status */}
            <div>
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-slate-700 dark:text-slate-300">Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="rounded-xl focus-visible:ring-[#2563eb] focus-visible:border-[#2563eb]">
                          <SelectValue placeholder="Active" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-xl border-slate-200/80 dark:border-slate-800/80 shadow-md">
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Category Image Upload */}
          <div className="space-y-2">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Category Image</span>
            <div className="space-y-4 max-w-md">
              {previewUrl ? (
                <div className="relative rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800/80 aspect-video bg-slate-50 flex items-center justify-center group shadow-sm transition-all duration-300">
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={handleRemoveImage}
                      className="rounded-full shadow-md hover:scale-105 transition-transform"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="relative rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-[#2563eb] dark:hover:border-[#2563eb] transition-colors aspect-[3/1] flex flex-col items-center justify-center p-4 bg-slate-50/50 dark:bg-slate-950/20 text-center cursor-pointer group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-slate-100 dark:bg-slate-850 p-2.5 text-slate-500 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                      <UploadCloud className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Drag & drop or Click to upload</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">Supports PNG, JPG, JPEG up to 5MB</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Visual Multi-column Parent Category Browser */}
          <FormField
            control={form.control}
            name="parentId"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="font-semibold text-slate-700 dark:text-slate-300">
                  Parent Category Selector (Visual Hierarchy)
                </FormLabel>
                <FormControl>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[350px] border border-slate-200 dark:border-slate-800 rounded-2xl p-3 bg-slate-50/50">
                    {/* Column 1 */}
                    <div className="flex flex-col bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-xl overflow-hidden shadow-sm">
                      <div className="p-2 border-b border-slate-100 dark:border-slate-800 relative">
                        <Search className="absolute left-4 top-3 text-slate-400" size={12} />
                        <input
                          type="text"
                          placeholder="Filter..."
                          value={q1}
                          onChange={(e) => setQ1(e.target.value)}
                          className="w-full pl-7 pr-2 py-1 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-md focus:outline-none focus:border-blue-500 focus:bg-white"
                        />
                      </div>
                      <div className="flex-1 overflow-y-auto custom-scrollbar p-1 space-y-0.5">
                        {filteredL1.length === 0 ? (
                          <div className="p-3 text-center text-xs text-slate-400">No categories</div>
                        ) : (
                          filteredL1.map((cat) => {
                            const isSelected = sel1?.id === cat.id;
                            const hasSub = hasChildren(cat.id);
                            return (
                              <button
                                key={cat.id}
                                type="button"
                                onClick={() => {
                                  setSel1(cat);
                                  setSel2(null);
                                  setSel3(null);
                                  setSel4(null);
                                  field.onChange(cat.id);
                                }}
                                className={cn(
                                  "w-full text-left px-2 py-1.5 text-xs font-normal rounded-md transition flex items-center justify-between",
                                  isSelected
                                    ? "bg-[#2563eb] text-white font-semibold shadow-sm"
                                    : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900"
                                )}
                              >
                                <span className="truncate">{cat.name}</span>
                                {hasSub && <ChevronRight size={12} className={cn(isSelected ? "text-white" : "text-slate-400", "shrink-0 ml-1")} />}
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>

                    {/* Column 2 */}
                    <div className="flex flex-col bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-xl overflow-hidden shadow-sm">
                      <div className="p-2 border-b border-slate-100 dark:border-slate-800 relative">
                        <Search className="absolute left-4 top-3 text-slate-400" size={12} />
                        <input
                          type="text"
                          placeholder="Filter..."
                          value={q2}
                          onChange={(e) => setQ2(e.target.value)}
                          disabled={!sel1}
                          className="w-full pl-7 pr-2 py-1 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-md focus:outline-none focus:border-blue-500 focus:bg-white disabled:opacity-50"
                        />
                      </div>
                      <div className="flex-1 overflow-y-auto custom-scrollbar p-1 space-y-0.5">
                        {!sel1 ? (
                          <div className="p-3 text-center text-xs text-slate-300 dark:text-slate-700">Select parent category</div>
                        ) : filteredL2.length === 0 ? (
                          <div className="p-3 text-center text-xs text-slate-400">No subcategories</div>
                        ) : (
                          filteredL2.map((cat) => {
                            const isSelected = sel2?.id === cat.id;
                            const hasSub = hasChildren(cat.id);
                            return (
                              <button
                                key={cat.id}
                                type="button"
                                onClick={() => {
                                  setSel2(cat);
                                  setSel3(null);
                                  setSel4(null);
                                  field.onChange(cat.id);
                                }}
                                className={cn(
                                  "w-full text-left px-2 py-1.5 text-xs font-normal rounded-md transition flex items-center justify-between",
                                  isSelected
                                    ? "bg-[#2563eb] text-white font-semibold shadow-sm"
                                    : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900"
                                )}
                              >
                                <span className="truncate">{cat.name}</span>
                                {hasSub && <ChevronRight size={12} className={cn(isSelected ? "text-white" : "text-slate-400", "shrink-0 ml-1")} />}
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>

                    {/* Column 3 */}
                    <div className="flex flex-col bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-xl overflow-hidden shadow-sm">
                      <div className="p-2 border-b border-slate-100 dark:border-slate-800 relative">
                        <Search className="absolute left-4 top-3 text-slate-400" size={12} />
                        <input
                          type="text"
                          placeholder="Filter..."
                          value={q3}
                          onChange={(e) => setQ3(e.target.value)}
                          disabled={!sel2}
                          className="w-full pl-7 pr-2 py-1 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-md focus:outline-none focus:border-blue-500 focus:bg-white disabled:opacity-50"
                        />
                      </div>
                      <div className="flex-1 overflow-y-auto custom-scrollbar p-1 space-y-0.5">
                        {!sel2 ? (
                          <div className="p-3 text-center text-xs text-slate-300 dark:text-slate-700">Select parent category</div>
                        ) : filteredL3.length === 0 ? (
                          <div className="p-3 text-center text-xs text-slate-400">No subcategories</div>
                        ) : (
                          filteredL3.map((cat) => {
                            const isSelected = sel3?.id === cat.id;
                            const hasSub = hasChildren(cat.id);
                            return (
                              <button
                                key={cat.id}
                                type="button"
                                onClick={() => {
                                  setSel3(cat);
                                  setSel4(null);
                                  field.onChange(cat.id);
                                }}
                                className={cn(
                                  "w-full text-left px-2 py-1.5 text-xs font-normal rounded-md transition flex items-center justify-between",
                                  isSelected
                                    ? "bg-[#2563eb] text-white font-semibold shadow-sm"
                                    : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900"
                                )}
                              >
                                <span className="truncate">{cat.name}</span>
                                {hasSub && <ChevronRight size={12} className={cn(isSelected ? "text-white" : "text-slate-400", "shrink-0 ml-1")} />}
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>

                    {/* Column 4 */}
                    <div className="flex flex-col bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-xl overflow-hidden shadow-sm">
                      <div className="p-2 border-b border-slate-100 dark:border-slate-800 relative">
                        <Search className="absolute left-4 top-3 text-slate-400" size={12} />
                        <input
                          type="text"
                          placeholder="Filter..."
                          value={q4}
                          onChange={(e) => setQ4(e.target.value)}
                          disabled={!sel3}
                          className="w-full pl-7 pr-2 py-1 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-md focus:outline-none focus:border-blue-500 focus:bg-white disabled:opacity-50"
                        />
                      </div>
                      <div className="flex-1 overflow-y-auto custom-scrollbar p-1 space-y-0.5">
                        {!sel3 ? (
                          <div className="p-3 text-center text-xs text-slate-300 dark:text-slate-700">Select parent category</div>
                        ) : filteredL4.length === 0 ? (
                          <div className="p-3 text-center text-xs text-slate-400">No subcategories</div>
                        ) : (
                          filteredL4.map((cat) => {
                            const isSelected = sel4?.id === cat.id;
                            const hasSub = hasChildren(cat.id);
                            return (
                              <button
                                key={cat.id}
                                type="button"
                                onClick={() => {
                                  setSel4(cat);
                                  field.onChange(cat.id);
                                }}
                                className={cn(
                                  "w-full text-left px-2 py-1.5 text-xs font-normal rounded-md transition flex items-center justify-between",
                                  isSelected
                                    ? "bg-[#2563eb] text-white font-semibold shadow-sm"
                                    : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900"
                                )}
                              >
                                <span className="truncate">{cat.name}</span>
                                {hasSub && <ChevronRight size={12} className={cn(isSelected ? "text-white" : "text-slate-400", "shrink-0 ml-1")} />}
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                </FormControl>

                {/* Status Indicator & Reset */}
                <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 mt-2">
                  <div>
                    <span className="font-semibold text-slate-600 dark:text-slate-400">Selected Parent: </span>
                    {getSelectedPathString() ? (
                      <span className="text-[#2563eb] font-semibold bg-[#2563eb]/5 px-2.5 py-1 rounded-lg border border-[#2563eb]/20 inline-block font-mono">
                        {getSelectedPathString()}
                      </span>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-500 italic">None (Will be created as a top-level Main Category)</span>
                    )}
                  </div>
                  {getSelectedPathString() && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setSel1(null);
                        setSel2(null);
                        setSel3(null);
                        setSel4(null);
                        field.onChange(null);
                      }}
                      className="text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 px-2 h-7"
                    >
                      Reset to Main Category
                    </Button>
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-850">
            <Link href="/dashboard/admin/category">
              <Button type="button" variant="outline" className="rounded-xl">Cancel</Button>
            </Link>
            <Button type="submit" className="rounded-xl bg-[#2563eb] hover:bg-blue-700 text-white font-bold px-6 shadow-md transition-colors">
              Save Category
            </Button>
          </div>

        </form>
      </Form>

      <Toaster />
      <Loader isOpen={loader} onClose={setLoader} title="Creating Category..." />

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 9999px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
}
