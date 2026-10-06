"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  Cross,
  Image as ImageIcon,
  Search,
  Video,
  VideoIcon,
  Plus,
  Trash2,
  HelpCircle,
  ArrowLeft,
  X,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
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
import { Switch } from "@/components/ui/switch";
import { Toaster } from "@/components/ui/sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import SelectBrand from "@/components/ui/SelectBrand";
import SelectUnit from "@/components/ui/SelectUnit";
import { ProductFormSchema } from "../create/ProductFormSchema";
import { saveProduct, optimizeTitleAction, generateDescriptionAndHighlightsAction } from "../_action";
import { getUnitDw } from "../create/_action";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import Loader from "@/components/ui/Loader";
import CategorySelectorModal from "./CategorySelectorModal";
import RichTextEditor from "./RichTextEditor";
import Image from "next/image";
import Link from "next/link";

interface ProductFormProps {
  entry: any;
  title?: string;
  storeId?: string;
  restrictMasterCategoryId?: string;
}

const ProductForm = ({ entry, title, storeId, restrictMasterCategoryId }: ProductFormProps) => {
  const [id, setId] = useState<string>("");
  const [brandId, setBrandId] = useState<string>("");
  const [unitOptions, setUnitOptions] = useState<any>([
    { value: "", label: "Select Unit" },
  ]);

  const [loader, setLoader] = useState(false);
  const loaderClose = () => setLoader(false);
  const loaderShow = () => setLoader(true);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // AI State Variables
  const [titleOptimizing, setTitleOptimizing] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiKeywords, setAiKeywords] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiResult, setAiResult] = useState<{ description: string; highlights: string } | null>(null);
  const [bgRemovingUrls, setBgRemovingUrls] = useState<string[]>([]);

  // Category selection state
  const [showCategorySelector, setShowCategorySelector] = useState(!entry?.id);
  const [selectedCategoryPath, setSelectedCategoryPath] = useState("");

  // Variants state
  const [hasVariants, setHasVariants] = useState(false);
  const [sizes, setSizes] = useState<string[]>([]);
  const [newSizeInput, setNewSizeInput] = useState("");
  const [colors, setColors] = useState<string[]>([]);
  const [newColorInput, setNewColorInput] = useState("");
  const [variantData, setVariantData] = useState<any[]>([]);

  // Shipping & Warranty states
  const [dimensions, setDimensions] = useState({
    length: "",
    width: "",
    height: "",
  });
  const [dangerousGoods, setDangerousGoods] = useState("None");

  const router = useRouter();
  const searchParams = useSearchParams();
  const viewOnly = searchParams?.get("view") === "true";

  const form = useForm<z.infer<typeof ProductFormSchema>>({
    resolver: zodResolver(ProductFormSchema),
    defaultValues: {
      name: "",
      categoryId: "",
      masterCategoryId: "",
      storeId: "",
      photo: "",
      video: "",
      ytVideoLink: "",
      model: "",
      brandId: "",
      supplierId: "",
      color: "",
      picsInPackage: "" as any,
      weight: "" as any,
      unitId: "",
      salesType: "Standerd",
      hsCode: "",
      featured: "false",
      website: "true",
      price: "" as any,
      mrp: "" as any,
      tp: "" as any,
      vat: "" as any,
      stock: "" as any,
      promoPrice: "" as any,
      description: "",
      highlight: "",
    },
  });

  useEffect(() => {
    if (storeId) {
      form.setValue("storeId", storeId);
    }
  }, [storeId, form]);

  // Resolve Category Path for display
  useEffect(() => {
    async function loadCategoryPath() {
      if (entry?.categoryId) {
        try {
          const { fetchAllCategories } = await import("../_action");
          const allCats = await fetchAllCategories();
          const leaf = allCats.find((c) => c.id === entry.categoryId);
          if (leaf) {
            const path: string[] = [leaf.name];
            let curr = leaf;
            while (curr.parentId) {
              const parent = allCats.find((c) => c.id === curr.parentId);
              if (parent) {
                path.unshift(parent.name);
                curr = parent;
              } else {
                break;
              }
            }
            setSelectedCategoryPath(path.join(" > "));
          }
        } catch (err) {
          console.error(err);
        }
      }
    }
    loadCategoryPath();
  }, [entry]);

  // Load entry values when editing
  useEffect(() => {
    if (entry?.id) {
      form.setValue("name", entry?.name || "");
      form.setValue("salesType", entry?.salesType || "Standerd");
      form.setValue("categoryId", entry?.categoryId || "");
      form.setValue("masterCategoryId", entry?.masterCategoryId || "");
      form.setValue("storeId", entry?.storeId || "");
      form.setValue("brandId", entry?.brandId || "");
      form.setValue("model", entry?.model || "");
      form.setValue("unitId", entry?.unitId || "");
      form.setValue("vat", entry?.vat !== undefined && entry?.vat !== null ? entry.vat : ("" as any));
      form.setValue("hsCode", entry?.hsCode || "");
      form.setValue("featured", entry?.featured || "false");
      form.setValue("website", entry?.website ? "true" : "false");
      form.setValue("description", entry?.description || "");
      form.setValue("price", entry?.price !== undefined && entry?.price !== null ? entry.price : ("" as any));
      form.setValue("promoPrice", entry?.promoPrice !== undefined && entry?.promoPrice !== null ? entry.promoPrice : ("" as any));
      form.setValue("photo", entry?.photo || "");
      form.setValue("mrp", entry?.mrp !== undefined && entry?.mrp !== null ? entry.mrp : ("" as any));
      form.setValue("tp", entry?.tp !== undefined && entry?.tp !== null ? entry.tp : ("" as any));
      form.setValue("color", entry?.color || "");
      form.setValue("picsInPackage", entry?.picsInPackage !== undefined && entry?.picsInPackage !== null ? entry.picsInPackage : ("" as any));
      form.setValue("weight", entry?.weight !== undefined && entry?.weight !== null ? entry.weight : ("" as any));
      form.setValue("stock", entry?.stock !== undefined && entry?.stock !== null ? entry.stock : ("" as any));
      form.setValue("highlight", entry?.highlight || "");
      setId(entry?.id);

      // Load image collection
      if (entry?.photo) {
        let urls: string[] = [];
        if (Array.isArray(entry.photo)) {
          entry.photo.forEach((p: any) => {
            if (typeof p === "string" && p.trim()) urls.push(p);
            else if (p && typeof p === "object" && p.productImg) urls.push(p.productImg);
          });
        } else if (typeof entry.photo === "string" && entry.photo.trim()) {
          urls.push(entry.photo);
        }
        setImagePreviews(urls);
      }

      // Load variants
      setHasVariants(entry.hasVariants || false);
      if (entry.variantsList && entry.variantsList.length > 0) {
        const mappedVariants = entry.variantsList.map((v: any) => ({
          id: v.id,
          color: v.color || "",
          size: v.size || "",
          optionValue: v.color && v.size ? `${v.color} / ${v.size}` : (v.color || v.size || ""),
          price: v.price?.toString() || "",
          specialPrice: v.specialPrice?.toString() || "",
          mrp: v.mrp?.toString() || "",
          costPrice: v.costPrice?.toString() || "",
          stock: v.stock?.toString() || "",
          sku: v.sku || "",
          barcode: v.barcode || "",
          images: v.images || [],
          availability: v.availability !== false,
        }));
        setVariantData(mappedVariants);

        const loadedColors = new Set<string>();
        const loadedSizes = new Set<string>();
        mappedVariants.forEach((row: any) => {
          if (row.color) loadedColors.add(row.color);
          if (row.size) loadedSizes.add(row.size);
        });
        setColors(Array.from(loadedColors));
        setSizes(Array.from(loadedSizes));
      } else if (entry.variants) {
        const v = typeof entry.variants === "string" ? JSON.parse(entry.variants) : entry.variants;
        const loadedData = v.data || [];
        setVariantData(loadedData);

        const loadedColors = new Set<string>();
        const loadedSizes = new Set<string>();
        loadedData.forEach((row: any) => {
          if (row.color) loadedColors.add(row.color);
          if (row.size) loadedSizes.add(row.size);

          if (!row.color && !row.size && row.optionValue) {
            const parts = row.optionValue.split(/[/,-]+/).map((s: string) => s.trim());
            if (parts.length >= 2) {
              loadedColors.add(parts[0]);
              loadedSizes.add(parts[1]);
            } else if (parts.length === 1) {
              if ((row.variantName || v.name || "").toLowerCase().includes("size")) {
                loadedSizes.add(parts[0]);
              } else {
                loadedColors.add(parts[0]);
              }
            }
          }
        });
        setColors(Array.from(loadedColors));
        setSizes(Array.from(loadedSizes));
      }

      // Load shipping package dimensions & dangerous goods
      if (entry.dimensions) {
        const d = typeof entry.dimensions === "string" ? JSON.parse(entry.dimensions) : entry.dimensions;
        setDimensions({
          length: d.length !== undefined ? d.length.toString() : "",
          width: d.width !== undefined ? d.width.toString() : "",
          height: d.height !== undefined ? d.height.toString() : "",
        });
      }
      setDangerousGoods(entry.dangerousGoods || "None");
      setShowCategorySelector(false);
    }
  }, [entry]);

  // Load Brand & Unit options
  const fetchUnit = async () => {
    try {
      const unit = await getUnitDw();
      setUnitOptions(unit);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchUnit();
  }, []);

  const handleBrandId = (id: string) => {
    form.setValue("brandId", id);
    setBrandId(id);
  };

  const handleUnitId = (id: string) => {
    form.setValue("unitId", id);
  };

  // Image Upload handler
  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []) as File[];
    if (files.length === 0) return;

    try {
      setLoader(true);
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));

      const response = await fetch("/api/upload/products", {
        method: "POST",
        body: formData,
      });

      const resData = await response.json();
      if (resData.success && resData.urls && resData.urls.length > 0) {
        setImagePreviews((prev) => [...prev, ...resData.urls]);
        toast.success("Images uploaded successfully");
      } else {
        toast.error("Image upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("An error occurred during upload");
    } finally {
      setLoader(false);
    }
  };

  const handleRemovePreview = (preview: string) => {
    setImagePreviews((prev) => prev.filter((p) => p !== preview));
  };

  // Variants state management
  const syncVariants = (newSizes: string[], newColors: string[]) => {
    const combos: { color: string; size: string; optionValue: string }[] = [];

    if (newColors.length > 0 && newSizes.length > 0) {
      newColors.forEach((c) => {
        newSizes.forEach((s) => {
          combos.push({
            color: c,
            size: s,
            optionValue: `${c} / ${s}`,
          });
        });
      });
    } else if (newColors.length > 0) {
      newColors.forEach((c) => {
        combos.push({
          color: c,
          size: "",
          optionValue: c,
        });
      });
    } else if (newSizes.length > 0) {
      newSizes.forEach((s) => {
        combos.push({
          color: "",
          size: s,
          optionValue: s,
        });
      });
    }

    const mainPrice = form.getValues("price")?.toString() || "";
    const mainSpecialPrice = form.getValues("promoPrice")?.toString() || "";
    const mainStock = form.getValues("stock")?.toString() || "";
    const mainMrp = form.getValues("mrp")?.toString() || "";
    const mainCostPrice = form.getValues("tp")?.toString() || "";

    const updatedData = combos.map((combo) => {
      const existing = variantData.find(
        (row) =>
          row.optionValue === combo.optionValue ||
          (row.color === combo.color && row.size === combo.size)
      );

      if (existing) {
        return {
          ...existing,
          color: combo.color,
          size: combo.size,
          optionValue: combo.optionValue,
        };
      }

      const mainName = form.getValues("name") || "ITEM";
      const cleanName = mainName
        .replace(/\s+/g, "-")
        .replace(/[^a-zA-Z0-9-]/g, "")
        .toUpperCase()
        .slice(0, 15);
      const cleanColor = combo.color
        .replace(/\s+/g, "-")
        .replace(/[^a-zA-Z0-9-]/g, "")
        .toUpperCase();
      const cleanSize = combo.size
        .replace(/\s+/g, "-")
        .replace(/[^a-zA-Z0-9-]/g, "")
        .toUpperCase();

      let generatedSku = cleanName;
      if (cleanColor) generatedSku += `-${cleanColor}`;
      if (cleanSize) generatedSku += `-${cleanSize}`;

      return {
        variantName: "Color / Size",
        color: combo.color,
        size: combo.size,
        optionValue: combo.optionValue,
        price: mainPrice,
        specialPrice: mainSpecialPrice,
        mrp: mainMrp,
        costPrice: mainCostPrice,
        stock: mainStock,
        sku: generatedSku,
        barcode: "",
        images: [],
        availability: true,
      };
    });

    setVariantData(updatedData);
  };

  const handleAddSize = () => {
    const trimmed = newSizeInput.trim();
    if (!trimmed) return;
    if (sizes.includes(trimmed)) {
      toast.error("Size already exists");
      return;
    }
    const updated = [...sizes, trimmed];
    setSizes(updated);
    setNewSizeInput("");
    syncVariants(updated, colors);
  };

  const handleRemoveSize = (sizeToRemove: string) => {
    const updated = sizes.filter((s) => s !== sizeToRemove);
    setSizes(updated);
    syncVariants(updated, colors);
  };

  const handleAddColor = () => {
    const trimmed = newColorInput.trim();
    if (!trimmed) return;
    if (colors.includes(trimmed)) {
      toast.error("Color already exists");
      return;
    }
    const updated = [...colors, trimmed];
    setColors(updated);
    setNewColorInput("");
    syncVariants(sizes, updated);
  };

  const handleRemoveColor = (colorToRemove: string) => {
    const updated = colors.filter((c) => c !== colorToRemove);
    setColors(updated);
    syncVariants(sizes, updated);
  };

  const handleVariantFieldChange = (optionValue: string, field: string, value: any) => {
    setVariantData((prev) =>
      prev.map((row) =>
        row.optionValue === optionValue ? { ...row, [field]: value } : row
      )
    );
  };

  const handleVariantImageChange = async (optionValue: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []) as File[];
    if (files.length === 0) return;

    try {
      setLoader(true);
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));

      const response = await fetch("/api/upload/products", {
        method: "POST",
        body: formData,
      });

      const resData = await response.json();
      if (resData.success && resData.urls && resData.urls.length > 0) {
        setVariantData((prev) =>
          prev.map((row) =>
            row.optionValue === optionValue
              ? { ...row, images: [...(row.images || []), ...resData.urls] }
              : row
          )
        );
        toast.success("Variant images uploaded successfully");
      } else {
        toast.error("Image upload failed");
      }
    } catch (error) {
      console.error("Variant upload error:", error);
      toast.error("An error occurred during upload");
    } finally {
      setLoader(false);
    }
  };

  const handleRemoveVariantImage = (optionValue: string, url: string) => {
    setVariantData((prev) =>
      prev.map((row) =>
        row.optionValue === optionValue
          ? { ...row, images: (row.images || []).filter((img: string) => img !== url) }
          : row
      )
    );
  };

  const handleRemoveVariantBg = async (optionValue: string, url: string) => {
    try {
      setBgRemovingUrls((prev) => [...prev, url]);
      const res = await fetch("/api/ai/remove-bg", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageUrl: url }),
      });

      const resData = await res.json();
      if (resData.success && resData.url) {
        setVariantData((prev) =>
          prev.map((row) =>
            row.optionValue === optionValue
              ? {
                  ...row,
                  images: (row.images || []).map((img: string) => (img === url ? resData.url : img)),
                }
              : row
          )
        );
        toast.success("Variant background removed successfully!");
      } else {
        toast.error(resData.error || "Failed to remove background.");
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred.");
    } finally {
      setBgRemovingUrls((prev) => prev.filter((p) => p !== url));
    }
  };

  const handleCopyBasePricingToEmptyVariants = () => {
    const mainPrice = form.getValues("price")?.toString() || "";
    const mainSpecialPrice = form.getValues("promoPrice")?.toString() || "";
    const mainStock = form.getValues("stock")?.toString() || "";
    const mainMrp = form.getValues("mrp")?.toString() || "";
    const mainCostPrice = form.getValues("tp")?.toString() || "";

    setVariantData((prev) =>
      prev.map((row) => ({
        ...row,
        price: row.price && row.price !== "" ? row.price : mainPrice,
        specialPrice: row.specialPrice && row.specialPrice !== "" ? row.specialPrice : mainSpecialPrice,
        mrp: row.mrp && row.mrp !== "" ? row.mrp : mainMrp,
        costPrice: row.costPrice && row.costPrice !== "" ? row.costPrice : mainCostPrice,
        stock: row.stock && row.stock !== "" ? row.stock : mainStock,
      }))
    );
    toast.success("Copied base pricing to all variants");
  };

  const handleResetAllToBasePricing = () => {
    setVariantData((prev) =>
      prev.map((row) => ({
        ...row,
        price: "",
        specialPrice: "",
        stock: "",
        costPrice: "",
        mrp: "",
      }))
    );
    toast.success("Reset all pricing fields to blank (Use Base)");
  };

  // Submit Handler
  async function onSubmit(data: z.infer<typeof ProductFormSchema>) {
    try {
      loaderShow();

      // Format dimensions & package data
      const formattedDimensions = {
        length: parseFloat(dimensions.length) || 0,
        width: parseFloat(dimensions.width) || 0,
        height: parseFloat(dimensions.height) || 0,
      };

      // In variants mode, set base price and stock to the first variant option
      let finalPrice = data.price;
      let finalStock = data.stock;
      let finalMrp = data.mrp;
      let finalTp = data.tp;
      if (hasVariants && variantData.length > 0) {
        const first = variantData[0];
        finalPrice = parseFloat(first.price) || finalPrice;
        finalStock = parseInt(first.stock) || finalStock;
        if (first.mrp) finalMrp = parseFloat(first.mrp) || finalMrp;
        if (first.costPrice) finalTp = parseFloat(first.costPrice) || finalTp;
      }

      const fullProductData = {
        ...data,
        price: finalPrice,
        stock: finalStock,
        mrp: finalMrp,
        tp: finalTp,
        productImgCollectionObject: imagePreviews,
        hasVariants,
        variants: hasVariants
          ? {
              name: "Color / Size",
              options: variantData.map((row) => row.optionValue),
              data: variantData,
            }
          : null,
        dimensions: formattedDimensions,
        dangerousGoods,
        storeId: storeId || data.storeId || undefined,
      };

      const product = await saveProduct(id, fullProductData);
      if (product) {
        form.reset();
        setImagePreviews([]);
        setVariantData([]);
        setColors([]);
        setSizes([]);
        setDimensions({ length: "", width: "", height: "" });
        setDangerousGoods("None");
        loaderClose();
        toast.success(id ? "Product Update Success" : "Product Creation Success");
        router.push("/dashboard/seller/products");
      } else {
        toast.error(id ? "Product Update failed!" : "Product Creation failed!");
        loaderClose();
      }
    } catch (error) {
      console.log(error);
      loaderClose();
    }
  }

  // AI Handler Functions
  const handleOptimizeTitle = async () => {
    const currentTitle = form.getValues("name");
    if (!currentTitle || !currentTitle.trim()) {
      toast.error("Please enter a basic product name first.");
      return;
    }

    try {
      setTitleOptimizing(true);
      const res = await optimizeTitleAction(currentTitle);
      if (res.success && res.title) {
        form.setValue("name", res.title);
        toast.success("Product title optimized by AI!");
      } else {
        toast.error(res.error || "Failed to optimize title.");
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred.");
    } finally {
      setTitleOptimizing(false);
    }
  };

  const handleGenerateDescriptionAndHighlights = async () => {
    if (!aiKeywords.trim()) {
      toast.error("Please enter some keywords or features.");
      return;
    }

    try {
      setAiGenerating(true);
      setAiResult(null);
      const res = await generateDescriptionAndHighlightsAction(aiKeywords);
      if (res.success && res.data) {
        setAiResult({
          description: res.data.description || "",
          highlights: res.data.highlights || "",
        });
        toast.success("AI content generated successfully!");
      } else {
        toast.error(res.error || "Failed to generate AI content.");
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred.");
    } finally {
      setAiGenerating(false);
    }
  };

  const handleApplyAiContent = () => {
    if (aiResult) {
      if (aiResult.description) {
        form.setValue("description", aiResult.description);
      }
      if (aiResult.highlights) {
        form.setValue("highlight", aiResult.highlights);
      }
      setShowAiModal(false);
      setAiKeywords("");
      setAiResult(null);
      toast.success("AI content applied to fields!");
    }
  };

  const handleRemoveBackground = async (url: string) => {
    try {
      setBgRemovingUrls((prev) => [...prev, url]);
      const res = await fetch("/api/ai/remove-bg", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageUrl: url }),
      });

      const resData = await res.json();
      if (resData.success && resData.url) {
        setImagePreviews((prev) =>
          prev.map((p) => (p === url ? resData.url : p))
        );
        toast.success("Background removed successfully!");
      } else {
        toast.error(resData.error || "Failed to remove background.");
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred.");
    } finally {
      setBgRemovingUrls((prev) => prev.filter((p) => p !== url));
    }
  };


  // Determine Title dynamically
  const displayTitle = showCategorySelector ? "Select Product Category" : (title || "Create Product");

  return (
    <div className="relative">
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center pb-4 border-b border-slate-200/60">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/seller/products">
            <Button variant="ghost" className="rounded-full h-10 w-10 p-0 hover:bg-slate-100">
              <ArrowLeft size={20} className="text-slate-600" />
            </Button>
          </Link>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
            {displayTitle}
          </h2>
        </div>
        <Link href="/dashboard/seller/products">
          <Button
            type="button"
            className="bg-red-500 hover:bg-red-600 text-white rounded-full px-6 py-2 shadow-sm font-medium transition duration-200"
          >
            <X size={16} className="mr-1.5" /> Cancel
          </Button>
        </Link>
      </div>

      {showCategorySelector ? (
        <CategorySelectorModal
          initialCategoryId={form.getValues("categoryId")}
          restrictMasterCategoryId={restrictMasterCategoryId}
          onConfirm={(selectedCategory, path) => {
            setSelectedCategoryPath(path);
            form.setValue("categoryId", selectedCategory.id);
            // Resolve Master Category
            import("../_action").then(({ fetchAllCategories }) => {
              fetchAllCategories().then((allCats) => {
                let topParentId = selectedCategory.id;
                let curr = selectedCategory;
                while (curr.parentId) {
                  const parent = allCats.find((c) => c.id === curr.parentId);
                  if (parent) {
                    topParentId = parent.id;
                    curr = parent;
                  } else {
                    break;
                  }
                }
                form.setValue("masterCategoryId", topParentId);
              });
            });
            setShowCategorySelector(false);
          }}
          onCancel={() => {
            if (entry?.id) {
              setShowCategorySelector(false);
            } else {
              router.push("/dashboard/seller/products");
            }
          }}
        />
      ) : (
        <div className="w-full">
          {/* Add/Edit Product Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
              <fieldset disabled={viewOnly} className="w-full space-y-6 border-none p-0 m-0 bg-transparent min-w-0">
                {/* ______________Basic Information___________ */}
              <div className="shadow-sm p-6 rounded-2xl border border-slate-100 bg-white space-y-5">
                <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                  <h3 className="text-lg font-bold text-slate-800">Basic Information</h3>
                  <span className="text-xs text-red-500 font-medium">* Mandatory fields</span>
                </div>

                {/* Product Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex justify-between items-center mb-1">
                        <FormLabel className="text-slate-700 font-semibold flex items-center gap-1">
                          Product Name <span className="text-red-500">*</span>
                        </FormLabel>
                        <div className="flex items-center gap-3">
                          {!viewOnly && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={titleOptimizing || !form.watch("name")?.trim()}
                              onClick={handleOptimizeTitle}
                              className="rounded-full border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 text-xs py-1 h-7 flex items-center gap-1 font-medium transition duration-200 cursor-pointer"
                            >
                              {titleOptimizing ? (
                                <>
                                  <span className="animate-spin h-3 w-3 border-2 border-blue-600 border-t-transparent rounded-full" />
                                  Optimizing...
                                </>
                              ) : (
                                <>
                                  <Sparkles size={12} className="text-blue-600" />
                                  Optimize with AI
                                </>
                              )}
                            </Button>
                          )}
                          <span className="text-xs text-slate-400">
                            {field.value ? field.value.length : 0}/255
                          </span>
                        </div>
                      </div>
                      <FormControl>
                        <Input
                          maxLength={255}
                          placeholder="Ex. Nikon Coolpix A300 Digital Camera"
                          {...field}
                          className="rounded-xl border-slate-200 focus:border-blue-500 text-sm py-2"
                        />
                      </FormControl>
                      <p className="text-[11px] text-slate-400 leading-normal mt-1">
                        Multiple language title will be showed when buyers change their APPs' default language setting.
                        Setting it up can help improve product recall in Apps targeted at different languages.
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Category Path Display */}
                <div>
                  <FormLabel className="text-slate-700 font-semibold block mb-2">
                    Category <span className="text-red-500">*</span>
                  </FormLabel>
                  <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-xl p-3">
                    <span className="text-xs font-semibold text-slate-600 truncate flex-1">
                      {selectedCategoryPath || "No category selected"}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowCategorySelector(true)}
                      className="rounded-full border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 text-xs font-normal"
                    >
                      Change Category
                    </Button>
                  </div>
                </div>

                {/* Product Images (White Background & Others) */}
                <div>
                  <FormLabel className="text-slate-700 font-semibold block mb-2">
                    Product Images <span className="text-red-500">*</span>
                  </FormLabel>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {/* File Dropzone */}
                    {!viewOnly && (
                      <div className="relative aspect-square flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100/80 rounded-xl border-2 border-dashed border-slate-200 transition cursor-pointer">
                        <Input
                          id="productImages"
                          type="file"
                          accept="image/*"
                          multiple
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          onChange={handleImageChange}
                        />
                        <ImageIcon className="text-slate-400 mb-1" size={24} />
                        <span className="text-[11px] text-slate-500 font-medium text-center px-2">
                          White Background
                        </span>
                        <span className="text-[9px] text-slate-400">Min 480x480 px</span>
                      </div>
                    )}

                    {/* Previews */}
                    {imagePreviews.map((url, index) => (
                      <div key={url} className="relative aspect-square rounded-xl border border-slate-100 overflow-hidden bg-slate-50 group">
                        <Image alt={`Product ${index + 1}`} src={url} fill className="object-cover" />
                        {!viewOnly && (
                          <button
                            type="button"
                            onClick={() => handleRemovePreview(url)}
                            className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition duration-150 cursor-pointer"
                          >
                            <Cross className="rotate-45" size={12} />
                          </button>
                        )}
                        
                        {/* Remove BG Action Button */}
                        {!viewOnly && (
                          <button
                            type="button"
                            onClick={() => handleRemoveBackground(url)}
                            disabled={bgRemovingUrls.includes(url)}
                            className="absolute bottom-1 right-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-[10px] font-semibold px-2 py-1 rounded shadow-sm opacity-0 group-hover:opacity-100 transition duration-150 flex items-center gap-1 cursor-pointer"
                          >
                            {bgRemovingUrls.includes(url) ? (
                              <>
                                <span className="animate-spin h-2.5 w-2.5 border-2 border-white border-t-transparent rounded-full" />
                                Removing...
                              </>
                            ) : (
                              <>
                                <Sparkles size={10} /> Remove BG
                              </>
                            )}
                          </button>
                        )}

                        {index === 0 && (
                          <span className="absolute bottom-1 left-1 bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                            Main
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Video Integration */}
                <div className="border-t border-slate-100 pt-4">
                  <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-1">
                    Video <span className="text-xs text-slate-400 font-normal">(Optional)</span>
                  </h4>
                  <Tabs defaultValue="upload_video" className="w-full">
                    <TabsList className="bg-slate-100 p-1 rounded-full mb-3 inline-flex">
                      <TabsTrigger
                        value="upload_video"
                        className="rounded-full text-xs font-normal data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm px-4 py-1.5"
                      >
                        Upload Video
                      </TabsTrigger>
                      <TabsTrigger
                        value="youtube_link"
                        className="rounded-full text-xs font-normal data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm px-4 py-1.5"
                      >
                        YouTube Link
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="upload_video">
                      <FormField
                        control={form.control}
                        name="video"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <div className="relative flex flex-col sm:flex-row items-center gap-4 bg-slate-50 rounded-xl p-4 border border-dashed border-slate-200">
                                <div className="relative bg-white border border-slate-200 p-3 rounded-lg flex items-center justify-center shrink-0 cursor-pointer">
                                  <Input
                                    id="productVideo"
                                    type="file"
                                    accept="video/mp4"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        field.onChange(URL.createObjectURL(file));
                                        toast.success("Video selected");
                                      }
                                    }}
                                  />
                                  <VideoIcon size={24} className="text-blue-600" />
                                </div>
                                <div className="flex-1 text-slate-500 text-xs">
                                  <ul className="list-disc pl-4 space-y-0.5">
                                    <li>Min size: 480x480 px. Max length: 60 seconds.</li>
                                    <li>Max file size: 100MB. Supported Format: mp4</li>
                                    <li>New Video might take up to 36 hrs to be approved</li>
                                  </ul>
                                </div>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TabsContent>
                    <TabsContent value="youtube_link">
                      <FormField
                        control={form.control}
                        name="ytVideoLink"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                placeholder="Paste your YouTube video URL (e.g. https://youtube.com/watch?v=...)"
                                {...field}
                                className="rounded-xl border-slate-200 focus:border-blue-500"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TabsContent>
                  </Tabs>
                </div>


              </div>

              {/* ______________Price, Stock & Variants___________ */}
              <div className="shadow-sm p-6 rounded-2xl border border-slate-100 bg-white space-y-5">
                <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                  <h3 className="text-lg font-bold text-slate-800">Price, Stock & Variants</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-600">Add Variants</span>
                    <Switch
                      checked={hasVariants}
                      onCheckedChange={(checked) => {
                        setHasVariants(checked);
                      }}
                      disabled={viewOnly}
                    />
                  </div>
                </div>

                {hasVariants ? (
                  <div className="space-y-6 animate-in fade-in duration-200">
                    <p className="text-xs text-slate-500">
                      Add the sizes and colors of your product, and configure the pricing/inventory for each combo.
                    </p>

                    {/* Variant Configuration Tags Inputs */}
                    <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-200/60 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Sizes section */}
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                            Sizes
                          </label>
                          {!viewOnly && (
                            <div className="flex gap-2">
                              <Input
                                placeholder="Add size (e.g. XL, 42)"
                                value={newSizeInput}
                                onChange={(e) => setNewSizeInput(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleAddSize();
                                  }
                                }}
                                className="bg-white rounded-xl border-slate-200 h-10 text-sm focus:border-blue-500"
                              />
                              <Button
                                type="button"
                                onClick={handleAddSize}
                                className="bg-blue-600 hover:bg-blue-700 h-10 w-10 shrink-0 rounded-xl text-white flex items-center justify-center transition"
                              >
                                <Plus size={16} />
                              </Button>
                            </div>
                          )}
                          {sizes.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-2">
                              {sizes.map((s) => (
                                <span
                                  key={s}
                                  className="bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5"
                                >
                                  {s}
                                  {!viewOnly && (
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveSize(s)}
                                      className="text-slate-400 hover:text-slate-600 transition"
                                    >
                                      <X size={10} />
                                    </button>
                                  )}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Colors section */}
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                            Colors
                          </label>
                          {!viewOnly && (
                            <div className="flex gap-2">
                              <Input
                                placeholder="Add color (e.g. Red, Blue)"
                                value={newColorInput}
                                onChange={(e) => setNewColorInput(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleAddColor();
                                  }
                                }}
                                className="bg-white rounded-xl border-slate-200 h-10 text-sm focus:border-blue-500"
                              />
                              <Button
                                type="button"
                                onClick={handleAddColor}
                                className="bg-blue-600 hover:bg-blue-700 h-10 w-10 shrink-0 rounded-xl text-white flex items-center justify-center transition"
                              >
                                <Plus size={16} />
                              </Button>
                            </div>
                          )}
                          {colors.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-2">
                              {colors.map((c) => (
                                <span
                                  key={c}
                                  className="bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5"
                                >
                                  {c}
                                  {!viewOnly && (
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveColor(c)}
                                      className="text-blue-400 hover:text-blue-600 transition"
                                    >
                                      <X size={10} />
                                    </button>
                                  )}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Variant Matrix Table */}
                    {variantData.length > 0 && (
                      <div className="space-y-4 pt-2">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-3">
                          <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <span>SKU Variant Matrix</span>
                            <span className="text-xs bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full">
                              {variantData.filter((r) => r.availability !== false).length} Active
                            </span>
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={handleCopyBasePricingToEmptyVariants}
                              className="rounded-full border-blue-200 text-blue-600 hover:bg-blue-50 text-[10px] font-semibold py-1 h-8 cursor-pointer"
                            >
                              Copy Base Pricing to Empty Variants
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={handleResetAllToBasePricing}
                              className="rounded-full border-slate-200 text-slate-600 hover:bg-slate-50 text-[10px] font-semibold py-1 h-8 cursor-pointer"
                            >
                              Reset All to Base Pricing
                            </Button>
                          </div>
                        </div>

                        {/* Responsive Table Container */}
                        <div className="overflow-x-auto border border-slate-200 rounded-2xl shadow-sm bg-white">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                                <th className="p-3 w-10 text-center">Active</th>
                                <th className="p-3 w-12 text-center">Photo</th>
                                {colors.length > 0 && <th className="p-3">Color</th>}
                                {sizes.length > 0 && <th className="p-3">Size</th>}
                                <th className="p-3 min-w-[120px]">SKU Code</th>
                                <th className="p-3 min-w-[110px]">Barcode</th>
                                <th className="p-3 w-[90px]">Cost Price</th>
                                <th className="p-3 w-[90px]">Sales Price</th>
                                <th className="p-3 w-[90px]">Discount Price</th>
                                <th className="p-3 w-[90px]">MRP</th>
                                <th className="p-3 w-[85px]">Init Stock</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {variantData.map((row) => (
                                <tr
                                  key={row.optionValue}
                                  className={`hover:bg-slate-50/50 transition ${
                                    row.availability === false ? "opacity-60 bg-slate-50/20" : ""
                                  }`}
                                >
                                  {/* Active Checkbox */}
                                  <td className="p-3 text-center">
                                    <input
                                      type="checkbox"
                                      checked={row.availability !== false}
                                      onChange={(e) =>
                                        handleVariantFieldChange(
                                          row.optionValue,
                                          "availability",
                                          e.target.checked
                                        )
                                      }
                                      className="h-4.5 w-4.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                    />
                                  </td>

                                  {/* Photo Column */}
                                  <td className="p-3 text-center">
                                    <div className="relative w-8 h-8 rounded border border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center cursor-pointer group mx-auto">
                                      <input
                                        type="file"
                                        accept="image/*"
                                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                        onChange={(e) =>
                                          handleVariantImageChange(row.optionValue, e)
                                        }
                                      />
                                      {row.images && row.images.length > 0 ? (
                                        <>
                                          <Image
                                            src={row.images[0]}
                                            fill
                                            className="object-cover"
                                            alt="Variant"
                                          />
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              e.preventDefault();
                                              handleRemoveVariantImage(row.optionValue, row.images[0]);
                                            }}
                                            className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full p-0.5 shadow-sm opacity-0 group-hover:opacity-100 transition z-20"
                                            title="Delete Image"
                                          >
                                            <X size={6} />
                                          </button>
                                        </>
                                      ) : (
                                        <ImageIcon size={14} className="text-slate-400" />
                                      )}
                                    </div>
                                  </td>

                                  {/* Color Badge */}
                                  {colors.length > 0 && (
                                    <td className="p-3 font-semibold text-slate-700">
                                      {row.color && (
                                        <span className="px-2 py-0.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 font-semibold">
                                          {row.color}
                                        </span>
                                      )}
                                    </td>
                                  )}

                                  {/* Size Badge */}
                                  {sizes.length > 0 && (
                                    <td className="p-3 font-semibold text-slate-700">
                                      {row.size && (
                                        <span className="px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 font-semibold">
                                          {row.size}
                                        </span>
                                      )}
                                    </td>
                                  )}

                                  {/* SKU Code Input */}
                                  <td className="p-3">
                                    <Input
                                      value={row.sku || ""}
                                      onChange={(e) =>
                                        handleVariantFieldChange(
                                          row.optionValue,
                                          "sku",
                                          e.target.value
                                        )
                                      }
                                      className="h-8 text-xs px-2 rounded-lg border-slate-200 bg-white"
                                      placeholder="SKU-XXXX"
                                    />
                                  </td>

                                  {/* Barcode Input */}
                                  <td className="p-3">
                                    <Input
                                      value={row.barcode || ""}
                                      onChange={(e) =>
                                        handleVariantFieldChange(
                                          row.optionValue,
                                          "barcode",
                                          e.target.value
                                        )
                                      }
                                      className="h-8 text-xs px-2 rounded-lg border-slate-200 bg-white"
                                      placeholder="Auto-generated"
                                    />
                                  </td>

                                  {/* Cost Price */}
                                  <td className="p-3">
                                    <Input
                                      type="number"
                                      value={row.costPrice || ""}
                                      onChange={(e) =>
                                        handleVariantFieldChange(
                                          row.optionValue,
                                          "costPrice",
                                          e.target.value
                                        )
                                      }
                                      className="h-8 text-xs px-1.5 rounded-lg border-slate-200 bg-white text-center"
                                      placeholder="Use Base"
                                    />
                                  </td>

                                  {/* Sales Price */}
                                  <td className="p-3">
                                    <Input
                                      type="number"
                                      value={row.price || ""}
                                      onChange={(e) =>
                                        handleVariantFieldChange(
                                          row.optionValue,
                                          "price",
                                          e.target.value
                                        )
                                      }
                                      className="h-8 text-xs px-1.5 rounded-lg border-slate-200 bg-white text-center"
                                      placeholder="Use Base"
                                    />
                                  </td>

                                  {/* Discount Price */}
                                  <td className="p-3">
                                    <Input
                                      type="number"
                                      value={row.specialPrice || ""}
                                      onChange={(e) =>
                                        handleVariantFieldChange(
                                          row.optionValue,
                                          "specialPrice",
                                          e.target.value
                                        )
                                      }
                                      className="h-8 text-xs px-1.5 rounded-lg border-slate-200 bg-white text-center"
                                      placeholder="Use Base"
                                    />
                                  </td>

                                  {/* MRP Input */}
                                  <td className="p-3">
                                    <Input
                                      type="number"
                                      value={row.mrp || ""}
                                      onChange={(e) =>
                                        handleVariantFieldChange(
                                          row.optionValue,
                                          "mrp",
                                          e.target.value
                                        )
                                      }
                                      className="h-8 text-xs px-1.5 rounded-lg border-slate-200 bg-white text-center"
                                      placeholder="Use Base"
                                    />
                                  </td>

                                  {/* Stock Quantity */}
                                  <td className="p-3">
                                    <Input
                                      type="number"
                                      value={row.stock || ""}
                                      onChange={(e) =>
                                        handleVariantFieldChange(
                                          row.optionValue,
                                          "stock",
                                          e.target.value
                                        )
                                      }
                                      className="h-8 text-xs px-1.5 rounded-lg border-slate-200 bg-white text-center"
                                      placeholder="0"
                                    />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  // Non-variants base Price & Stock layout
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700 font-semibold">
                            Sale price (৳) <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Ex. 350"
                              {...field}
                              value={field.value ?? ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                field.onChange(val === "" ? "" : parseFloat(val));
                              }}
                              className="rounded-xl border-slate-200 text-sm"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="promoPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700 font-semibold">Discount price (৳)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Ex. 300"
                              {...field}
                              value={field.value ?? ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                field.onChange(val === "" ? "" : parseFloat(val));
                              }}
                              className="rounded-xl border-slate-200 text-sm"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="stock"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700 font-semibold">
                            Stock <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Ex. 50"
                              {...field}
                              value={field.value ?? ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                field.onChange(val === "" ? "" : parseInt(val));
                              }}
                              className="rounded-xl border-slate-200 text-sm"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="mrp"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700 font-semibold">MRP (৳)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Ex. 400"
                              {...field}
                              value={field.value ?? ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                field.onChange(val === "" ? "" : parseFloat(val));
                              }}
                              className="rounded-xl border-slate-200 text-sm"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="tp"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700 font-semibold">Cost price (৳)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Ex. 280"
                              {...field}
                              value={field.value ?? ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                field.onChange(val === "" ? "" : parseFloat(val));
                              }}
                              className="rounded-xl border-slate-200 text-sm"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="vat"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700 font-semibold">Vat (%)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Ex. 5"
                              {...field}
                              value={field.value ?? ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                field.onChange(val === "" ? "" : parseInt(val));
                              }}
                              className="rounded-xl border-slate-200 text-sm"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>

              {/* ______________Product Description___________ */}
              <div className="shadow-sm p-6 rounded-2xl border border-slate-100 bg-white space-y-5">
                <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                  <h3 className="text-lg font-bold text-slate-800">
                    Product Description
                  </h3>
                  {!viewOnly && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAiModal(true)}
                      className="rounded-full border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 text-xs py-1 h-7 flex items-center gap-1 font-medium transition duration-200 cursor-pointer"
                    >
                      <Sparkles size={12} className="text-blue-600" /> Write with AI
                    </Button>
                  )}
                </div>

                {/* Description HTML/Google Doc WYSIWYG Editor */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-semibold block mb-1">
                        Main Description <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <RichTextEditor value={field.value || ""} onChange={field.onChange} disabled={viewOnly} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* English Highlights */}
                <FormField
                  control={form.control}
                  name="highlight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-semibold">Highlights</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Highlights (comma separated key points)"
                          {...field}
                          className="rounded-xl border-slate-200 text-sm"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* ______________Shipping & Warranty___________ */}
              <div className="shadow-sm p-6 rounded-2xl border border-slate-100 bg-white space-y-5">
                <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3">
                  Shipping & Warranty
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Package Weight */}
                  <div>
                    <label className="text-sm font-semibold text-slate-700 block mb-1">
                      Package Weight (kg) <span className="text-red-500">*</span>
                    </label>
                    <FormField
                      control={form.control}
                      name="weight"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.001"
                              placeholder="0.001 ~ 300 kg"
                              {...field}
                              value={field.value ?? ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                field.onChange(val === "" ? "" : parseFloat(val));
                              }}
                              className="rounded-xl border-slate-200 text-sm"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Dangerous Goods */}
                  <div>
                    <label className="text-sm font-semibold text-slate-700 block mb-1">
                      Dangerous Goods
                    </label>
                    <Select onValueChange={setDangerousGoods} value={dangerousGoods}>
                      <SelectTrigger className="rounded-xl border-slate-200 bg-white text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="None">None</SelectItem>
                        <SelectItem value="Battery">Contains battery</SelectItem>
                        <SelectItem value="Flammables">Contains flammables</SelectItem>
                        <SelectItem value="Liquid">Contains liquid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Package Dimensions */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 block">
                    Package Dimensions (cm) <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] text-slate-400 font-semibold block mb-0.5">Length</label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Length (cm)"
                        value={dimensions.length}
                        onChange={(e) => setDimensions({ ...dimensions, length: e.target.value })}
                        className="rounded-xl border-slate-200 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 font-semibold block mb-0.5">Width</label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Width (cm)"
                        value={dimensions.width}
                        onChange={(e) => setDimensions({ ...dimensions, width: e.target.value })}
                        className="rounded-xl border-slate-200 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 font-semibold block mb-0.5">Height</label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Height (cm)"
                        value={dimensions.height}
                        onChange={(e) => setDimensions({ ...dimensions, height: e.target.value })}
                        className="rounded-xl border-slate-200 text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* ______________Submit Button___________ */}
              {!viewOnly && (
                <div className="text-end">
                  <Button
                    type="submit"
                    className="rounded-full bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 font-semibold shadow-sm transition"
                  >
                    Submit Product
                  </Button>
                </div>
              )}
            </fieldset>
          </form>
        </Form>

        </div>
      )}

      {/* Sleek AI Description & Highlights Modal */}
      {showAiModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[95vh] overflow-y-auto p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="bg-blue-50 p-2 rounded-xl text-blue-600">
                  <Sparkles size={20} />
                </div>
                <h3 className="text-lg font-bold text-slate-800">
                  Generate Description with AI
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAiModal(false);
                  setAiKeywords("");
                  setAiResult(null);
                }}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-full transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1">
                  Product Keywords or Specifications
                </label>
                <p className="text-xs text-slate-400 mb-2">
                  Enter comma-separated features, materials, colors, and key details about your product.
                </p>
                <textarea
                  placeholder="Ex. 100% organic cotton, slim fit, breathable, classic collar, cherry red color, perfect for casual summer wear, durable stitching"
                  value={aiKeywords}
                  onChange={(e) => setAiKeywords(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none transition"
                />
              </div>

              {/* Generate Button */}
              <div className="flex justify-end">
                <Button
                  type="button"
                  disabled={aiGenerating || !aiKeywords.trim()}
                  onClick={handleGenerateDescriptionAndHighlights}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 py-2 font-medium flex items-center gap-2 shadow-sm transition"
                >
                  {aiGenerating ? (
                    <>
                      <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                      Generating Content...
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} /> Generate
                    </>
                  )}
                </Button>
              </div>

              {/* AI Generating Loader Screen */}
              {aiGenerating && (
                <div className="flex flex-col items-center justify-center p-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2 animate-pulse">
                  <Sparkles className="text-blue-500 animate-bounce" size={28} />
                  <p className="text-xs font-semibold text-slate-600">Writing description & highlights...</p>
                  <p className="text-[10px] text-slate-400">This will take a few seconds.</p>
                </div>
              )}

              {/* Preview Content */}
              {aiResult && (
                <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
                    <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-green-500" />
                      <span className="text-xs font-bold text-slate-700">Description Preview</span>
                    </div>
                    <div className="p-4 bg-white max-h-48 overflow-y-auto">
                      <div
                        className="text-xs text-slate-600 space-y-2 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: aiResult.description }}
                      />
                    </div>
                  </div>

                  <div className="border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
                    <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-green-500" />
                      <span className="text-xs font-bold text-slate-700">Highlights Preview</span>
                    </div>
                    <div className="p-4 bg-white">
                      <p className="text-xs text-slate-600 font-medium">{aiResult.highlights}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            {aiResult && (
              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setAiResult(null);
                    setAiKeywords("");
                  }}
                  className="rounded-full px-5 py-2 text-xs font-medium border-slate-200 text-slate-500 hover:bg-slate-50"
                >
                  Clear
                </Button>
                <Button
                  type="button"
                  onClick={handleApplyAiContent}
                  className="bg-green-600 hover:bg-green-700 text-white rounded-full px-6 py-2 text-xs font-medium shadow-sm transition"
                >
                  Apply Content
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
    <Toaster />
    <Loader isOpen={loader} onClose={setLoader} title="Please Wait" />
    </div>
  );
};

export default ProductForm;
