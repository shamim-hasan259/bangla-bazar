"use client";

import React, { useState, useMemo } from "react";
import {
  ChevronRight,
  Info,
  X,
  Search,
  Upload,
  Check,
  TrendingUp,
  Zap,
  ArrowUpRight,
  Sparkles,
  ShoppingBag,
  HelpCircle
} from "lucide-react";
import { toast } from "sonner";

interface OpportunityItem {
  id: string;
  title: string;
  image: string;
  categoryPath: string;
  price: number;
  saleRange: string;
  type: "Trending" | "High Demand" | "Top Product";
  exposureUplift: string;
  boostType: string;
  keywords: string[];
}

export default function OpportunityCenterPage() {
  // Navigation & Metrics State
  const [uploadedCount, setUploadedCount] = useState(0);
  const [isAlertOpen, setIsAlertOpen] = useState(true);
  const [collectedIds, setCollectedIds] = useState<Set<string>>(new Set());

  // Filter States
  const [activeTypeTab, setActiveTypeTab] = useState<"Trending" | "High Demand" | "Top Product">("High Demand");
  const [searchQuery, setSearchQuery] = useState("phone");
  const [appliedQuery, setAppliedQuery] = useState("phone");
  const [categoryFilter, setCategoryFilter] = useState("All Category");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [displayPicked, setDisplayPicked] = useState(false);
  const [showFilters, setShowFilters] = useState(true);

  // Listing modal upload states
  const [uploadTargetItem, setUploadTargetItem] = useState<OpportunityItem | null>(null);
  const [listingPrice, setListingPrice] = useState("");
  const [listingSku, setListingSku] = useState("");

  // Mock Opportunity Dataset (Analysed from user searches/add-to-carts)
  const mockOpportunities: OpportunityItem[] = [
    {
      id: "opp-1",
      title: "Soft case Fashion Design Phone Case For VIVO Y400 Pro 5G Global Edition",
      image: "/img/wishListDefault.png", // fallback image or local
      categoryPath: "Mobiles & Tablets > Mobile Accessories > Phone Cases",
      price: 884,
      saleRange: "0~250",
      type: "High Demand",
      exposureUplift: "Up to 3x Exposure uplift ⚡",
      boostType: "Effective New Boost",
      keywords: ["phone", "case", "fashion", "vivo"]
    },
    {
      id: "opp-2",
      title: "IPHONE 12 Pro Max Battery Replacement for iphone 12 Pro Max high capacity 4500mAh",
      image: "/img/offer-photo.png",
      categoryPath: "Mobiles & Tablets > Mobile Accessories > Phone Batteries",
      price: 4500,
      saleRange: "0~250",
      type: "High Demand",
      exposureUplift: "Up to 3x Exposure uplift ⚡",
      boostType: "Effective New Boost",
      keywords: ["phone", "iphone", "battery", "replacement"]
    },
    {
      id: "opp-3",
      title: "ULANZI A21 Drawer Wireless Microphone for iPhone 15/16/17/Android Live Recording Mic",
      image: "/img/demoFan.jpg",
      categoryPath: "TV, Audio / Video, Gaming & Wearables > Audio > Live Sound & Stage Equipment",
      price: 3900,
      saleRange: "0~250",
      type: "High Demand",
      exposureUplift: "Up to 3x Exposure uplift ⚡",
      boostType: "Effective New Boost",
      keywords: ["phone", "iphone", "microphone", "wireless", "ulanzi"]
    },
    {
      id: "opp-4",
      title: "Smalshop For iPhone 14 Fashion Leisure ROXY Sports Trend Phone Case protection shell",
      image: "/img/wishListDefault.png",
      categoryPath: "Mobiles & Tablets > Mobile Accessories > Phone Cases",
      price: 1238,
      saleRange: "0~250",
      type: "High Demand",
      exposureUplift: "Up to 3x Exposure uplift ⚡",
      boostType: "Effective New Boost",
      keywords: ["phone", "iphone", "case", "fashion", "roxy"]
    },
    {
      id: "opp-5",
      title: "Boya BY-M1 Lavalier Clip-on Microphone for DSLR/Smartphones/PC audio capture",
      image: "/img/noImage.jpg",
      categoryPath: "TV, Audio / Video, Gaming & Wearables > Audio > Live Sound & Stage Equipment",
      price: 1150,
      saleRange: "100~500",
      type: "Trending",
      exposureUplift: "Up to 2x Exposure uplift ⚡",
      boostType: "High Search Rank",
      keywords: ["microphone", "boya", "lavalier", "audio"]
    },
    {
      id: "opp-6",
      title: "Anker Soundcore Life Q30 Hybrid Active Noise Cancelling Wireless Bluetooth Headphone",
      image: "/img/fanImage.png",
      categoryPath: "Audio > Headphones & Headsets > Over-Ear Headphones",
      price: 8499,
      saleRange: "50~300",
      type: "Top Product",
      exposureUplift: "Up to 4x Exposure uplift ⚡",
      boostType: "Top Volume Booster",
      keywords: ["headphone", "anker", "soundcore", "wireless", "bluetooth"]
    },
    {
      id: "opp-7",
      title: "Fast Charging Type-C USB Cable 3A for Samsung Xiaomi OnePlus data sync line",
      image: "/img/noImage.jpg",
      categoryPath: "Mobiles & Tablets > Mobile Accessories > Cables",
      price: 250,
      saleRange: "500~2000",
      type: "Trending",
      exposureUplift: "Up to 3x Exposure uplift ⚡",
      boostType: "Effective New Boost",
      keywords: ["phone", "cable", "type-c", "fast charging", "samsung"]
    },
    {
      id: "opp-8",
      title: "SanDisk Ultra MicroSDXC UHS-I Card 128GB for Camera/Android smartphones speed up to 120MB/s",
      image: "/img/offer-photo.png",
      categoryPath: "Mobiles & Tablets > Storage > Memory Cards",
      price: 1550,
      saleRange: "200~1000",
      type: "Top Product",
      exposureUplift: "Up to 3x Exposure uplift ⚡",
      boostType: "Top Volume Booster",
      keywords: ["phone", "sandisk", "microsd", "memory", "storage"]
    }
  ];

  // Filter Logic
  const filteredOpportunities = useMemo(() => {
    return mockOpportunities.filter((item) => {
      // 1. Tab Opportunity Type filter
      if (activeTypeTab === "High Demand" && item.type !== "High Demand") return false;
      if (activeTypeTab === "Trending" && item.type !== "Trending") return false;
      if (activeTypeTab === "Top Product" && item.type !== "Top Product") return false;

      // 2. Keyword Search filter
      if (appliedQuery) {
        const query = appliedQuery.toLowerCase();
        const matchesKeyword = item.keywords.some(k => k.includes(query)) ||
          item.title.toLowerCase().includes(query) ||
          item.categoryPath.toLowerCase().includes(query);
        if (!matchesKeyword) return false;
      }

      // 3. Category filter
      if (categoryFilter !== "All Category") {
        if (!item.categoryPath.toLowerCase().includes(categoryFilter.toLowerCase())) return false;
      }

      // 4. Price filters
      if (minPrice) {
        if (item.price < parseFloat(minPrice)) return false;
      }
      if (maxPrice) {
        if (item.price > parseFloat(maxPrice)) return false;
      }

      // 5. Display Picked Opportunities
      if (displayPicked && !collectedIds.has(item.id)) return false;

      return true;
    });
  }, [mockOpportunities, activeTypeTab, appliedQuery, categoryFilter, minPrice, maxPrice, displayPicked, collectedIds]);

  // Operations
  const handleSearchSubmit = () => {
    setAppliedQuery(searchQuery);
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setAppliedQuery("");
    setCategoryFilter("All Category");
    setMinPrice("");
    setMaxPrice("");
    setDisplayPicked(false);
    toast.success("Filters reset successfully");
  };

  const handleCollectToggle = (id: string) => {
    setCollectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        setUploadedCount(c => Math.max(0, c - 1));
        toast.info("Removed from collected opportunities");
      } else {
        next.add(id);
        setUploadedCount(c => c + 1);
        toast.success("Opportunity collected! Check Uploaded Products.");
      }
      return next;
    });
  };

  // Listing Uploader Submit Sim
  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!listingPrice.trim()) {
      toast.error("Please specify a listing price");
      return;
    }
    toast.success(`Successfully uploaded "${uploadTargetItem?.title}" to store at ৳${listingPrice}!`);

    // Automatically collect too
    if (uploadTargetItem) {
      setCollectedIds((prev) => {
        const next = new Set(prev);
        if (!next.has(uploadTargetItem.id)) {
          next.add(uploadTargetItem.id);
          setUploadedCount(c => c + 1);
        }
        return next;
      });
    }

    setUploadTargetItem(null);
    setListingPrice("");
    setListingSku("");
  };

  return (
    <div className="w-full min-h-screen bg-[#F4F6F9]  font-sans text-sm text-[#333]">
      <div className="w-full bg-white rounded border border-slate-200 shadow-sm p-6 flex flex-col min-h-[calc(100vh-3rem)]">

        {/* Header Breadcrumbs, Title, Bulk action counters */}
        <div className="flex items-center justify-between mb-4 mt-2">
          <div className="flex flex-col">

            <h1 className="text-2xl font-bold text-slate-800">Opportunity Center</h1>
          </div>

          <div className="flex items-center gap-4 select-none">
            <button className="px-4 py-2 border border-gray-300 rounded text-gray-700 bg-white font-bold text-xs hover:border-[#1E60ED] hover:text-[#1E60ED] transition cursor-pointer">
              Bulk Upload
            </button>
            <div className="flex items-center gap-1 text-xs text-[#1E60ED] font-semibold cursor-pointer hover:underline">
              <span>{uploadedCount} Uploaded Products</span>
              <ChevronRight size={12} />
            </div>
          </div>
        </div>

        {/* Collapsible Info Alert Banner */}
        {isAlertOpen && (
          <div className="flex items-center justify-between px-4 py-3 bg-[#EBF8FF] border border-[#BEE3F8] text-[#2B6CB0] text-xs rounded mb-5 leading-normal animate-in fade-in select-none">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 shrink-0 text-[#3182CE]" />
              <span>
                To learn more about Opportunity Center,{" "}
                <a href="#learn" className="underline font-bold hover:text-[#2A4365]">
                  Click here
                </a>
                . Optimize your stock and search visibility based on customer analysis metrics.
              </span>
            </div>
            <button
              onClick={() => setIsAlertOpen(false)}
              className="text-[#3182CE] hover:text-[#2A4365] p-1 cursor-pointer"
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* Gradient Promotional Banner */}
        <div className="w-full bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-500 rounded-lg p-6 text-white mb-6 shadow-sm relative overflow-hidden select-none">
          <div className="max-w-xl relative z-10 flex flex-col gap-2">
            <span className="bg-white/20 text-white font-bold text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full w-fit">
              Traffic Accelerator
            </span>
            <h2 className="text-xl md:text-2xl font-black leading-tight tracking-wide">
              Receive 60D new product traffic boosting to clock more sales by listing these products!
            </h2>
            <p className="text-xs text-white/80 leading-normal">
              List high-demand catalog opportunities identified from shopper search patterns, wishlist metrics, and checkout gaps to gain priority indexing.
            </p>
          </div>
          {/* Mock floating background element */}
          <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-25 pointer-events-none hidden md:block">
            <ShoppingBag size={120} className="text-white" />
          </div>
        </div>

        {/* Filter Panel Container */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 mb-6 shadow-xs">

          {/* Opportunity Types Tab List */}
          <div className="flex flex-wrap items-center gap-3 border-b border-gray-150 pb-4 mb-4 select-none">
            <span className="text-xs text-gray-500 font-bold mr-2 uppercase">Opportunity Type</span>
            <button
              onClick={() => setActiveTypeTab("Marketplace Trending")}
              className={`px-4 py-2 border rounded-full text-xs font-bold transition-colors cursor-pointer ${activeTypeTab === "Marketplace Trending"
                  ? "bg-[#EFF6FF] border-[#1E60ED] text-[#1E60ED]"
                  : "bg-white border-gray-300 hover:border-gray-400 text-gray-700"
                }`}
            >
              Marketplace Trending (13,203) ⓘ
            </button>
            <button
              onClick={() => setActiveTypeTab("High Demand")}
              className={`px-4 py-2 border rounded-full text-xs font-bold transition-colors cursor-pointer ${activeTypeTab === "High Demand"
                  ? "bg-[#EFF6FF] border-[#1E60ED] text-[#1E60ED]"
                  : "bg-white border-gray-300 hover:border-gray-400 text-gray-700"
                }`}
            >
              High Demand Low Supply (9,452) ⓘ
            </button>
            <button
              onClick={() => setActiveTypeTab("Top Product")}
              className={`px-4 py-2 border rounded-full text-xs font-bold transition-colors cursor-pointer ${activeTypeTab === "Top Product"
                  ? "bg-[#EFF6FF] border-[#1E60ED] text-[#1E60ED]"
                  : "bg-white border-gray-300 hover:border-gray-400 text-gray-700"
                }`}
            >
              Top Product (11,135) ⓘ
            </button>
          </div>

          {/* Qualified Product Benefits Tag Row */}
          <div className="flex flex-wrap items-center gap-3 mb-4 select-none">
            <span className="text-xs text-gray-500 font-bold mr-2 uppercase">Qualified Benefits</span>
            <span className="px-3.5 py-1.5 border border-[#1E60ED] text-[#1E60ED] bg-[#EFF6FF] rounded text-xs font-semibold select-all">
              Effective New Boost - 1300 PV uplift (33,790) ⓘ
            </span>
          </div>

          {/* Collapsible Filter Inputs Row */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-[#FAFBFD] p-4 rounded border border-gray-150 animate-in slide-in-from-top-1">
              {/* Product/Style Keyword */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-600">Product/Style Keyword</label>
                <div className="relative bg-white rounded border border-gray-300 focus-within:border-[#1E60ED]">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Enter Keyword"
                    onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit()}
                    className="w-full pl-8 pr-8 py-1.5 text-xs focus:outline-none bg-transparent"
                  />
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  {searchQuery && (
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setAppliedQuery("");
                      }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>
              </div>

              {/* Category selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-600">Category</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded text-xs focus:border-[#1E60ED] focus:outline-none bg-white cursor-pointer"
                >
                  <option value="All Category">All Category</option>
                  <option value="Phone Cases">Phone Cases</option>
                  <option value="Phone Batteries">Phone Batteries</option>
                  <option value="Live Sound">Live Sound</option>
                  <option value="Headphones">Headphones</option>
                  <option value="Memory Cards">Memory Cards</option>
                </select>
              </div>

              {/* Price range inputs */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-600">Price (BDT)</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder="Minimum"
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:border-[#1E60ED] focus:outline-none bg-white"
                  />
                  <span className="text-gray-400 text-xs">-</span>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="Maximum"
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:border-[#1E60ED] focus:outline-none bg-white"
                  />
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleResetFilters}
                  className="w-1/2 px-4 py-1.5 border border-gray-300 hover:border-gray-400 text-gray-700 rounded text-xs transition bg-white cursor-pointer font-semibold"
                >
                  Reset
                </button>
                <button
                  onClick={handleSearchSubmit}
                  className="w-1/2 px-5 py-1.5 bg-[#1E60ED] hover:bg-[#164ec2] text-white rounded text-xs font-semibold cursor-pointer transition"
                >
                  Search
                </button>
              </div>
            </div>
          )}

          {/* Toggle Display Picked and Show Less link */}
          <div className="mt-4 flex items-center justify-between select-none">
            {/* Display Picked Toggle */}
            <div className="flex items-center gap-2">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={displayPicked}
                  onChange={(e) => setDisplayPicked(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#1E60ED]"></div>
              </label>
              <span className="text-xs font-bold text-gray-600">Display Picked Opportunities</span>
            </div>

            {/* Collapse link toggles */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="text-xs text-[#1E60ED] hover:underline font-semibold cursor-pointer"
            >
              {showFilters ? "Show Less ^" : "Show More v"}
            </button>
          </div>
        </div>

        {/* Opportunity Card Grid */}
        <div className="flex-1 flex flex-col">
          {filteredOpportunities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 flex-1 border border-dashed border-gray-200 rounded">
              <ShoppingBag className="w-14 h-14 text-gray-300 mb-2" />
              <span className="text-gray-400 font-semibold">No opportunities matched your filters</span>
              <span className="text-gray-400 text-xs mt-1">
                Try searching a different keyword or resetting filters.
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
              {filteredOpportunities.map((item) => {
                const isCollected = collectedIds.has(item.id);
                return (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row gap-4 p-4 border border-gray-200 rounded-lg hover:border-[#1E60ED] hover:shadow-xs bg-white transition duration-150"
                  >
                    {/* Left Product Image Thumbnail */}
                    <div className="w-full sm:w-36 h-36 border border-gray-150 rounded bg-slate-50 flex items-center justify-center overflow-hidden shrink-0 relative">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-contain p-2"
                        onError={(e) => {
                          e.currentTarget.src = "/img/noImage.jpg";
                        }}
                      />
                      {/* Top left discount or exposure multiplier */}
                      <span className="absolute left-1.5 top-1.5 bg-[#EFF6FF] border border-[#EFF6FF] text-[#1E60ED] font-bold text-[9px] px-1.5 py-0.5 rounded uppercase leading-none">
                        3x Exposure
                      </span>
                    </div>

                    {/* Right details */}
                    <div className="flex-1 flex flex-col min-w-0">
                      {/* Type Category Badge */}
                      <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#EBF8FF] text-[#2B6CB0] font-bold text-[9px] rounded uppercase w-fit select-none">
                        <TrendingUp size={10} />
                        <span>{item.type}</span>
                      </div>

                      {/* Title */}
                      <h4
                        title={item.title}
                        className="text-xs font-bold text-gray-800 truncate-2-lines mt-1.5 leading-snug"
                      >
                        {item.title}
                      </h4>

                      {/* Category Breadcrumbs */}
                      <span className="text-[10px] text-gray-400 truncate mt-1 leading-normal select-none">
                        {item.categoryPath}
                      </span>

                      {/* Pricing BDT & sales metrics */}
                      <div className="flex items-baseline gap-2 mt-2 select-none">
                        <span className="text-sm font-bold text-gray-800">৳{item.price}</span>
                        <span className="text-[10px] text-gray-400">
                          Sale: <strong className="text-gray-600 font-semibold">{item.saleRange}</strong>
                        </span>
                      </div>

                      {/* Boost Uplift Badges */}
                      <div className="flex flex-wrap gap-1.5 mt-2.5 select-none">
                        <span className="px-2 py-0.5 bg-purple-50 text-purple-600 border border-purple-100 rounded text-[9px] font-bold flex items-center gap-0.5">
                          <Zap size={9} /> {item.exposureUplift.replace(" Exposure uplift ⚡", "")}
                        </span>
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded text-[9px] font-bold flex items-center gap-0.5">
                          <Sparkles size={9} /> {item.boostType}
                        </span>
                      </div>

                      {/* Bottom Action buttons */}
                      <div className="flex gap-2.5 mt-auto pt-4 border-t border-gray-50">
                        {/* Collect Button */}
                        <button
                          onClick={() => handleCollectToggle(item.id)}
                          className={`w-1/2 flex items-center justify-center gap-1 px-3 py-1.5 border rounded text-xs font-bold transition cursor-pointer ${isCollected
                              ? "bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100"
                              : "border-[#1E60ED] text-[#1E60ED] hover:bg-[#EFF6FF]"
                            }`}
                        >
                          {isCollected ? (
                            <>
                              <Check size={13} strokeWidth={2.5} /> Collected
                            </>
                          ) : (
                            "Collect"
                          )}
                        </button>
                        {/* Upload Button */}
                        <button
                          onClick={() => {
                            setUploadTargetItem(item);
                            setListingPrice(item.price.toString());
                          }}
                          className="w-1/2 flex items-center justify-center gap-1 px-3 py-1.5 bg-[#1E60ED] hover:bg-[#164ec2] text-white border border-transparent rounded text-xs font-bold transition cursor-pointer"
                        >
                          <Upload size={12} /> Upload
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Bottom Pagination controls */}
          {filteredOpportunities.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-3 border border-gray-200 rounded-lg bg-[#FAFBFD] text-xs text-gray-500 select-none mt-auto">
              <div className="flex items-center gap-2">
                <span>Total {filteredOpportunities.length * 45}</span>
                <span className="text-gray-300">|</span>
                <span>Rows per page:</span>
                <select className="border border-gray-300 rounded px-1.5 py-0.5 bg-white cursor-pointer focus:outline-none">
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={40}>40</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <button disabled className="px-2 py-1.5 border border-gray-200 bg-white rounded cursor-not-allowed opacity-50 font-semibold">
                  &lt; Previous
                </button>
                <span className="px-3 py-1.5 bg-[#1E60ED] text-white font-bold rounded">1</span>
                <span className="px-3 py-1.5 hover:bg-gray-100 rounded border border-transparent cursor-pointer font-semibold">2</span>
                <span className="px-3 py-1.5 hover:bg-gray-100 rounded border border-transparent cursor-pointer font-semibold">3</span>
                <span className="px-3 py-1.5 hover:bg-gray-100 rounded border border-transparent cursor-pointer font-semibold">4</span>
                <span className="px-2 py-1.5">...</span>
                <span className="px-3 py-1.5 hover:bg-gray-100 rounded border border-transparent cursor-pointer font-semibold">147</span>
                <button disabled className="px-3 py-1.5 border border-gray-300 hover:border-gray-400 bg-white text-gray-700 rounded transition font-semibold cursor-pointer">
                  Next &gt;
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─────────────────── UPLOAD OPPORTUNITY POPUP MODAL ─────────────────── */}
      {uploadTargetItem && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-lg border border-gray-200 shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-4 py-3 bg-white border-b border-gray-100">
              <span className="font-bold text-gray-700 text-sm select-none">
                Upload Opportunity to Store
              </span>
              <button
                onClick={() => setUploadTargetItem(null)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleUploadSubmit} className="p-5 space-y-4">
              <div className="flex gap-3 bg-gray-50 p-2.5 border border-gray-100 rounded text-xs select-none">
                <div className="w-16 h-16 border border-gray-200 bg-white flex items-center justify-center shrink-0 p-1">
                  <img
                    src={uploadTargetItem.image}
                    alt={uploadTargetItem.title}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex flex-col justify-center min-w-0">
                  <span className="font-bold text-gray-700 truncate block">
                    {uploadTargetItem.title}
                  </span>
                  <span className="text-[10px] text-gray-400 block mt-1">
                    Analyzed BDT Price: ৳{uploadTargetItem.price}
                  </span>
                </div>
              </div>

              {/* Retail Price input */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  <span className="text-red-500 mr-1">*</span>Your Listing Price (BDT)
                </label>
                <input
                  type="number"
                  required
                  placeholder="Enter your price"
                  value={listingPrice}
                  onChange={(e) => setListingPrice(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-xs focus:border-[#1E60ED] focus:outline-none bg-white"
                  autoFocus
                />
              </div>

              {/* SKU code input */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Seller SKU (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. BB-MOBILE-CASE-01"
                  value={listingSku}
                  onChange={(e) => setListingSku(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-xs focus:border-[#1E60ED] focus:outline-none bg-white"
                />
              </div>

              {/* Action buttons */}
              <div className="pt-2 flex justify-end gap-2 text-xs border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setUploadTargetItem(null)}
                  className="px-4 py-2 border border-gray-300 rounded text-gray-700 bg-white hover:bg-gray-50 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1E60ED] hover:bg-[#164ec2] text-white rounded font-bold transition cursor-pointer"
                >
                  Submit to List
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
