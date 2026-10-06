"use client";

import React, { useState, useRef, useEffect, Suspense } from "react";
import axios from "axios";
import { Search, X, History, TrendingUp, Store, Tag, ArrowRight, CornerDownLeft, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";

const LOCAL_STORAGE_HISTORY_KEY = "bb_search_history_v1";

interface SearchResultsState {
  products: any[];
  categories: any[];
  stores: any[];
  trending: string[];
}

const SearchBarInner = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<"all" | "products" | "stores">("all");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [results, setResults] = useState<SearchResultsState>({
    products: [],
    categories: [],
    stores: [],
    trending: [
      "Smartphones",
      "T-Shirts",
      "Wireless Earbuds",
      "Gaming Laptops",
      "Smart Watches",
      "Men's Jeans",
    ],
  });

  // Load search history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_HISTORY_KEY);
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (_) {}
  }, []);

  // Sync with search URL parameter if updated
  useEffect(() => {
    const urlQuery = searchParams.get("search");
    if (urlQuery !== null && urlQuery !== query) {
      setQuery(urlQuery);
    }
  }, [searchParams]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search query
  const handleQueryChange = (val: string) => {
    setQuery(val);
    const trimmed = val.trim();

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    if (trimmed.length > 0) {
      setIsLoading(true);
      debounceTimeoutRef.current = setTimeout(async () => {
        try {
          const res = await axios.get(
            `/api/search?q=${encodeURIComponent(trimmed)}&scope=${scope}`
          );
          setResults(res.data);
          setIsOpen(true);
        } catch (err) {
          console.error("Search fetch failed:", err);
        } finally {
          setIsLoading(false);
        }
      }, 200);
    } else {
      setIsLoading(false);
      setIsOpen(false);
      setResults((prev) => ({ ...prev, products: [], categories: [], stores: [] }));
    }
  };

  // Save term to search history
  const saveToHistory = (term: string) => {
    const clean = term.trim();
    if (!clean) return;
    const updated = [clean, ...history.filter((h) => h.toLowerCase() !== clean.toLowerCase())].slice(0, 8);
    setHistory(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_HISTORY_KEY, JSON.stringify(updated));
    } catch (_) {}
  };

  // Remove single history item
  const removeHistoryItem = (itemToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = history.filter((h) => h !== itemToRemove);
    setHistory(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_HISTORY_KEY, JSON.stringify(updated));
    } catch (_) {}
  };

  // Clear entire history
  const clearAllHistory = (e: React.MouseEvent) => {
    e.stopPropagation();
    setHistory([]);
    try {
      localStorage.removeItem(LOCAL_STORAGE_HISTORY_KEY);
    } catch (_) {}
  };

  // Execute Search Submit
  const executeSearch = (searchTerm?: string) => {
    const finalQuery = (searchTerm !== undefined ? searchTerm : query).trim();
    if (!finalQuery) return;

    saveToHistory(finalQuery);
    setIsOpen(false);
    inputRef.current?.blur();

    if (scope === "stores") {
      router.push(`/products?search=${encodeURIComponent(finalQuery)}&scope=stores`);
    } else {
      router.push(`/products?search=${encodeURIComponent(finalQuery)}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      executeSearch();
    } else if (e.key === "Escape") {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  // Helper for product photo
  const getProductImage = (photo: any) => {
    if (!photo) return "/img/noImage.jpg";
    const photoUrl = Array.isArray(photo) ? photo[0] : photo;
    if (typeof photoUrl !== "string" || !photoUrl) return "/img/noImage.jpg";
    if (photoUrl.startsWith("http://") || photoUrl.startsWith("https://")) return photoUrl;
    return `/img/${photoUrl}`;
  };

  const hasSuggestions =
    results.products.length > 0 ||
    results.categories.length > 0 ||
    results.stores.length > 0;

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Main Search Bar Input Container */}
      <div className="flex items-center w-full bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 rounded-full focus-within:border-black dark:focus-within:border-white focus-within:ring-4 focus-within:ring-black/10 dark:focus-within:ring-white/10 transition-all shadow-xs h-10 sm:h-11">
        
        {/* Scope Selector */}
        <div className="relative border-r border-slate-200 dark:border-slate-800 shrink-0 pl-3 pr-2 hidden xs:flex items-center">
          <select
            value={scope}
            onChange={(e) => {
              const newScope = e.target.value as any;
              setScope(newScope);
              if (query.trim()) handleQueryChange(query);
            }}
            className="text-xs font-bold text-slate-700 dark:text-slate-300 bg-transparent pr-4 py-1 appearance-none outline-none cursor-pointer"
          >
            <option value="all">{t("all")}</option>
            <option value="products">{t("products")}</option>
            <option value="stores">{t("suppliers")}</option>
          </select>
          <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 pointer-events-none" />
        </div>

        {/* Search Input */}
        <div className="flex-1 flex items-center h-full px-3 relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            onFocus={() => {
              if (query.trim().length > 0) setIsOpen(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder={t("search_placeholder")}
            className="w-full bg-transparent text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none h-full"
            autoComplete="off"
            aria-label="Search"
          />

          {/* Clear Button (X) */}
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                handleQueryChange("");
                setIsOpen(false);
                inputRef.current?.focus();
              }}
              className="p-1 rounded-full text-slate-400 hover:text-black dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors mr-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Submit Search Button */}
        <button
          type="button"
          onClick={() => executeSearch()}
          className="bg-black hover:bg-slate-900 active:scale-95 text-white font-extrabold text-xs sm:text-sm h-full px-4 sm:px-6 rounded-r-full flex items-center gap-1.5 transition-all shrink-0 cursor-pointer"
          aria-label="Submit Search"
        >
          <Search className="w-4 h-4 stroke-[2.5]" />
          <span className="hidden sm:inline">{t("search")}</span>
        </button>
      </div>

      {/* Flyout Suggestion Dropdown: Only shown when typing */}
      {isOpen && query.trim().length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden text-slate-800 dark:text-slate-200 animate-in fade-in-0 zoom-in-95 duration-150">

          {/* 2. ACTIVE TYPING STATE: Instant Suggestions */}
          {query.trim() && (
            <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[460px] overflow-y-auto">
              
              {/* Quick Query Submit Row */}
              <div
                onClick={() => executeSearch()}
                className="flex items-center justify-between px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2 text-xs font-bold">
                  <Search className="w-3.5 h-3.5" />
                  <span>Search for <strong className="text-black dark:text-white underline">&ldquo;{query}&rdquo;</strong></span>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 group-hover:text-black dark:group-hover:text-white">
                  <span>Press Enter</span>
                  <CornerDownLeft className="w-3 h-3" />
                </div>
              </div>

              {/* Matching Categories */}
              {results.categories.length > 0 && (
                <div className="p-3">
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2 px-1">
                    Matching Categories
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {results.categories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/products?category=${cat.id}`}
                        onClick={() => {
                          setIsOpen(false);
                          saveToHistory(cat.name);
                        }}
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Search className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-black dark:group-hover:text-white truncate">
                            {cat.name}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 shrink-0">
                          {cat._count?.products || 0} items
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Matching Stores / Suppliers */}
              {results.stores.length > 0 && (
                <div className="p-3">
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2 px-1">
                    Verified Stores & Suppliers
                  </div>
                  <div className="space-y-1.5">
                    {results.stores.map((st) => (
                      <Link
                        key={st.id}
                        href={`/store/${st.slug}`}
                        onClick={() => {
                          setIsOpen(false);
                          saveToHistory(st.storeNameEn);
                        }}
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 shrink-0 border border-slate-200/80 dark:border-slate-700">
                            <Search className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-black dark:group-hover:text-white transition-colors">
                              {st.storeNameEn}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {st._count?.products || 0} Products available
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-black dark:group-hover:text-white transition-transform group-hover:translate-x-1" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Matching Products */}
              {results.products.length > 0 && (
                <div className="p-3">
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2 px-1">
                    Products
                  </div>
                  <div className="space-y-1">
                    {results.products.map((p) => (
                      <Link
                        key={p.id}
                        href={`/products/${p.id}`}
                        onClick={() => {
                          setIsOpen(false);
                          saveToHistory(p.name);
                        }}
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 mr-3">
                          <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 shrink-0 border border-slate-200/80 dark:border-slate-700">
                            <Search className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-black dark:group-hover:text-white transition-colors truncate">
                              {p.name}
                            </div>
                            {p.store?.storeNameEn && (
                              <div className="text-[10px] text-slate-400 truncate">
                                by {p.store.storeNameEn}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-xs font-black text-slate-900 dark:text-white">
                            ৳{p.price}
                          </div>
                          {p.mrp && p.mrp > p.price && (
                            <div className="text-[10px] text-slate-400 line-through">
                              ৳{p.mrp}
                            </div>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty Results Fallback */}
              {!hasSuggestions && !isLoading && (
                <div className="p-8 text-center text-slate-400">
                  <Search className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    No exact matches found for &ldquo;{query}&rdquo;
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Try checking spelling or search with broader keywords.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const SearchBar = () => {
  return (
    <Suspense
      fallback={
        <div className="w-full h-11 bg-slate-100 dark:bg-slate-800 rounded-full animate-pulse" />
      }
    >
      <SearchBarInner />
    </Suspense>
  );
};

export default SearchBar;