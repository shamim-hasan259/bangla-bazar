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
} from "lucide-react";
import { toast } from "sonner";
import {
  UpdateProductStatus,
  handleDelete,
  UpdateProductPrice,
  UpdateProductStock,
} from "@/app/dashboard/seller/products/_action";

type Product = {
  id: string;
  name: string;
  photo: any;
  status?: "Active" | "Inactive" | "Deleted" | "Draft" | "Pending";
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
  createdAt?: Date | string;
  category?: {
    name: string;
  } | null;
  unit?: {
    name: string;
    symbol: string;
  } | null;
};

interface StoreProductsManagerProps {
  storeId: string;
  initialProducts: Product[];
  storeName: string;
}

export default function StoreProductsManager({
  storeId,
  initialProducts,
  storeName,
}: StoreProductsManagerProps) {
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
    setEditingStockId(null);
  };

  const startEditingStock = (product: Product) => {
    setEditingStockId(product.id);
    setEditingStockVal(product.stock);
    setEditingPriceId(null);
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
    } catch {
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
    } catch {
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
          p.status || "Active",
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
    link.setAttribute("download", `${storeName.toLowerCase().replace(/\s+/g, "_")}_products_${new Date().toISOString().slice(0, 10)}.csv`);
    link.className = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Store products exported successfully");
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
      const st = p.status || "Active";
      if (st !== "Deleted") counts.all++;
      if (st === "Active") counts.active++;
      if (st === "Inactive") counts.inactive++;
      if (st === "Draft") counts.draft++;
      if (st === "Pending") counts.pending++;
      if (st === "Deleted") counts.deleted++;
    });

    return counts;
  }, [products]);

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => {
      const st = p.status || "Active";
      if (activeTab === "all") return st !== "Deleted";
      if (activeTab === "active") return st === "Active";
      if (activeTab === "inactive") return st === "Inactive";
      if (activeTab === "draft") return st === "Draft";
      if (activeTab === "pending") return st === "Pending";
      if (activeTab === "violation") return false;
      if (activeTab === "deleted") return st === "Deleted";
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

  const handleToggleActive = async (id: string, currentStatus?: string) => {
    const st = currentStatus || "Active";
    const newStatus = st === "Active" ? "Inactive" : "Active";
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: newStatus as any } : p))
    );

    try {
      const success = await UpdateProductStatus(id, newStatus);
      if (success) {
        toast.success(`Product marked as ${newStatus}`);
      } else {
        setProducts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, status: st as any } : p))
        );
        toast.error("Failed to update status");
      }
    } catch {
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: st as any } : p))
      );
      toast.error("An error occurred");
    }
  };

  const handleBulkDeactivate = async () => {
    const ids = Object.keys(selectedIds);
    if (ids.length === 0) return;
    setIsSaving(true);
    let count = 0;
    try {
      for (const id of ids) {
        const success = await UpdateProductStatus(id, "Inactive");
        if (success) {
          setProducts((prev) =>
            prev.map((p) => (p.id === id ? { ...p, status: "Inactive" } : p))
          );
          count++;
        }
      }
      toast.success(`Deactivated ${count} products`);
      setSelectedIds({});
    } catch {
      toast.error("Error deactivating products");
    } finally {
      setIsSaving(false);
    }
  };

  const handleBulkRestore = async () => {
    const ids = Object.keys(selectedIds);
    if (ids.length === 0) return;
    setIsSaving(true);
    let count = 0;
    try {
      for (const id of ids) {
        const success = await UpdateProductStatus(id, "Active");
        if (success) {
          setProducts((prev) =>
            prev.map((p) => (p.id === id ? { ...p, status: "Active" } : p))
          );
          count++;
        }
      }
      toast.success(`Restored ${count} products to Active`);
      setSelectedIds({});
    } catch {
      toast.error("Error restoring products");
    } finally {
      setIsSaving(false);
    }
  };

  const triggerBulkDelete = () => {
    const ids = Object.keys(selectedIds);
    if (ids.length === 0) return;
    setDeleteConfirmType("bulk");
    setDeleteConfirmIsTrash(activeTab === "deleted");
    setTargetDeleteId(null);
    setDeleteConfirmOpen(true);
  };

  const handleSingleDelete = (id: string, isDeleted: boolean) => {
    setDeleteConfirmType("single");
    setDeleteConfirmIsTrash(isDeleted);
    setTargetDeleteId(id);
    setDeleteConfirmOpen(true);
  };

  const confirmExecuteDelete = async () => {
    setIsSaving(true);
    setDeleteConfirmOpen(false);

    try {
      if (deleteConfirmType === "single" && targetDeleteId) {
        if (deleteConfirmIsTrash) {
          const success = await handleDelete(targetDeleteId);
          if (success) {
            setProducts((prev) => prev.filter((p) => p.id !== targetDeleteId));
            toast.success("Product permanently deleted");
          } else {
            toast.error("Failed to delete product permanently");
          }
        } else {
          const success = await UpdateProductStatus(targetDeleteId, "Deleted");
          if (success) {
            setProducts((prev) =>
              prev.map((p) => (p.id === targetDeleteId ? { ...p, status: "Deleted" } : p))
            );
            toast.success("Product moved to trash");
          } else {
            toast.error("Failed to move product to trash");
          }
        }
      } else if (deleteConfirmType === "bulk") {
        const ids = Object.keys(selectedIds);
        let processedCount = 0;

        if (deleteConfirmIsTrash) {
          for (const id of ids) {
            const success = await handleDelete(id);
            if (success) {
              setProducts((prev) => prev.filter((p) => p.id !== id));
              processedCount++;
            }
          }
          toast.success(`Successfully deleted ${processedCount} products permanently`);
        } else {
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
    } catch {
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
      <div className="w-full flex flex-col">

        {/* ── Heading Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
              Manage Store Products
            </h1>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Storefront: {storeName}</p>
          </div>
          
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
                    href={`/dashboard/seller/store-dashboard/${storeId}/products/create`}
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
              href={`/dashboard/seller/store-dashboard/${storeId}/products/create`}
              className="px-4 py-2 bg-[#1E60ED] text-white font-semibold rounded-md flex items-center gap-1.5 hover:bg-[#164ec2] transition-colors shadow-sm"
            >
              <Plus size={16} /> New Product
            </Link>
          </div>
        </div>

        {/* ── Product Overview Card ── */}
        {showOverview && (
          <div className="mb-5">
            <div className="bg-white rounded-md border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-base font-bold text-gray-800">Store Product Overview</span>
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
                    {products.filter((p) => (p.status || "Active") === "Active").length} / 1,000
                  </span>
                </div>
                <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-300"
                    style={{
                      width: `${Math.min((products.filter((p) => (p.status || "Active") === "Active").length / 1000) * 100, 100)}%`,
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
                  className={`pb-3 pt-1 text-base border-b-2 font-medium flex items-center gap-1.5 whitespace-nowrap transition-all ${
                    isTabActive
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
                className={`px-4 py-1.5 rounded text-sm font-medium border transition-colors ${
                  outOfStockOnly
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
                    <option key={c} value={c}>
                      {c}
                    </option>
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
                    No products found for this store.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isChecked = !!selectedIds[p.id];
                  const st = p.status || "Active";
                  const isActive = st === "Active";
                  const isDeleted = st === "Deleted";

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
                              href={`/dashboard/seller/store-dashboard/${storeId}/products/edit/${p.id}?view=true`}
                              className="text-gray-500 hover:text-[#1E60ED] transition-colors"
                              title="View Details"
                            >
                              <Eye size={16} />
                            </Link>

                            <Link
                              href={`/dashboard/seller/store-dashboard/${storeId}/products/edit/${p.id}`}
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
            <div className="bg-white rounded-lg border border-gray-200 shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <span className="font-bold text-gray-800 text-lg">Edit Price</span>
                <button
                  onClick={() => setEditingPriceId(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex gap-3 items-center p-3 bg-slate-50 rounded-md border border-gray-100">
                  <img
                    src={getImagePath(editingProduct.photo)}
                    alt=""
                    className="w-12 h-12 rounded object-cover border border-gray-200"
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-gray-800 truncate">{editingProduct.name}</span>
                    <span className="text-xs text-gray-500">ID: {editingProduct.id}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-700">Selling Price (৳)</label>
                    <input
                      type="number"
                      value={editingPriceVal}
                      onChange={(e) => setEditingPriceVal(parseFloat(e.target.value) || 0)}
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-[#1E60ED] focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-700">Promo / TP Price (৳)</label>
                    <input
                      type="number"
                      value={editingPriceTpVal ?? ""}
                      onChange={(e) =>
                        setEditingPriceTpVal(e.target.value ? parseFloat(e.target.value) : null)
                      }
                      placeholder="Optional"
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-[#1E60ED] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200">
                <button
                  onClick={() => setEditingPriceId(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-600 font-medium hover:bg-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSavePrice(editingPriceId)}
                  disabled={isSaving}
                  className="px-5 py-2 bg-[#1E60ED] text-white font-semibold rounded-md hover:bg-[#164ec2] transition-colors disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Edit Stock Modal ── */}
        {editingStockId && editingStockProduct && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[1000] p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-lg border border-gray-200 shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <span className="font-bold text-gray-800 text-lg">Edit Available Stock</span>
                <button
                  onClick={() => setEditingStockId(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex gap-3 items-center p-3 bg-slate-50 rounded-md border border-gray-100">
                  <img
                    src={getImagePath(editingStockProduct.photo)}
                    alt=""
                    className="w-12 h-12 rounded object-cover border border-gray-200"
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-gray-800 truncate">{editingStockProduct.name}</span>
                    <span className="text-xs text-gray-500">ID: {editingStockProduct.id}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-700">Stock Quantity</label>
                  <input
                    type="number"
                    min="0"
                    value={editingStockVal}
                    onChange={(e) => setEditingStockVal(parseInt(e.target.value) || 0)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-[#1E60ED] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200">
                <button
                  onClick={() => setEditingStockId(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-600 font-medium hover:bg-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSaveStock(editingStockId)}
                  disabled={isSaving}
                  className="px-5 py-2 bg-[#1E60ED] text-white font-semibold rounded-md hover:bg-[#164ec2] transition-colors disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : "Save Stock"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Stock Alert Modal ── */}
        {showStockAlertId && stockAlertProduct && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[1000] p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-lg border border-gray-200 shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <span className="font-bold text-gray-800 text-lg">Stock Alert Setting</span>
                <button
                  onClick={() => setShowStockAlertId(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex gap-3 items-center p-3 bg-slate-50 rounded-md border border-gray-100">
                  <img
                    src={getImagePath(stockAlertProduct.photo)}
                    alt=""
                    className="w-12 h-12 rounded object-cover border border-gray-200"
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-gray-800 truncate">{stockAlertProduct.name}</span>
                    <span className="text-xs text-gray-500">
                      Current Stock: <strong className="text-gray-800">{stockAlertProduct.stock}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">Enable Stock Alert</span>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={stockAlertStatus}
                      onChange={(e) => setStockAlertStatus(e.target.checked)}
                    />
                    <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#1E60ED]" />
                  </label>
                </div>

                {stockAlertStatus && (
                  <div className="flex flex-col gap-1.5 animate-in fade-in duration-150">
                    <label className="text-xs font-semibold text-gray-700">Low Stock Alert Threshold</label>
                    <input
                      type="number"
                      min="1"
                      value={stockAlertThreshold}
                      onChange={(e) => setStockAlertThreshold(parseInt(e.target.value) || 1)}
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-[#1E60ED] focus:outline-none"
                    />
                    <span className="text-xs text-gray-400">
                      You will receive a notification when stock falls below this threshold.
                    </span>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200">
                <button
                  onClick={() => setShowStockAlertId(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-600 font-medium hover:bg-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    toast.success("Stock alert setting saved");
                    setShowStockAlertId(null);
                  }}
                  className="px-5 py-2 bg-[#1E60ED] text-white font-semibold rounded-md hover:bg-[#164ec2] transition-colors"
                >
                  Save Alert
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Custom Delete Confirmation Modal ── */}
        {deleteConfirmOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[1000] p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-lg border border-gray-200 shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <span className="font-bold text-gray-800 text-lg">
                  {deleteConfirmIsTrash ? "Confirm Permanent Deletion" : "Confirm Move to Trash"}
                </span>
                <button
                  onClick={() => setDeleteConfirmOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-3">
                <p className="text-gray-600 text-sm leading-relaxed">
                  {deleteConfirmIsTrash ? (
                    <>
                      Are you sure you want to <strong>permanently delete</strong>{" "}
                      {deleteConfirmType === "bulk" ? `${selectedCount} selected products` : "this product"}?
                      This action cannot be undone.
                    </>
                  ) : (
                    <>
                      Are you sure you want to move{" "}
                      {deleteConfirmType === "bulk" ? `${selectedCount} selected products` : "this product"} to
                      trash? You can restore it later from the <strong>Deleted</strong> tab.
                    </>
                  )}
                </p>
              </div>

              <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200">
                <button
                  onClick={() => setDeleteConfirmOpen(false)}
                  disabled={isSaving}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-600 font-medium hover:bg-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmExecuteDelete}
                  disabled={isSaving}
                  className="px-5 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {isSaving ? "Deleting..." : deleteConfirmIsTrash ? "Delete Permanently" : "Move to Trash"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
