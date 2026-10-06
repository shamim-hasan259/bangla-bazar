"use client";

import React, { useState, useMemo, useEffect } from "react";
import { cn } from "@/lib/utils";
import useCategory from "@/hooks/useCategory";
import { ProductCategory } from "@/types/interface";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ChevronDown,
  ChevronRight,
  Layers,
  Shirt,
  Smartphone,
  Laptop,
  Watch,
  Sparkles,
  Headphones,
  Tag,
  RotateCcw,
  Loader2,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface CategoryTreeNode {
  id: string;
  name: string;
  code?: string;
  parentId?: string | null;
  productCount: number;
  subcategories: CategoryTreeNode[];
}

// Helper to choose appropriate category icon dynamically
const getCategoryIcon = (name: string) => {
  const n = name.toLowerCase();
  const iconClass = "w-3.5 h-3.5";
  if (n.includes("fashion") || n.includes("shirt") || n.includes("pant") || n.includes("cloth") || n.includes("dress")) {
    return <Shirt className={iconClass} />;
  }
  if (n.includes("phone") || n.includes("gadget") || n.includes("electronic") || n.includes("mobile")) {
    return <Smartphone className={iconClass} />;
  }
  if (n.includes("laptop") || n.includes("computer") || n.includes("pc") || n.includes("tech")) {
    return <Laptop className={iconClass} />;
  }
  if (n.includes("watch") || n.includes("jewelry")) {
    return <Watch className={iconClass} />;
  }
  if (n.includes("beauty") || n.includes("health") || n.includes("skin") || n.includes("perfume")) {
    return <Sparkles className={iconClass} />;
  }
  if (n.includes("headphone") || n.includes("audio") || n.includes("speaker") || n.includes("sound")) {
    return <Headphones className={iconClass} />;
  }
  return <Tag className={iconClass} />;
};

