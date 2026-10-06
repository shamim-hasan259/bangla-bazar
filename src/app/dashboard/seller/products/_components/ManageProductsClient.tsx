"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  ChevronDown,
  Copy,
  Plus,
  HelpCircle,
  ChevronUp,
  X,
  Pencil,
  MessageSquare,
  Heart,
  Eye,
  Star,
  ChevronRight,
  Calendar,
  Store,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { UpdateProductStatus, handleDelete, UpdateProductPrice, UpdateProductStock } from "../_action";

type Product = {
  id: string;
  name: string;
  photo: any;
  status: "Active" | "Inactive" | "Deleted" | "Draft" | "Pending";
  price: number;
  tp?: number;
  mrp?: number;
  articleCode?: string;
  ean?: string;
  stock: number;
  closingQty?: number;
  availableQty?: number;
  salesType?: string;
  website?: string;
  category?: {
    name: string;
  } | null;
  unit?: {
    name: string;
    symbol: string;
  } | null;
};

interface ManageProductsClientProps {
  initialProducts: Product[];
  hasStore?: boolean;
  hasApprovedStore?: boolean;
}

export default function ManageProductsClient({
  initialProducts,
  hasStore,
  hasApprovedStore,
}: ManageProductsClientProps) {
  const router = useRouter();

  // Local state for products so we can toggle status optimistically
  const [products, setProducts] = useState<Product[]>(initialProducts);

  // Layout states
  const [showOverview, setShowOverview] = useState(true);

  // Tabs: 'all', 'active', 'inactive', 'draft', 'pending', 'violation', 'deleted'
  const [activeTab, setActiveTab] = useState<string>("active");

  // Filters
  const [outOfStockOnly, setOutOfStockOnly] = useState(false);
  const [searchField, setSearchField] = useState<"name" | "id" | "sku">("name");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // Selection state
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});

  // Dropdown states for column edits or specific rows
  const [activeDropdownRow, setActiveDropdownRow] = useState<string | null>(null);

  // Inline editing state
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [editingPriceVal, setEditingPriceVal] = useState<number>(0);
  const [editingPriceTpVal, setEditingPriceTpVal] = useState<number | null>(null);

  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [editingStockVal, setEditingStockVal] = useState<number>(0);

  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Dropdown for Bulk Manage
  const [showBulkManageDropdown, setShowBulkManageDropdown] = useState<boolean>(false);

  // Custom Delete Confirm Modal state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteConfirmType, setDeleteConfirmType] = useState<"single" | "bulk">("single");
  const [deleteConfirmIsTrash, setDeleteConfirmIsTrash] = useState(false);
  const [targetDeleteId, setTargetDeleteId] = useState<string | null>(null);

  const editingProduct = useMemo(() => products.find((p) => p.id === editingPriceId), [products, editingPriceId]);
  const editingStockProduct = useMemo(() => products.find((p) => p.id === editingStockId), [products, editingStockId]);

  // Create Stock Alert states
  const [showStockAlertId, setShowStockAlertId] = useState<string | null>(null);
  const [stockAlertStatus, setStockAlertStatus] = useState<boolean>(false);
  const [stockAlertThreshold, setStockAlertThreshold] = useState<number>(10);

  const stockAlertProduct = useMemo(() => products.find((p) => p.id === showStockAlertId), [products, showStockAlertId]);

  const startEditingPrice = (product: Product) => {
    setEditingPriceId(product.id);
    setEditingPriceVal(product.price);
    setEditingPriceTpVal(product.tp ?? null);
    setEditingStockId(null); // Close stock edit if open
  };

  const startEditingStock = (product: Product) => {
    setEditingStockId(product.id);
    setEditingStockVal(product.stock);
    setEditingPriceId(null); // Close price edit if open
  };

  const handleSavePrice = async (id: string) => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      const success = await UpdateProductPrice(id, editingPriceVal, editingPriceTpVal);
      if (success) {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === id ? { ...p, price: editingPriceVal, tp: editingPriceTpVal ?? undefined } : p
          )
        );
        toast.success("Price updated successfully");
        setEditingPriceId(null);
      } else {
        toast.error("Failed to update price");
      }
    } catch (err) {
      toast.error("An error occurred while saving price");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveStock = async (id: string) => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      const success = await UpdateProductStock(id, editingStockVal);
      if (success) {
        setProducts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, stock: editingStockVal } : p))
        );
        toast.success("Stock updated successfully");
        setEditingStockId(null);
      } else {
        toast.error("Failed to update stock");
      }
    } catch (err) {
      toast.error("An error occurred while saving stock");
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportCSV = () => {
    const ids = Object.keys(selectedIds);
    const productsToExport = ids.length > 0
      ? products.filter((p) => selectedIds[p.id])
      : filteredProducts;

    if (productsToExport.length === 0) {
      toast.error("No products to export");
      return;
    }

    const headers = ["ID", "Name", "Price", "TP/Promo Price", "Stock", "Status", "Category", "Seller SKU"];
    const csvRows = [
      headers.join(","),
      ...productsToExport.map((p) => {
        const row = [
          p.id,
          `"${p.name.replace(/"/g, '""')}"`,
          p.price,
          p.tp ?? "",
          p.stock,
          p.status,
          `"${(p.category?.name || "").replace(/"/g, '""')}"`,
          `"${(p.articleCode || "").replace(/"/g, '""')}"`
        ];
        return row.join(",");
      })
    ];

    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `products_export_${new Date().toISOString().slice(0, 10)}.csv`);
    link.className = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Products exported successfully");
  };

  // Unique categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category?.name) set.add(p.category.name);
    });
    return Array.from(set);
  }, [products]);

  // Tab counts
  const tabCounts = useMemo(() => {
    const counts = {
      all: 0,
      active: 0,
      inactive: 0,
      draft: 0,
      pending: 0,
      violation: 0,
      deleted: 0,
    };

    products.forEach((p) => {
      if (p.status !== "Deleted") counts.all++;
      if (p.status === "Active") counts.active++;
      if (p.status === "Inactive") counts.inactive++;
      if (p.status === "Draft") counts.draft++;
      if (p.status === "Pending") counts.pending++;
      if (p.status === "Deleted") counts.deleted++;
    });

    return counts;
  }, [products]);

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => {
      if (activeTab === "all") return p.status !== "Deleted";
      if (activeTab === "active") return p.status === "Active";
      if (activeTab === "inactive") return p.status === "Inactive";
      if (activeTab === "draft") return p.status === "Draft";
      if (activeTab === "pending") return p.status === "Pending";
      if (activeTab === "violation") return false;
      if (activeTab === "deleted") return p.status === "Deleted";
      return true;
    });

    if (outOfStockOnly) {
      result = result.filter((p) => p.stock <= 0);
    }

    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter((p) => {
        if (searchField === "name") return p.name.toLowerCase().includes(query);
        if (searchField === "id") return p.id.toLowerCase().includes(query);
        if (searchField === "sku") return p.articleCode?.toLowerCase().includes(query);
        return true;
      });
    }

    if (selectedCategory !== "all") {
      result = result.filter((p) => p.category?.name === selectedCategory);
    }

    if (sortBy === "priceAsc") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "priceDesc") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "stockAsc") {
      result.sort((a, b) => a.stock - b.stock);
    } else if (sortBy === "stockDesc") {
      result.sort((a, b) => b.stock - a.stock);
    }

    return result;
  }, [products, activeTab, outOfStockOnly, searchField, searchQuery, selectedCategory, sortBy]);

  const handleSelectAll = (checked: boolean) => {
    const newSelected: Record<string, boolean> = {};
    if (checked) {
      filteredProducts.forEach((p) => {
        newSelected[p.id] = true;
      });
    }
    setSelectedIds(newSelected);
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = { ...prev };
      if (checked) {
        next[id] = true;
      } else {
        delete next[id];
      }
      return next;
    });
  };

  const selectedCount = Object.keys(selectedIds).length;

  const getImagePath = (photo: any) => {
    if (!photo) return "/img/offer-photo.png";
    const photoUrl = Array.isArray(photo) ? photo[0] : photo;
    if (typeof photoUrl !== "string" || photoUrl === "") {
      return "/img/offer-photo.png";
    }
    if (
      photoUrl.startsWith("/") ||
      photoUrl.startsWith("http://") ||
      photoUrl.startsWith("https://")
    ) {
      return photoUrl;
    }
    return `/img/${photoUrl}`;
  };

  const handleToggleActive = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "Active" ? "Inactive" : "Active";
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: newStatus as any } : p))
    );

    try {
      const success = await UpdateProductStatus(id, newStatus);
      if (success) {
        toast.success(`Product marked as ${newStatus}`);
      } else {
        setProducts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, status: currentStatus as any } : p))
        );
        toast.error("Failed to update status");
      }
    } catch {
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: currentStatus as any } : p))
      );
      toast.error("An error occurred");
    }
  };

  const handleBulkDeactivate = async () => {
    const ids = Object.keys(selectedIds);
    if (ids.length === 0) return;

    let updatedCount = 0;
    for (const id of ids) {
      const success = await UpdateProductStatus(id, "Inactive");
      if (success) {
        setProducts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, status: "Inactive" } : p))
        );
        updatedCount++;
      }
    }
    toast.success(`Successfully deactivated ${updatedCount} products`);
    setSelectedIds({});
  };

  const handleBulkRestore = async () => {
    const ids = Object.keys(selectedIds);
    if (ids.length === 0) return;

    setIsSaving(true);
    let restoredCount = 0;
    try {
      for (const id of ids) {
        const success = await UpdateProductStatus(id, "Active");
        if (success) {
          setProducts((prev) =>
            prev.map((p) => (p.id === id ? { ...p, status: "Active" } : p))
          );
          restoredCount++;
        }
      }
      toast.success(`Successfully restored ${restoredCount} products`);
      setSelectedIds({});
    } catch (error) {
      toast.error("Failed to restore products");
    } finally {
      setIsSaving(false);
    }
  };

  const triggerBulkDelete = () => {
    setDeleteConfirmType("bulk");
    setDeleteConfirmIsTrash(activeTab === "deleted");
    setDeleteConfirmOpen(true);
  };

  const handleSingleDelete = (id: string, isDeletedStatus: boolean) => {
    setTargetDeleteId(id);
    setDeleteConfirmType("single");
    setDeleteConfirmIsTrash(isDeletedStatus);
    setDeleteConfirmOpen(true);
  };

  const executeDelete = async () => {
    setDeleteConfirmOpen(false);
    setIsSaving(true);
    try {
      if (deleteConfirmType === "single" && targetDeleteId) {
        const id = targetDeleteId;
        if (deleteConfirmIsTrash) {
          const success = await handleDelete(id);
          if (success) {
            setProducts((prev) => prev.filter((p) => p.id !== id));
            toast.success("Product permanently deleted");
          } else {
            toast.error("Failed to delete product");
          }
        } else {
          const success = await UpdateProductStatus(id, "Deleted");
          if (success) {
            setProducts((prev) =>
              prev.map((p) => (p.id === id ? { ...p, status: "Deleted" } : p))
            );
            toast.success("Product moved to trash");
          } else {
            toast.error("Failed to move product to trash");
          }
        }
      } else if (deleteConfirmType === "bulk") {
        const ids = Object.keys(selectedIds);
        if (ids.length === 0) return;

        let processedCount = 0;
        if (deleteConfirmIsTrash) {
          // Bulk permanent delete
          for (const id of ids) {
            const success = await handleDelete(id);
            if (success) {
              setProducts((prev) => prev.filter((p) => p.id !== id));
              processedCount++;
            }
          }
          toast.success(`Successfully permanently deleted ${processedCount} products`);
        } else {
          // Bulk move to trash
          for (const id of ids) {
            const success = await UpdateProductStatus(id, "Deleted");
            if (success) {
              setProducts((prev) =>
                prev.map((p) => (p.id === id ? { ...p, status: "Deleted" } : p))
              );
              processedCount++;
            }
          }
          toast.success(`Successfully moved ${processedCount} products to trash`);
        }
        setSelectedIds({});
      }
    } catch (error) {
      toast.error("An error occurred during deletion");
    } finally {
      setIsSaving(false);
      setTargetDeleteId(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="w-full flex flex-col items-center bg-[#F4F6F9] min-h-screen font-sans text-sm text-[#333]">
      <div className="w-full flex flex-col  ">

        {/* ── Heading Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Manage Products
          </h1>
          <div className="flex items-center flex-wrap gap-2.5">
            <button className="px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 font-medium hover:border-[#1E60ED] hover:text-[#1E60ED] transition-colors shadow-sm">
              Product Data
            </button>
            <div className="relative">
              <button
                onClick={() => setShowBulkManageDropdown(!showBulkManageDropdown)}
                className="px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 font-medium flex items-center gap-1.5 hover:border-[#1E60ED] hover:text-[#1E60ED] transition-colors shadow-sm"
              >
                Bulk Manage <ChevronDown size={14} />
              </button>
              {showBulkManageDropdown && (
                <div className="absolute right-0 top-full mt-1.5 bg-white border border-gray-200 rounded-md shadow-lg z-50 min-w-[180px] py-1 animate-in fade-in slide-in-from-top-2 duration-150">
                  <Link
                    href="/dashboard/seller/products/import"
                    onClick={() => setShowBulkManageDropdown(false)}
                    className="block px-4 py-2 text-gray-700 hover:bg-slate-50 hover:text-[#1E60ED] transition-colors"
                  >
                    Bulk Import / Add
                  </Link>
                  <button
                    onClick={() => {
                      handleExportCSV();
                      setShowBulkManageDropdown(false);
                    }}
                    className="w-full block px-4 py-2 text-left text-gray-700 hover:bg-slate-50 hover:text-[#1E60ED] transition-colors"
                  >
                    Bulk Export (CSV)
                  </button>
                </div>
              )}
            </div>
            <Link
              href="/dashboard/seller/products/create"
              className="px-4 py-2 bg-[#1E60ED] text-white font-semibold rounded-md flex items-center gap-1.5 hover:bg-[#164ec2] transition-colors shadow-sm"
            >
              <Plus size={16} /> New Product
            </Link>
          </div>
        </div>

        {/* ── Store Setup Warning Banner (if no store or store pending) ── */}
        {hasStore === false && (
          <div className="mb-5 p-4 rounded-xl bg-amber-50 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                <Store size={20} className="text-amber-700" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-amber-900">Store Setup Required</h4>
                <p className="text-xs text-amber-700 mt-0.5">
                  You haven&apos;t set up a store yet. You must complete your store registration before uploading products.
                </p>
              </div>
            </div>
            <Link
              href="/dashboard/seller/store/create"
              className="px-4 py-2 bg-[#1E60ED] hover:bg-blue-600 text-white text-xs font-semibold rounded-xl shrink-0 text-center transition-all shadow-xs"
            >
              Set Up Store Now →
            </Link>
          </div>
        )}

        {hasStore === true && hasApprovedStore === false && (
          <div className="mb-5 p-4 rounded-xl bg-blue-50 border border-blue-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                <AlertCircle size={20} className="text-blue-700" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-blue-900">Store Approval Pending</h4>
                <p className="text-xs text-blue-700 mt-0.5">
                  Your store is currently under review. Product creation will be enabled as soon as your store is approved.
                </p>
              </div>
            </div>
            <Link
              href="/dashboard/seller/store"
              className="px-4 py-2 bg-[#1E60ED] hover:bg-blue-600 text-white text-xs font-semibold rounded-xl shrink-0 text-center transition-all shadow-xs"
            >
              View Store Status →
            </Link>
          </div>
        )}

        {/* ── Product Overview Card ── */}
        {showOverview && (
          <div className="mb-5">
            <div className="bg-white rounded-md border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-base font-bold text-gray-800">Product Overview</span>
                <button
                  onClick={() => setShowOverview(false)}
                  className="text-sm text-blue-500 font-medium bg-transparent border-none flex items-center gap-1 hover:text-blue-600 transition-colors"
                >
                  Hide <ChevronUp size={14} />
                </button>
              </div>
              <div>
                <div className="flex items-center justify-between text-gray-600 mb-2">
                  <span>Product Limitation</span>
                  <span className="font-semibold text-gray-800">
                    {products.filter(p => p.status === "Active").length} / 1,000
                  </span>
                </div>
                <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-300"
                    style={{
                      width: `${Math.min((products.filter(p => p.status === "Active").length / 1000) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Tabs bar ── */}
        <div className="overflow-x-auto no-scrollbar mb-4">
          <div className="border-b border-gray-200 flex items-center gap-6 min-w-max px-1">
            {[
              { id: "all", label: "All", count: tabCounts.all },
              { id: "active", label: "Active", count: tabCounts.active },
              { id: "inactive", label: "Inactive", count: tabCounts.inactive },
              { id: "draft", label: "Draft", count: tabCounts.draft },
              { id: "pending", label: "Pending QC", count: tabCounts.pending },
              { id: "violation", label: "Violation", count: tabCounts.violation },
              { id: "deleted", label: "Deleted", count: tabCounts.deleted },
            ].map((tab) => {
              const isTabActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSelectedIds({});
                  }}
                  className={`pb-3 pt-1 text-base border-b-2 font-medium flex items-center gap-1.5 whitespace-nowrap transition-all ${isTabActive
                      ? "border-[#1E60ED] text-[#1E60ED] font-bold"
                      : "border-transparent text-gray-500 hover:text-gray-800"
                    }`}
                >
                  <span>{tab.label}</span>
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className="inline-flex items-center justify-center bg-[#1E60ED] text-white rounded-full w-5 h-5 text-[11px] font-bold">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Filter Box ── */}
        <div className="mb-5">
          <div className="bg-white rounded-md border border-gray-200 p-4 shadow-sm flex flex-col gap-4">
            {/* Filter Buttons */}
            <div className="flex items-center gap-3">
              <span className="font-bold text-gray-500">Filter Product:</span>
              <button
                onClick={() => setOutOfStockOnly(!outOfStockOnly)}
                className={`px-4 py-1.5 rounded text-sm font-medium border transition-colors ${outOfStockOnly
                    ? "border-[#1E60ED] text-[#1E60ED] bg-[#EFF6FF]"
                    : "border-gray-300 text-gray-600 bg-white hover:border-gray-400"
                  }`}
              >
                Out Of Stock
              </button>
            </div>

            {/* Filter Inputs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              {/* Search Inputs */}
              <div className="flex items-center border border-gray-300 rounded-md overflow-hidden focus-within:border-[#1E60ED] transition-colors bg-white">
                <select
                  value={searchField}
                  onChange={(e) => setSearchField(e.target.value as any)}
                  className="border-none border-r border-gray-300 px-3 py-2 text-gray-600 bg-slate-50 outline-none cursor-pointer text-sm"
                >
                  <option value="name">Product Name</option>
                  <option value="id">Product ID</option>
                  <option value="sku">Seller SKU</option>
                </select>
                <div className="flex items-center flex-1 bg-white px-2.5">
                  <input
                    type="text"
                    placeholder="Please Input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full border-none py-2 text-sm outline-none focus:ring-0 bg-transparent text-gray-800"
                  />
                  <Search size={16} className="text-gray-400 shrink-0" />
                </div>
              </div>

              {/* Category Select */}
              <div className="flex items-center gap-2">
                <span className="text-gray-600 whitespace-nowrap shrink-0">Select Category</span>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-600 bg-white outline-none focus:border-[#1E60ED] transition-colors cursor-pointer text-sm"
                >
                  <option value="all">Please Select</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Sort By Select */}
              <div className="flex items-center gap-2">
                <span className="text-gray-600 whitespace-nowrap shrink-0">Sort By</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-600 bg-white outline-none focus:border-[#1E60ED] transition-colors cursor-pointer text-sm"
                >
                  <option value="newest">Please Select</option>
                  <option value="priceAsc">Price Low to High</option>
                  <option value="priceDesc">Price High to Low</option>
                  <option value="stockAsc">Stock Low to High</option>
                  <option value="stockDesc">Stock High to Low</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* ── Table Action Strip ── */}
        <div className="flex items-center gap-3 mb-3 px-1">
          <span className="text-gray-500 font-medium">
            {selectedCount} products selected
          </span>
          {activeTab === "deleted" ? (
            <>
              <button
                onClick={handleBulkRestore}
                disabled={selectedCount === 0}
                className={`px-4 py-1.5 border rounded text-sm font-medium transition-colors ${
                  selectedCount === 0
                    ? "border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed"
                    : "border-gray-300 bg-white text-emerald-600 hover:border-emerald-500 hover:bg-emerald-50"
                }`}
              >
                Restore
              </button>
              <button
                onClick={triggerBulkDelete}
                disabled={selectedCount === 0}
                className={`px-4 py-1.5 border rounded text-sm font-medium transition-colors ${
                  selectedCount === 0
                    ? "border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed"
                    : "border-gray-300 bg-white text-red-500 hover:border-red-500 hover:bg-red-50/50"
                }`}
              >
                Delete Permanently
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleBulkDeactivate}
                disabled={selectedCount === 0}
                className={`px-4 py-1.5 border rounded text-sm font-medium transition-colors ${
                  selectedCount === 0
                    ? "border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed"
                    : "border-gray-300 bg-white text-gray-700 hover:border-[#1E60ED] hover:text-[#1E60ED]"
                }`}
              >
                Deactivate
              </button>
              <button
                onClick={triggerBulkDelete}
                disabled={selectedCount === 0}
                className={`px-4 py-1.5 border rounded text-sm font-medium transition-colors ${
                  selectedCount === 0
                    ? "border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed"
                    : "border-gray-300 bg-white text-red-500 hover:border-red-500 hover:bg-red-50/50"
                }`}
              >
                Delete
              </button>
            </>
          )}
          <button
            onClick={handleExportCSV}
            className="px-4 py-1.5 border border-[#1E60ED] bg-white text-[#1E60ED] rounded text-sm font-medium flex items-center gap-1 hover:bg-[#EFF6FF] transition-colors ml-auto shadow-sm"
          >
            Export <ChevronDown size={14} />
          </button>
        </div>

        {/* ── Table Container ── */}
        <div className="bg-white rounded-md border border-gray-200 shadow-sm overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-gray-200 text-gray-700 font-bold">
                <th className="w-10 px-4 py-3.5">
                  <input
                    type="checkbox"
                    checked={filteredProducts.length > 0 && selectedCount === filteredProducts.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded text-[#1E60ED] focus:ring-[#1E60ED] cursor-pointer"
                  />
                </th>
                <th className="px-4 py-3.5 font-bold text-sm text-slate-700">Product Info</th>
                <th className="px-4 py-3.5 font-bold text-sm text-slate-700 w-40">Price</th>
                <th className="px-4 py-3.5 font-bold text-sm text-slate-700 w-28">
                  Stock <HelpCircle size={14} className="inline ml-0.5 text-gray-400 align-text-bottom" />
                </th>
                <th className="px-4 py-3.5 font-bold text-sm text-slate-700 w-24">Active</th>
                <th className="px-4 py-3.5 font-bold text-sm text-slate-700 w-52">Content Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    No products found.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isChecked = !!selectedIds[p.id];
                  const isActive = p.status === "Active";
                  const isDeleted = p.status === "Deleted";

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-slate-50/80 transition-colors ${isChecked ? "bg-slate-50/50" : ""}`}
                    >
                      {/* Checkbox */}
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => handleSelectRow(p.id, e.target.checked)}
                          className="rounded text-[#1E60ED] focus:ring-[#1E60ED] cursor-pointer"
                        />
                      </td>

                      {/* Product Info */}
                      <td className="px-4 py-4">
                        <div className="flex gap-3">
                          {/* Image */}
                          <div className="w-14 h-14 rounded border border-gray-200 overflow-hidden bg-slate-50 shrink-0">
                            <img
                              src={getImagePath(p.photo)}
                              alt={p.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          {/* Details */}
                          <div className="flex flex-col gap-1 min-w-0">
                            <span
                              className="font-semibold text-gray-800 text-sm leading-snug truncate max-w-[320px] md:max-w-[420px]"
                              title={p.name}
                            >
                              {p.name}
                            </span>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-gray-400 text-xs">
                              <span className="flex items-center gap-1">
                                Product Id: <span className="text-gray-700">{p.id.slice(0, 10)}...</span>
                                <Copy
                                  size={12}
                                  className="cursor-pointer text-gray-400 hover:text-gray-700 transition-colors"
                                  onClick={() => copyToClipboard(p.id)}
                                />
                              </span>
                              <span className="flex items-center gap-1">
                                Seller Sku: <span className="text-gray-700">{p.articleCode || "N/A"}</span>
                                {p.articleCode && (
                                  <Copy
                                    size={12}
                                    className="cursor-pointer text-gray-400 hover:text-gray-700 transition-colors"
                                    onClick={() => copyToClipboard(p.articleCode!)}
                                  />
                                )}
                              </span>
                            </div>

                            {/* Stats Icons & Badges */}
                            <div className="flex items-center gap-4 mt-1">
                              <div className="flex items-center gap-1">
                                <span className="text-[11px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">Desktop</span>
                                <span className="text-[11px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">Mobile</span>
                              </div>

                              <div className="flex items-center gap-3 text-gray-400 text-xs">
                                <span className="flex items-center gap-1">
                                  <MessageSquare size={13} className="text-gray-400" />
                                  <span className="text-gray-600">0</span>
                                </span>
                                <span className="flex items-center gap-1">
                                  <Heart size={13} className="text-gray-400" />
                                  <span className="text-gray-600">0</span>
                                </span>
                                <span className="flex items-center gap-0.5">
                                  <Eye size={13} className="text-gray-400" />
                                  <span className="text-gray-600">1</span>
                                  <ChevronRight size={10} />
                                </span>
                                <span className="flex items-center gap-0.5">
                                  <Star size={13} className="text-gray-400" />
                                  <span className="text-gray-600">0</span>
                                  <ChevronRight size={10} />
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="px-4 py-4 align-middle">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1 group cursor-pointer" onClick={() => startEditingPrice(p)}>
                            <span className="font-bold text-gray-800 text-base group-hover:text-[#1E60ED] transition-colors">
                              ৳{p.price.toFixed(2)}
                            </span>
                            <Pencil size={12} className="text-gray-400 group-hover:text-[#1E60ED] transition-colors opacity-0 group-hover:opacity-100" />
                          </div>
                          {p.tp && (
                            <div className="flex items-center gap-1 text-gray-400 cursor-pointer group" onClick={() => startEditingPrice(p)}>
                              <Calendar size={12} />
                              <span className="line-through text-xs group-hover:text-[#1E60ED]">
                                ৳{p.tp.toFixed(2)}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Stock */}
                      <td className="px-4 py-4 align-middle">
                        <div className="flex items-center gap-1 group cursor-pointer" onClick={() => startEditingStock(p)}>
                          <span className="font-bold text-gray-800 text-base group-hover:text-[#1E60ED] transition-colors">
                            {p.stock}
                          </span>
                          <Pencil size={12} className="text-gray-400 group-hover:text-[#1E60ED] transition-colors opacity-0 group-hover:opacity-100" />
                        </div>
                      </td>

                      {/* Active Status Toggle */}
                      <td className="px-4 py-4 align-middle">
                        <label className="relative inline-flex items-center cursor-pointer select-none">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={isActive}
                            onChange={() => handleToggleActive(p.id, p.status)}
                          />
                          <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#1E60ED]" />
                        </label>
                      </td>

                      {/* Action Menu */}
                      <td className="px-4 py-4 align-middle">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`w-2 h-2 rounded-full ${p.stock > 0 ? "bg-amber-400" : "bg-red-500"}`}
                            />
                            <span className="text-xs text-gray-600 flex items-center gap-0.5">
                              {p.stock > 0 ? "To be Improved" : "Out of Stock"}
                              <HelpCircle size={13} className="text-gray-400" />
                            </span>
                          </div>

                          <div className="flex items-center gap-3 relative">
                            <Link
                              href={`/dashboard/seller/products/${p.id}?view=true`}
                              className="text-gray-500 hover:text-[#1E60ED] transition-colors"
                              title="View Details"
                            >
                              <Eye size={16} />
                            </Link>

                            <Link
                              href={`/dashboard/seller/products/${p.id}`}
                              className="text-blue-500 font-semibold text-xs hover:underline"
                            >
                              Edit
                            </Link>

                            <button
                              onClick={() => setActiveDropdownRow(activeDropdownRow === p.id ? null : p.id)}
                              className="text-blue-500 font-semibold text-xs flex items-center gap-0.5"
                            >
                              More <ChevronDown size={13} />
                            </button>

                            {/* Row Dropdown */}
                            {activeDropdownRow === p.id && (
                              <div className="absolute right-0 top-full mt-1.5 bg-white border border-gray-200 rounded-md shadow-lg z-40 min-w-[130px] py-1 animate-in fade-in zoom-in-95 duration-100">
                                <button
                                  onClick={() => {
                                    copyToClipboard(p.id);
                                    setActiveDropdownRow(null);
                                  }}
                                  className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-slate-50 hover:text-[#1E60ED] transition-colors"
                                >
                                  Copy ID
                                </button>
                                <button
                                  onClick={() => {
                                    setShowStockAlertId(p.id);
                                    setStockAlertStatus(true);
                                    setStockAlertThreshold(10);
                                    setActiveDropdownRow(null);
                                  }}
                                  className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-slate-50 hover:text-[#1E60ED] transition-colors"
                                >
                                  Create Alert
                                </button>
                                {isDeleted && (
                                  <button
                                    onClick={async () => {
                                      const success = await UpdateProductStatus(p.id, "Active");
                                      if (success) {
                                        setProducts((prev) =>
                                          prev.map((item) => (item.id === p.id ? { ...item, status: "Active" } : item))
                                        );
                                        toast.success("Product restored to Active successfully");
                                      } else {
                                        toast.error("Failed to restore product");
                                      }
                                      setActiveDropdownRow(null);
                                    }}
                                    className="w-full text-left px-3 py-1.5 text-xs text-emerald-600 hover:bg-emerald-50 transition-colors"
                                  >
                                    Restore
                                  </button>
                                )}
                                <button
                                  onClick={() => {
                                    handleSingleDelete(p.id, isDeleted);
                                    setActiveDropdownRow(null);
                                  }}
                                  className="w-full text-left px-3 py-1.5 text-xs text-red-500 hover:bg-red-50 transition-colors"
                                >
                                  {isDeleted ? "Delete Permanently" : "Delete"}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── Edit Price Modal ── */}
        {editingPriceId && editingProduct && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[1000] p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200">
                <h2 className="text-base font-bold text-gray-800">Edit Price</h2>
                <button onClick={() => setEditingPriceId(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <X size={18} />
                </button>
              </div>
              <div className="p-5">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-[11px] text-gray-500 font-bold uppercase tracking-wider border-b border-gray-200">
                      <th className="py-2.5 px-3 w-[45%]">Product Info</th>
                      <th className="py-2.5 px-3 w-[27%]">Retail Price</th>
                      <th className="py-2.5 px-3 w-[28%]">Discount Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="py-3 px-3 flex gap-2.5 items-start">
                        <div className="w-11 h-11 border border-gray-200 rounded overflow-hidden shrink-0 bg-slate-50">
                          <img src={getImagePath(editingProduct.photo)} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex flex-col min-w-0 text-xs">
                          <span className="font-semibold text-gray-800 truncate max-w-[180px]">{editingProduct.name}</span>
                          <span className="text-gray-400">SKU: {editingProduct.articleCode || "N/A"}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center border border-gray-300 rounded px-2 py-1 focus-within:border-[#1E60ED] transition-colors bg-white">
                          <span className="text-gray-400 text-xs mr-1">৳</span>
                          <input
                            type="number"
                            value={editingPriceVal}
                            onChange={(e) => setEditingPriceVal(Number(e.target.value))}
                            className="w-full text-xs font-mono border-none outline-none focus:ring-0 p-0 text-gray-800"
                          />
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center border border-gray-300 rounded px-2 py-1 focus-within:border-[#1E60ED] transition-colors bg-white">
                          <span className="text-gray-400 text-xs mr-1">৳</span>
                          <input
                            type="number"
                            value={editingPriceTpVal ?? ""}
                            onChange={(e) => setEditingPriceTpVal(e.target.value === "" ? null : Number(e.target.value))}
                            placeholder="No promo"
                            className="w-full text-xs font-mono border-none outline-none focus:ring-0 p-0 text-gray-800"
                          />
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-end gap-2 px-5 py-3.5 bg-slate-50 border-t border-gray-200">
                <button
                  onClick={() => setEditingPriceId(null)}
                  disabled={isSaving}
                  className="px-4 py-1.5 border border-gray-300 text-xs font-semibold text-gray-600 rounded bg-white hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSavePrice(editingPriceId)}
                  disabled={isSaving}
                  className="px-5 py-1.5 bg-[#1E60ED] hover:bg-[#164ec2] disabled:bg-blue-300 text-xs font-semibold text-white rounded transition-colors shadow-sm"
                >
                  {isSaving ? "Saving..." : "OK"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Edit Stock Modal ── */}
        {editingStockId && editingStockProduct && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[1000] p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200">
                <h2 className="text-base font-bold text-gray-800">Edit Stock</h2>
                <button onClick={() => setEditingStockId(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <X size={18} />
                </button>
              </div>
              <div className="p-5">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-[11px] text-gray-500 font-bold uppercase tracking-wider border-b border-gray-200">
                      <th className="py-2.5 px-3 w-[45%]">Product Info</th>
                      <th className="py-2.5 px-3 w-[27%]">Warehouse</th>
                      <th className="py-2.5 px-3 w-[28%]">Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100 bg-slate-50/50">
                      <td className="py-3 px-3 flex gap-2.5 items-start">
                        <div className="w-11 h-11 border border-gray-200 rounded overflow-hidden shrink-0 bg-slate-50">
                          <img src={getImagePath(editingStockProduct.photo)} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex flex-col min-w-0 text-xs">
                          <span className="font-semibold text-gray-800 truncate max-w-[180px]">{editingStockProduct.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-xs font-bold text-gray-700">All Warehouse</td>
                      <td className="py-3 px-3 text-xs font-bold text-gray-700">{editingStockVal}</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-3"></td>
                      <td className="py-3 px-3 text-xs text-gray-600 pl-4">Main Warehouse</td>
                      <td className="py-3 px-3">
                        <input
                          type="number"
                          value={editingStockVal}
                          onChange={(e) => setEditingStockVal(Number(e.target.value))}
                          className="w-24 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:border-[#1E60ED] font-mono text-gray-800"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-end gap-2 px-5 py-3.5 bg-slate-50 border-t border-gray-200">
                <button
                  onClick={() => setEditingStockId(null)}
                  disabled={isSaving}
                  className="px-4 py-1.5 border border-gray-300 text-xs font-semibold text-gray-600 rounded bg-white hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSaveStock(editingStockId)}
                  disabled={isSaving}
                  className="px-5 py-1.5 bg-[#1E60ED] hover:bg-[#164ec2] disabled:bg-blue-300 text-xs font-semibold text-white rounded transition-colors shadow-sm"
                >
                  {isSaving ? "Saving..." : "OK"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Create Stock Alert Modal ── */}
        {showStockAlertId && stockAlertProduct && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[1000] p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200">
                <div className="flex flex-col">
                  <h2 className="text-base font-bold text-gray-800">Create Stock Alert</h2>
                  <p className="text-[11px] text-gray-400 mt-0.5">Notify when stock drops below threshold.</p>
                </div>
                <button onClick={() => setShowStockAlertId(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <X size={18} />
                </button>
              </div>
              <div className="p-5">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-[11px] text-gray-500 font-bold uppercase tracking-wider border-b border-gray-200">
                      <th className="py-2.5 px-3 w-[45%]">Product Info</th>
                      <th className="py-2.5 px-3 w-[25%]">Alert Status</th>
                      <th className="py-2.5 px-3 w-[30%]">Threshold Quantity</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="py-3 px-3 flex gap-2.5 items-start">
                        <div className="w-11 h-11 border border-gray-200 rounded overflow-hidden shrink-0 bg-slate-50">
                          <img src={getImagePath(stockAlertProduct.photo)} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex flex-col min-w-0 text-xs">
                          <span className="font-semibold text-gray-800 truncate max-w-[180px]">{stockAlertProduct.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <label className="relative inline-flex items-center cursor-pointer select-none">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={stockAlertStatus}
                            onChange={(e) => setStockAlertStatus(e.target.checked)}
                          />
                          <div className="w-8 h-4 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#1E60ED]" />
                        </label>
                      </td>
                      <td className="py-3 px-3">
                        <input
                          type="number"
                          value={stockAlertThreshold}
                          onChange={(e) => setStockAlertThreshold(Number(e.target.value))}
                          disabled={!stockAlertStatus}
                          className="w-24 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:border-[#1E60ED] font-mono text-gray-800 disabled:bg-gray-100 disabled:text-gray-400"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-end gap-2 px-5 py-3.5 bg-slate-50 border-t border-gray-200">
                <button
                  onClick={() => setShowStockAlertId(null)}
                  className="px-4 py-1.5 border border-gray-300 text-xs font-semibold text-gray-600 rounded bg-white hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    toast.success(`Stock alert ${stockAlertStatus ? "enabled" : "disabled"} with threshold ${stockAlertThreshold}`);
                    setShowStockAlertId(null);
                  }}
                  className="px-5 py-1.5 bg-[#1E60ED] hover:bg-[#164ec2] text-xs font-semibold text-white rounded transition-colors shadow-sm"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
        {/* ── Custom Delete Confirm Modal ── */}
        {deleteConfirmOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[1000] p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200">
                <h2 className="text-base font-bold text-gray-800">
                  {deleteConfirmIsTrash ? "Permanently Delete" : "Move to Trash"}
                </h2>
                <button
                  onClick={() => setDeleteConfirmOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="p-5">
                <p className="text-sm text-gray-600 leading-relaxed">
                  {deleteConfirmType === "single"
                    ? deleteConfirmIsTrash
                      ? "Are you sure you want to permanently delete this product? This action cannot be undone."
                      : "Are you sure you want to move this product to Trash? You can restore it later if needed."
                    : deleteConfirmIsTrash
                    ? "Are you sure you want to permanently delete the selected products? This action cannot be undone."
                    : "Are you sure you want to move the selected products to Trash? You can restore them later if needed."}
                </p>
              </div>
              <div className="flex items-center justify-end gap-2 px-5 py-3.5 bg-slate-50 border-t border-gray-200">
                <button
                  onClick={() => setDeleteConfirmOpen(false)}
                  disabled={isSaving}
                  className="px-4 py-1.5 border border-gray-300 text-xs font-semibold text-gray-600 rounded bg-white hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={executeDelete}
                  disabled={isSaving}
                  className={`px-5 py-1.5 text-xs font-semibold text-white rounded transition-colors shadow-sm ${
                    deleteConfirmIsTrash
                      ? "bg-red-500 hover:bg-red-600 disabled:bg-red-300"
                      : "bg-[#1E60ED] hover:bg-[#164ec2] disabled:bg-blue-300"
                  }`}
                >
                  {isSaving
                    ? "Processing..."
                    : deleteConfirmIsTrash
                    ? "Delete Permanently"
                    : "Move to Trash"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}