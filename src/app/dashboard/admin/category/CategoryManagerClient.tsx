"use client";

import React, { useState } from "react";
import { UserDataTable } from "./data-table";
import { columns } from "./columns";
import { 
  Layers, 
  CheckCircle, 
  Folder, 
  Plus, 
  ArrowLeft, 
  LayoutGrid, 
  List, 
  ChevronRight, 
  Search, 
  Edit, 
  Trash2 
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import EditCategorySheet from "./editCategorySheet";
import { handleDelete } from "./_action";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { useRouter } from "next/navigation";

interface Category {
  id: string;
  name: string;
  photo?: string | null;
  status: "Active" | "Inactive";
  code: string;
  parentId: string | null;
  description?: string | null;
  parent?: {
    name: string;
  } | null;
}

interface CategoryManagerClientProps {
  initialCategories: Category[];
  totalCategories: number;
  activeCategories: number;
  parentCategories: number;
}

export default function CategoryManagerClient({
  initialCategories,
  totalCategories,
  activeCategories,
  parentCategories,
}: CategoryManagerClientProps) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<"table" | "browser">("table");
  
  // Selection states for Visual browser
  const [sel1, setSel1] = useState<Category | null>(null);
  const [sel2, setSel2] = useState<Category | null>(null);
  const [sel3, setSel3] = useState<Category | null>(null);
  const [sel4, setSel4] = useState<Category | null>(null);

  // Filters for each level
  const [q1, setQ1] = useState("");
  const [q2, setQ2] = useState("");
  const [q3, setQ3] = useState("");
  const [q4, setQ4] = useState("");

  // Edit action sheet states
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editSheetOpen, setEditSheetOpen] = useState(false);

  // Compute levels
  const level1Cats = initialCategories.filter((c) => c.parentId === null);
  const level2Cats = sel1 ? initialCategories.filter((c) => c.parentId === sel1.id) : [];
  const level3Cats = sel2 ? initialCategories.filter((c) => c.parentId === sel2.id) : [];
  const level4Cats = sel3 ? initialCategories.filter((c) => c.parentId === sel3.id) : [];

  const filteredL1 = level1Cats.filter((c) => c.name.toLowerCase().includes(q1.toLowerCase()));
  const filteredL2 = level2Cats.filter((c) => c.name.toLowerCase().includes(q2.toLowerCase()));
  const filteredL3 = level3Cats.filter((c) => c.parentId === sel2?.id && c.name.toLowerCase().includes(q3.toLowerCase()));
  const filteredL4 = level4Cats.filter((c) => c.parentId === sel3?.id && c.name.toLowerCase().includes(q4.toLowerCase()));

  const hasChildren = (catId: string) => {
    return initialCategories.some((c) => c.parentId === catId);
  };

  const handleEditClick = (cat: Category) => {
    setEditingCategory(cat);
    setEditSheetOpen(true);
  };

  const handleDeleteClick = async (id: string) => {
    if (confirm("Are you sure you want to delete this category?")) {
      const success = await handleDelete(id);
      if (success) {
        toast.success("Category deleted successfully!");
        
        // Reset selections if the deleted category is selected
        if (sel1?.id === id) { setSel1(null); setSel2(null); setSel3(null); setSel4(null); }
        else if (sel2?.id === id) { setSel2(null); setSel3(null); setSel4(null); }
        else if (sel3?.id === id) { setSel3(null); setSel4(null); }
        else if (sel4?.id === id) { setSel4(null); }
        
        router.refresh();
      } else {
        toast.error("Failed to delete category.");
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/admin/products">
            <Button variant="outline" size="icon" className="rounded-xl h-10 w-10 border-slate-200/60 dark:border-slate-800/60 bg-white hover:bg-slate-50">
              <ArrowLeft className="h-4 w-4 text-slate-600" />
            </Button>
          </Link>
          <div className="flex flex-col">
            <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Category Management</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Organize and manage your product categories and classification tree.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* View Toggles */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
            <button
              onClick={() => setViewMode("table")}
              className={cn(
                "p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all duration-150",
                viewMode === "table"
                  ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              )}
            >
              <List size={14} /> List View
            </button>
            <button
              onClick={() => setViewMode("browser")}
              className={cn(
                "p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all duration-150",
                viewMode === "browser"
                  ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              )}
            >
              <LayoutGrid size={14} /> Column Browser
            </button>
          </div>

          <Link href="/dashboard/admin/category/create">
            <Button className="rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold px-4 py-2 flex items-center gap-1.5 shadow-md transition-all">
              <Plus className="h-4 w-4" /> Add Category
            </Button>
          </Link>
        </div>
      </div>

      {/* Dashboard Stat Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Card 1: Total Categories */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/60 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">Total Categories</p>
              <p className="text-3xl font-black text-slate-800 dark:text-slate-100">{totalCategories}</p>
            </div>
            <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
              <Layers className="h-6 w-6" />
            </div>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
        </div>

        {/* Card 2: Active Categories */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/60 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">Active Status</p>
              <p className="text-3xl font-black text-slate-800 dark:text-slate-100">{activeCategories}</p>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <CheckCircle className="h-6 w-6" />
            </div>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
        </div>

        {/* Card 3: Parent Categories */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/60 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">Parent Categories</p>
              <p className="text-3xl font-black text-slate-800 dark:text-slate-100">{parentCategories}</p>
            </div>
            <div className="rounded-2xl bg-sky-50 p-3 text-[#2563eb] dark:bg-sky-950/50 dark:text-sky-400">
              <Folder className="h-6 w-6" />
            </div>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-sky-500 to-blue-500" />
        </div>
      </div>

      {/* Main Section */}
      {viewMode === "table" ? (
        <div className="rounded-2xl border border-slate-200/60 bg-white/40 dark:border-slate-800/60 dark:bg-slate-900/20 p-6 backdrop-blur-md shadow-sm">
          <UserDataTable columns={columns} data={initialCategories} />
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200/60 bg-white p-6 dark:border-slate-800/60 dark:bg-slate-900 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Visual Hierarchy Explorer (4-Columns)
            </h3>
            <span className="text-xs text-slate-400">Hover over folders to edit or delete them</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[450px] border border-slate-150 dark:border-slate-800 rounded-2xl p-4 bg-slate-50/50 dark:bg-slate-950/20">
            {/* Column 1 */}
            <div className="flex flex-col bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-xl overflow-hidden shadow-sm">
              <div className="p-2 border-b border-slate-100 dark:border-slate-800 relative">
                <Search className="absolute left-4 top-3.5 text-slate-400" size={12} />
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
                  <div className="p-4 text-center text-xs text-slate-400">No categories found</div>
                ) : (
                  filteredL1.map((cat) => {
                    const isSelected = sel1?.id === cat.id;
                    const hasSub = hasChildren(cat.id);
                    return (
                      <div
                        key={cat.id}
                        onClick={() => {
                          setSel1(cat);
                          setSel2(null);
                          setSel3(null);
                          setSel4(null);
                        }}
                        className={cn(
                          "group w-full text-left px-3 py-2.5 text-xs font-normal rounded-md transition flex items-center justify-between cursor-pointer",
                          isSelected
                            ? "bg-blue-600 text-white font-semibold shadow-sm"
                            : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900"
                        )}
                      >
                        <span className="truncate flex-1">{cat.name}</span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mr-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditClick(cat);
                            }}
                            className={cn(
                              "p-0.5 rounded transition-colors",
                              isSelected ? "hover:bg-blue-700 text-white" : "hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500"
                            )}
                          >
                            <Edit size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(cat.id);
                            }}
                            className={cn(
                              "p-0.5 rounded transition-colors",
                              isSelected ? "hover:bg-blue-700 text-white" : "hover:bg-slate-200 dark:hover:bg-slate-700 text-rose-500"
                            )}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                        {hasSub && <ChevronRight size={12} className={cn(isSelected ? "text-white" : "text-slate-400", "shrink-0")} />}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Column 2 */}
            <div className="flex flex-col bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-xl overflow-hidden shadow-sm">
              <div className="p-2 border-b border-slate-100 dark:border-slate-800 relative">
                <Search className="absolute left-4 top-3.5 text-slate-400" size={12} />
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
                  <div className="p-4 text-center text-xs text-slate-350 dark:text-slate-650">Select parent category</div>
                ) : filteredL2.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">No subcategories found</div>
                ) : (
                  filteredL2.map((cat) => {
                    const isSelected = sel2?.id === cat.id;
                    const hasSub = hasChildren(cat.id);
                    return (
                      <div
                        key={cat.id}
                        onClick={() => {
                          setSel2(cat);
                          setSel3(null);
                          setSel4(null);
                        }}
                        className={cn(
                          "group w-full text-left px-3 py-2.5 text-xs font-normal rounded-md transition flex items-center justify-between cursor-pointer",
                          isSelected
                            ? "bg-blue-600 text-white font-semibold shadow-sm"
                            : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900"
                        )}
                      >
                        <span className="truncate flex-1">{cat.name}</span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mr-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditClick(cat);
                            }}
                            className={cn(
                              "p-0.5 rounded transition-colors",
                              isSelected ? "hover:bg-blue-700 text-white" : "hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500"
                            )}
                          >
                            <Edit size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(cat.id);
                            }}
                            className={cn(
                              "p-0.5 rounded transition-colors",
                              isSelected ? "hover:bg-blue-700 text-white" : "hover:bg-slate-200 dark:hover:bg-slate-700 text-rose-500"
                            )}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                        {hasSub && <ChevronRight size={12} className={cn(isSelected ? "text-white" : "text-slate-400", "shrink-0")} />}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Column 3 */}
            <div className="flex flex-col bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-xl overflow-hidden shadow-sm">
              <div className="p-2 border-b border-slate-100 dark:border-slate-800 relative">
                <Search className="absolute left-4 top-3.5 text-slate-400" size={12} />
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
                  <div className="p-4 text-center text-xs text-slate-350 dark:text-slate-650">Select parent category</div>
                ) : filteredL3.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">No subcategories found</div>
                ) : (
                  filteredL3.map((cat) => {
                    const isSelected = sel3?.id === cat.id;
                    const hasSub = hasChildren(cat.id);
                    return (
                      <div
                        key={cat.id}
                        onClick={() => {
                          setSel3(cat);
                          setSel4(null);
                        }}
                        className={cn(
                          "group w-full text-left px-3 py-2.5 text-xs font-normal rounded-md transition flex items-center justify-between cursor-pointer",
                          isSelected
                            ? "bg-blue-600 text-white font-semibold shadow-sm"
                            : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900"
                        )}
                      >
                        <span className="truncate flex-1">{cat.name}</span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mr-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditClick(cat);
                            }}
                            className={cn(
                              "p-0.5 rounded transition-colors",
                              isSelected ? "hover:bg-blue-700 text-white" : "hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500"
                            )}
                          >
                            <Edit size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(cat.id);
                            }}
                            className={cn(
                              "p-0.5 rounded transition-colors",
                              isSelected ? "hover:bg-blue-700 text-white" : "hover:bg-slate-200 dark:hover:bg-slate-700 text-rose-500"
                            )}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                        {hasSub && <ChevronRight size={12} className={cn(isSelected ? "text-white" : "text-slate-400", "shrink-0")} />}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Column 4 */}
            <div className="flex flex-col bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-xl overflow-hidden shadow-sm">
              <div className="p-2 border-b border-slate-100 dark:border-slate-800 relative">
                <Search className="absolute left-4 top-3.5 text-slate-400" size={12} />
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
                  <div className="p-4 text-center text-xs text-slate-350 dark:text-slate-650">Select parent category</div>
                ) : filteredL4.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">No subcategories found</div>
                ) : (
                  filteredL4.map((cat) => {
                    const isSelected = sel4?.id === cat.id;
                    const hasSub = hasChildren(cat.id);
                    return (
                      <div
                        key={cat.id}
                        onClick={() => setSel4(cat)}
                        className={cn(
                          "group w-full text-left px-3 py-2.5 text-xs font-normal rounded-md transition flex items-center justify-between cursor-pointer",
                          isSelected
                            ? "bg-blue-600 text-white font-semibold shadow-sm"
                            : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900"
                        )}
                      >
                        <span className="truncate flex-1">{cat.name}</span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mr-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditClick(cat);
                            }}
                            className={cn(
                              "p-0.5 rounded transition-colors",
                              isSelected ? "hover:bg-blue-700 text-white" : "hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500"
                            )}
                          >
                            <Edit size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(cat.id);
                            }}
                            className={cn(
                              "p-0.5 rounded transition-colors",
                              isSelected ? "hover:bg-blue-700 text-white" : "hover:bg-slate-200 dark:hover:bg-slate-700 text-rose-500"
                            )}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                        {hasSub && <ChevronRight size={12} className={cn(isSelected ? "text-white" : "text-slate-400", "shrink-0")} />}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Shared Edit Category Sheet */}
      {editingCategory && (
        <EditCategorySheet
          entry={editingCategory}
          open={editSheetOpen}
          setOpen={setEditSheetOpen}
        />
      )}

      <Toaster />

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