// Subcomponent for each category node with inline subcategory expansion
const CategoryNodeItem = ({
  node,
  level = 0,
  activeCategoryId,
  expandedNodes,
  toggleNode,
}: {
  node: CategoryTreeNode;
  level?: number;
  activeCategoryId: string | null;
  expandedNodes: Record<string, boolean>;
  toggleNode: (nodeId: string, e: React.MouseEvent) => void;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const hasChildren = Boolean(node.subcategories && node.subcategories.length > 0);
  const isActive =
    activeCategoryId === node.id || (node.code && activeCategoryId === node.code);

  const isChildActive = (n: CategoryTreeNode): boolean => {
    if (activeCategoryId === n.id || (n.code && activeCategoryId === n.code)) return true;
    return n.subcategories.some((child) => isChildActive(child));
  };
  const hasActiveChild = hasChildren && isChildActive(node);
  const isExpanded = !!expandedNodes[node.id] || isHovered || hasActiveChild;

  return (
    <div
      className="w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Category Item Row */}
      <div
        className={cn(
          "group flex items-center justify-between py-1.5 px-2 rounded-lg transition-all duration-150 select-none cursor-pointer",
          isActive
            ? "bg-black text-white dark:bg-white dark:text-black font-bold shadow-sm"
            : hasActiveChild
            ? "text-black dark:text-white font-bold bg-slate-100 dark:bg-slate-800"
            : isHovered
            ? "bg-slate-100 dark:bg-slate-800 text-black dark:text-white font-semibold"
            : "text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60",
          level === 0 ? "text-xs" : level === 1 ? "text-[11.5px]" : "text-[11px]"
        )}
      >
        {/* Left: Icon + Link */}
        <Link
          href={`/products?category=${node.id}`}
          className="flex-1 flex items-center gap-2 truncate mr-2"
        >
          {level === 0 ? (
            <span
              className={cn(
                "p-1 rounded-md transition-colors shrink-0",
                isActive
                  ? "bg-white/20 text-white dark:bg-black/20 dark:text-black"
                  : isHovered
                  ? "bg-slate-200 text-black dark:bg-slate-700 dark:text-white"
                  : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 group-hover:text-black dark:group-hover:text-white group-hover:bg-slate-200 dark:group-hover:bg-slate-700"
              )}
            >
              {getCategoryIcon(node.name)}
            </span>
          ) : (
            <span
              className={cn(
                "w-1.5 h-1.5 rounded-full shrink-0 transition-colors",
                isActive
                  ? "bg-white dark:bg-black"
                  : "bg-slate-300 dark:bg-slate-600 group-hover:bg-black dark:group-hover:bg-white"
              )}
            />
          )}
          <span className="truncate">{node.name}</span>
        </Link>

        {/* Right: Product Count & Subcategory Indicator / Toggle */}
        <div className="flex items-center gap-1 shrink-0">
          {node.productCount > 0 && (
            <span
              className={cn(
                "text-[10px] px-1.5 py-0.2 rounded-full font-medium transition-colors",
                isActive
                  ? "bg-white/20 text-white dark:bg-black/20 dark:text-black"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
              )}
            >
              {node.productCount}
            </span>
          )}

          {hasChildren && (
            <button
              type="button"
              onClick={(e) => toggleNode(node.id, e)}
              className={cn(
                "p-1 rounded-md transition-colors cursor-pointer",
                isActive
                  ? "text-white/80 hover:text-white hover:bg-white/10"
                  : "text-slate-400 hover:text-black dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/60"
              )}
              title={isExpanded ? "Collapse subcategories" : "Expand subcategories"}
              aria-label={isExpanded ? `Collapse ${node.name}` : `Expand ${node.name}`}
            >
              <ChevronRight
                className={cn(
                  "w-3.5 h-3.5 transition-transform duration-200",
                  isExpanded && "rotate-90"
                )}
              />
            </button>
          )}
        </div>
      </div>

      {/* Inline Subcategories */}
      {hasChildren && isExpanded && (
        <div className="ml-4 space-y-0.5 my-1 pl-1 border-l-2 border-slate-100 dark:border-slate-800">
          {node.subcategories.map((subNode) => (
            <CategoryNodeItem
              key={subNode.id}
              node={subNode}
              level={level + 1}
              activeCategoryId={activeCategoryId}
              expandedNodes={expandedNodes}
              toggleNode={toggleNode}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const Category = () => {
  const { categories, loading } = useCategory();
  const searchParams = useSearchParams();
  const activeCategoryId = searchParams.get("category");

  // State to track manually expanded category nodes
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

  // Build the hierarchical tree from DB categories
  const categoryTree = useMemo(() => {
    if (!categories || categories.length === 0) {
      return [];
    }

    const catMap = new Map<string, CategoryTreeNode>();
    const rootNodes: CategoryTreeNode[] = [];

    // First pass: register all categories
    categories.forEach((cat: ProductCategory) => {
      const node: CategoryTreeNode = {
        id: cat.id,
        name: cat.name,
        code: cat.code,
        parentId: cat.parentId,
        productCount: cat._count?.products || 0,
        subcategories: (cat.subcategories || []).map((sub: any) => ({
          id: sub.id,
          name: sub.name,
          code: sub.code,
          parentId: cat.id,
          productCount: sub._count?.products || 0,
          subcategories: [],
        })),
      };
      catMap.set(cat.id, node);
    });

    // Second pass: handle both nested subcategories structure or flat parentId structure
    catMap.forEach((node) => {
      if (node.parentId && catMap.has(node.parentId)) {
        const parent = catMap.get(node.parentId)!;
        if (!parent.subcategories.some((s) => s.id === node.id)) {
          parent.subcategories.push(node);
        }
      } else if (!node.parentId) {
        rootNodes.push(node);
      }
    });

    // Helper to sum product counts recursively
    const computeTotalProducts = (node: CategoryTreeNode): number => {
      const childrenTotal = node.subcategories.reduce(
        (acc, child) => acc + computeTotalProducts(child),
        0
      );
      node.productCount = node.productCount + childrenTotal;
      return node.productCount;
    };

    rootNodes.forEach((root) => computeTotalProducts(root));

    return rootNodes;
  }, [categories]);

  // Find all ancestor IDs for active category ID so they auto-expand
  useEffect(() => {
    if (!activeCategoryId || categoryTree.length === 0) return;

    const findAncestors = (
      nodes: CategoryTreeNode[],
      targetId: string,
      path: string[] = []
    ): string[] | null => {
      for (const node of nodes) {
        if (node.id === targetId || node.code === targetId) {
          return path;
        }
        if (node.subcategories.length > 0) {
          const res = findAncestors(node.subcategories, targetId, [...path, node.id]);
          if (res) return res;
        }
      }
      return null;
    };

    const ancestors = findAncestors(categoryTree, activeCategoryId);
    if (ancestors && ancestors.length > 0) {
      setExpandedNodes((prev) => {
        const next = { ...prev };
        ancestors.forEach((id) => {
          next[id] = true;
        });
        return next;
      });
    }
  }, [activeCategoryId, categoryTree]);

  // Toggle expansion of a specific node on click
  const toggleNode = (nodeId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedNodes((prev) => ({
      ...prev,
      [nodeId]: !prev[nodeId],
    }));
  };

  return (
    <div className="space-y-6 bg-transparent py-2">
      {/* Categories Card */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 relative z-30">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-2 h-4 bg-black dark:bg-white rounded-full" />
            <h3 className="text-xs font-extrabold text-black dark:text-white uppercase tracking-wider">
              Categories
            </h3>
          </div>
          {activeCategoryId && (
            <Link
              href="/products"
              className="flex items-center gap-1 text-[10px] font-bold text-black dark:text-white hover:underline uppercase tracking-tight"
            >
              <RotateCcw className="w-2.5 h-2.5" />
              <span>Reset</span>
            </Link>
          )}
        </div>

        {/* All Categories Button */}
        <div className="mb-2">
          <Link
            href="/products"
            className={cn(
              "flex items-center justify-between py-1.5 px-2 rounded-lg text-xs transition-all duration-150",
              !activeCategoryId
                ? "bg-black text-white dark:bg-white dark:text-black font-bold"
                : "text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50"
            )}
          >
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "p-1 rounded-md",
                  !activeCategoryId
                    ? "bg-white/20 text-white dark:bg-black/20 dark:text-black"
                    : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                )}
              >
                <Layers className="w-3.5 h-3.5" />
              </span>
              <span>All Categories</span>
            </div>
            {!activeCategoryId && (
              <span className="w-1.5 h-1.5 rounded-full bg-white dark:bg-black" />
            )}
          </Link>
        </div>

        {/* Categories Tree List / Loading Skeleton */}
        {loading ? (
          <div className="space-y-2 py-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-7 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : categoryTree.length === 0 ? (
          <div className="py-4 text-center text-xs text-slate-400">
            No categories available
          </div>
        ) : (
          <div className="space-y-1">
            {categoryTree.map((rootNode) => (
              <CategoryNodeItem
                key={rootNode.id}
                node={rootNode}
                level={0}
                activeCategoryId={activeCategoryId}
                expandedNodes={expandedNodes}
                toggleNode={toggleNode}
              />
            ))}
          </div>
        )}
      </div>

      {/* Brand Filter Card */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="w-2 h-4 bg-black dark:bg-white rounded-full" />
          <h3 className="text-xs font-extrabold text-black dark:text-white uppercase tracking-wider">
            Brand
          </h3>
        </div>
        <div className="space-y-2 pl-0.5">
          {[
            { id: "manfare", name: "Manfare" },
            { id: "goodman", name: "Goodman" },
            { id: "fabrilife", name: "Fabrilife" },
            { id: "chinaexpress", name: "China Express" },
            { id: "hannah", name: "HANNAH MARTIN" },
            { id: "lacoste", name: "Lacoste" },
            { id: "levis", name: "Levis" },
          ].map((brand) => (
            <div
              key={brand.id}
              className="flex items-center space-x-2.5 cursor-pointer group py-0.5"
            >
              <Checkbox
                id={brand.id}
                className="h-3.5 w-3.5 rounded-sm border-slate-300 text-black focus:ring-black data-[state=checked]:bg-black data-[state=checked]:border-black dark:data-[state=checked]:bg-white dark:data-[state=checked]:border-white dark:data-[state=checked]:text-black"
              />
              <label
                htmlFor={brand.id}
                className="text-xs font-normal text-slate-600 dark:text-slate-400 cursor-pointer select-none group-hover:text-black dark:group-hover:text-white transition-colors leading-none"
              >
                {brand.name}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Size Filter Card */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="w-2 h-4 bg-black dark:bg-white rounded-full" />
          <h3 className="text-xs font-extrabold text-black dark:text-white uppercase tracking-wider">
            Size
          </h3>
        </div>
        <div className="space-y-3 pl-0.5">
          <div className="relative">
            <select className="w-full text-xs text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg p-2 pr-8 appearance-none focus:outline-none focus:border-black dark:focus:border-white">
              <option>EU Standard</option>
              <option>US Standard</option>
              <option>UK Standard</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2.5 pointer-events-none text-slate-400">
              <ChevronDown className="h-3.5 w-3.5" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {["S", "M", "L", "XL", "2XL", "3XL"].map((size) => (
              <div
                key={size}
                className="flex items-center justify-center py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-black hover:text-black dark:hover:border-white dark:hover:text-white cursor-pointer transition-all select-none"
              >
                {size}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Category;
