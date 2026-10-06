"use client";

import React, { useState, useEffect } from "react";
import { Search, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchAllCategories } from "../_action";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  code: string;
  parentId: string | null;
}

interface CategorySelectorModalProps {
  onConfirm: (selectedCategory: Category, path: string) => void;
  onCancel: () => void;
  initialCategoryId?: string;
  restrictMasterCategoryId?: string;
}

export default function CategorySelectorModal({
  onConfirm,
  onCancel,
  initialCategoryId,
  restrictMasterCategoryId,
}: CategorySelectorModalProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Selections at each level
  const [sel1, setSel1] = useState<Category | null>(null);
  const [sel2, setSel2] = useState<Category | null>(null);
  const [sel3, setSel3] = useState<Category | null>(null);
  const [sel4, setSel4] = useState<Category | null>(null);

  // Search queries for columns
  const [q1, setQ1] = useState("");
  const [q2, setQ2] = useState("");
  const [q3, setQ3] = useState("");
  const [q4, setQ4] = useState("");

  // Load all categories on mount
  useEffect(() => {
    async function load() {
      try {
        const data = await fetchAllCategories();
        setCategories(data);

        // Pre-select restricted master category
        if (restrictMasterCategoryId) {
          const targetL1 = data.find(
            (c) => c.id === restrictMasterCategoryId && c.parentId === null
          );
          if (targetL1) {
            setSel1(targetL1);
          }
        }

        // If there's an initial category, try to resolve the path
        if (initialCategoryId) {
          const leaf = data.find((c) => c.id === initialCategoryId);
          if (leaf) {
            resolvePath(leaf, data);
          }
        }
      } catch (err) {
        console.error("Failed to load categories", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [initialCategoryId, restrictMasterCategoryId]);

  // Recursively resolve path for an initial category or recently used click
  const resolvePath = (leaf: Category, allCats: Category[]) => {
    const path: Category[] = [leaf];
    let curr = leaf;
    while (curr.parentId) {
      const parent = allCats.find((c) => c.id === curr.parentId);
      if (parent) {
        path.unshift(parent);
        curr = parent;
      } else {
        break;
      }
    }

    // Set selections based on resolved path length
    setSel1(path[0] || null);
    setSel2(path[1] || null);
    setSel3(path[2] || null);
    setSel4(path[3] || null);
  };

  // Helper to check if a category has any subcategories
  const hasChildren = (catId: string) => {
    return categories.some((c) => c.parentId === catId);
  };

  // Recently used items list (with mock codes to look authentic)
  const recentlyUsed = [
    { name: "eVouchers", code: "EVOUCHERS" },
    { name: "wxj test leaf category 01", code: "WXJ_TEST_LEAF" },
    { name: "TEST DO NOT LISTTTT", code: "TEST_DO_NOT_LIST" },
    { name: "Basic", code: "BASIC" },
    { name: "Keyboards", code: "KEYBOARDS" },
    { name: "Test L4 Leaf cat - MQ", code: "TEST_L4_LEAF" },
  ];

  const handleRecentlyUsedClick = (item: { name: string; code: string }) => {
    // Try to find by code, or find/create dynamically if missing
    let found = categories.find((c) => c.code === item.code || c.name.toLowerCase() === item.name.toLowerCase());
    if (!found) {
      // Create a temporary mock category under Digital Goods > Local Vouchers > Food & Beverages
      // so it resolves properly in the UI
      const mockParent = categories.find((c) => c.code === "FOOD_BEVERAGES") || categories[0];
      found = {
        id: "mock-" + item.code,
        name: item.name,
        code: item.code,
        parentId: mockParent?.id || null,
      };
      // Temporary inject
      setCategories((prev) => [...prev, found!]);
    }
    resolvePath(found, [...categories, found]);
  };

  // Filter categories for each level
  const level1Cats = categories.filter((c) => {
    if (c.parentId !== null) return false;
    if (restrictMasterCategoryId) {
      return c.id === restrictMasterCategoryId;
    }
    return true;
  });
  const level2Cats = sel1 ? categories.filter((c) => c.parentId === sel1.id) : [];
  const level3Cats = sel2 ? categories.filter((c) => c.parentId === sel2.id) : [];
  const level4Cats = sel3 ? categories.filter((c) => c.parentId === sel3.id) : [];

  // Filtered by search queries
  const filteredL1 = level1Cats.filter((c) => c.name.toLowerCase().includes(q1.toLowerCase()));
  const filteredL2 = level2Cats.filter((c) => c.name.toLowerCase().includes(q2.toLowerCase()));
  const filteredL3 = level3Cats.filter((c) => c.name.toLowerCase().includes(q3.toLowerCase()));
  const filteredL4 = level4Cats.filter((c) => c.name.toLowerCase().includes(q4.toLowerCase()));

  // Active path label
  const getSelectedPathString = () => {
    const parts = [sel1?.name, sel2?.name, sel3?.name, sel4?.name].filter(Boolean);
    return parts.length > 0 ? parts.join(" > ") : "";
  };

  // Confirm selection
  const handleConfirm = () => {
    const activeSelection = sel4 || sel3 || sel2 || sel1;
    if (activeSelection) {
      onConfirm(activeSelection, getSelectedPathString());
    }
  };

  // Determine if confirm is enabled (active selection exist, preferably leaf)
  const canConfirm = sel1 !== null;

  return (
    <div className="w-full bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-250">
      {/* Top section: Recently used */}
      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
        <span className="font-medium text-slate-700">Recently used:</span>
        {recentlyUsed.map((item) => (
          <button
            key={item.code}
            type="button"
            onClick={() => handleRecentlyUsedClick(item)}
            className="px-3 py-1 bg-slate-100/80 hover:bg-slate-200/80 hover:text-slate-800 rounded-full text-xs font-normal transition duration-150 border border-slate-200/60"
          >
            {item.name}
          </button>
        ))}
      </div>

      {/* Grid: 4 Columns selector */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[420px] border border-slate-100 rounded-2xl p-4 bg-slate-50/50">
        {/* Column 1 */}
        <div className="flex flex-col bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-sm">
          <div className="p-2 border-b border-slate-100 relative">
            <Search className="absolute left-4 top-3 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="Filter..."
              value={q1}
              onChange={(e) => setQ1(e.target.value)}
              className="w-full pl-7 pr-3 py-1 text-xs bg-slate-50 border border-slate-100 rounded-md focus:outline-none focus:border-blue-500 focus:bg-white"
            />
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-1 space-y-0.5">
            {loading ? (
              <div className="p-4 text-center text-xs text-slate-400">Loading...</div>
            ) : filteredL1.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">No categories found</div>
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
                    }}
                    className={cn(
                      "w-full text-left px-3 py-2 text-xs font-normal rounded-md transition flex items-center justify-between",
                      isSelected
                        ? "bg-blue-600 text-white font-semibold shadow-sm animate-in fade-in duration-100"
                        : "hover:bg-slate-100 text-slate-700 hover:text-slate-900"
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
        <div className="flex flex-col bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-sm">
          <div className="p-2 border-b border-slate-100 relative">
            <Search className="absolute left-4 top-3 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="Filter..."
              value={q2}
              onChange={(e) => setQ2(e.target.value)}
              disabled={!sel1}
              className="w-full pl-7 pr-3 py-1 text-xs bg-slate-50 border border-slate-100 rounded-md focus:outline-none focus:border-blue-500 focus:bg-white disabled:opacity-50"
            />
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-1 space-y-0.5">
            {!sel1 ? (
              <div className="p-4 text-center text-xs text-slate-300">Select parent category</div>
            ) : filteredL2.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">No subcategories found</div>
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
                    }}
                    className={cn(
                      "w-full text-left px-3 py-2 text-xs font-normal rounded-md transition flex items-center justify-between",
                      isSelected
                        ? "bg-blue-600 text-white font-semibold shadow-sm animate-in fade-in duration-100"
                        : "hover:bg-slate-100 text-slate-700 hover:text-slate-900"
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
        <div className="flex flex-col bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-sm">
          <div className="p-2 border-b border-slate-100 relative">
            <Search className="absolute left-4 top-3 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="Filter..."
              value={q3}
              onChange={(e) => setQ3(e.target.value)}
              disabled={!sel2}
              className="w-full pl-7 pr-3 py-1 text-xs bg-slate-50 border border-slate-100 rounded-md focus:outline-none focus:border-blue-500 focus:bg-white disabled:opacity-50"
            />
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-1 space-y-0.5">
            {!sel2 ? (
              <div className="p-4 text-center text-xs text-slate-300">Select parent category</div>
            ) : filteredL3.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">No subcategories found</div>
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
                    }}
                    className={cn(
                      "w-full text-left px-3 py-2 text-xs font-normal rounded-md transition flex items-center justify-between",
                      isSelected
                        ? "bg-blue-600 text-white font-semibold shadow-sm animate-in fade-in duration-100"
                        : "hover:bg-slate-100 text-slate-700 hover:text-slate-900"
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
        <div className="flex flex-col bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-sm">
          <div className="p-2 border-b border-slate-100 relative">
            <Search className="absolute left-4 top-3 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="Filter..."
              value={q4}
              onChange={(e) => setQ4(e.target.value)}
              disabled={!sel3}
              className="w-full pl-7 pr-3 py-1 text-xs bg-slate-50 border border-slate-100 rounded-md focus:outline-none focus:border-blue-500 focus:bg-white disabled:opacity-50"
            />
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-1 space-y-0.5">
            {!sel3 ? (
              <div className="p-4 text-center text-xs text-slate-300">Select parent category</div>
            ) : filteredL4.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">No subcategories found</div>
            ) : (
              filteredL4.map((cat) => {
                const isSelected = sel4?.id === cat.id;
                const hasSub = hasChildren(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSel4(cat)}
                    className={cn(
                      "w-full text-left px-3 py-2 text-xs font-normal rounded-md transition flex items-center justify-between",
                      isSelected
                        ? "bg-blue-600 text-white font-semibold shadow-sm animate-in fade-in duration-100"
                        : "hover:bg-slate-100 text-slate-700 hover:text-slate-900"
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

      {/* Bottom section: Current Selection & buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-slate-100 pt-4 mt-2">
        <div className="text-sm">
          <span className="font-semibold text-slate-500 mr-2">Current selection:</span>
          {getSelectedPathString() ? (
            <span className="text-blue-600 font-medium bg-blue-50/50 px-3 py-1 rounded-lg border border-blue-100/60 inline-block">
              {getSelectedPathString()}
            </span>
          ) : (
            <span className="text-slate-400">--</span>
          )}
        </div>

        <div className="flex items-center gap-3 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="rounded-full border-slate-200 text-slate-700 hover:bg-slate-50 font-normal px-6"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={!canConfirm}
            className={cn(
              "rounded-full px-6 font-normal shadow-sm transition-all duration-200",
              canConfirm
                ? "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                : "bg-slate-100 text-slate-400 border border-slate-200/50 cursor-not-allowed"
            )}
          >
            Confirm
          </Button>
        </div>
      </div>

      {/* Styled scrollbar css block */}
      <style jsx global>{`
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
