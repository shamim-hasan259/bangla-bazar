"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  Users,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  PieChart as PieChartIcon,
  TrendingUp,
  UserPlus,
  Loader2,
} from "lucide-react";

import { OrderStatusChart } from "@/components/ui/OrderStatusChart";
import { TopProducts } from "@/components/ui/TopProducts";
import { GrowthOverview } from "@/components/ui/GrowthOverview";
import { Overview } from "@/components/ui/Overview";

export default function DashboardMain({}) {
  const [data, setData] = useState<any>(null);
  const [overViewData, setOverViewData] = useState<any[]>([]);
  const [orderStatusData, setOrderStatusData] = useState<any[]>([]);
  const [topProductsData, setTopProductsData] = useState<any[]>([]);
  const [customerGrowthData, setCustomerGrowthData] = useState<any[]>([]);
  const [sellerGrowthData, setSellerGrowthData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeDateFilter, setActiveDateFilter] = useState<"today" | "7days" | "30days" | "year">("today");

  const fetchDashboardStats = async (period: string) => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/admin/dashboard?period=${period}`);
      if (res.data) {
        setData(res.data);
        if (res.data.overViewData) setOverViewData(res.data.overViewData);
        if (res.data.orderStatusData) setOrderStatusData(res.data.orderStatusData);
        if (res.data.topProductsData) setTopProductsData(res.data.topProductsData);
        if (res.data.customerGrowthData) setCustomerGrowthData(res.data.customerGrowthData);
        if (res.data.sellerGrowthData) setSellerGrowthData(res.data.sellerGrowthData);
      }
    } catch (error) {
      console.error("Error fetching Dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats(activeDateFilter);
  }, [activeDateFilter]);

  const handleDateRangeClick = (period: "today" | "7days" | "30days" | "year") => {
    setActiveDateFilter(period);
  };

  const getPeriodLabel = () => {
    switch (activeDateFilter) {
      case "today":
        return "Today";
      case "7days":
        return "Last 7 Days";
      case "30days":
        return "Last 30 Days";
      case "year":
        return "Last Year";
      default:
        return "Selected Period";
    }
  };

  // Format Helper for large values
  const formatValue = (num: number) => {
    if (!num) return "0";
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  const periodLabel = getPeriodLabel();
  const revenueGrowth = data?.revenueGrowth ?? 12.5;
  const isPositiveGrowth = revenueGrowth >= 0;

  return (
    <div className="w-full font-sans bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs space-y-8 relative">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Dashboard</h1>
          {loading && <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />}
        </div>

        {/* Date Filter Buttons */}
        <div className="flex items-center gap-3">
          <div className="flex items-center space-x-1.5 bg-slate-50 dark:bg-slate-800 p-1.5 rounded-xl border border-slate-100 dark:border-slate-800">
            <button
              onClick={() => handleDateRangeClick("today")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold select-none transition-all ${
                activeDateFilter === "today"
                  ? "bg-[#1E60ED] text-white shadow-xs font-bold"
                  : "text-slate-600 hover:bg-slate-100/80 dark:text-slate-400 dark:hover:bg-slate-700/80"
              }`}
            >
              Today
            </button>
            <button
              onClick={() => handleDateRangeClick("7days")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold select-none transition-all ${
                activeDateFilter === "7days"
                  ? "bg-[#1E60ED] text-white shadow-xs font-bold"
                  : "text-slate-600 hover:bg-slate-100/80 dark:text-slate-400 dark:hover:bg-slate-700/80"
              }`}
            >
              Last 7 days
            </button>
            <button
              onClick={() => handleDateRangeClick("30days")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold select-none transition-all ${
                activeDateFilter === "30days"
                  ? "bg-[#1E60ED] text-white shadow-xs font-bold"
                  : "text-slate-600 hover:bg-slate-100/80 dark:text-slate-400 dark:hover:bg-slate-700/80"
              }`}
            >
              Last 30 days
            </button>
            <button
              onClick={() => handleDateRangeClick("year")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold select-none transition-all ${
                activeDateFilter === "year"
                  ? "bg-[#1E60ED] text-white shadow-xs font-bold"
                  : "text-slate-600 hover:bg-slate-100/80 dark:text-slate-400 dark:hover:bg-slate-700/80"
              }`}
            >
              Last Year
            </button>
          </div>
        </div>
      </div>

      <hr className="border-slate-100 dark:border-slate-800/80" />

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-0 md:divide-x divide-slate-100 dark:divide-slate-800/80">
        {/* Card 1: Total Revenue */}
        <div className="md:pr-6 space-y-2 flex justify-between items-end">
          <div className="space-y-2 flex-1">
            <span className="text-xs font-medium text-slate-400">Total Revenue</span>
            <div className="flex items-center gap-2">
              <div className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">
                ৳{(data?.revenue || 0).toLocaleString()}
              </div>
              <div
                className={`flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  isPositiveGrowth
                    ? "bg-emerald-50 text-emerald-500 dark:bg-emerald-950/20"
                    : "bg-rose-50 text-rose-500 dark:bg-rose-950/20"
                }`}
              >
                {isPositiveGrowth ? (
                  <ArrowUpRight className="w-3 h-3 shrink-0" />
                ) : (
                  <ArrowDownRight className="w-3 h-3 shrink-0" />
                )}
                <span>
                  {isPositiveGrowth ? "+" : ""}
                  {revenueGrowth}%
                </span>
              </div>
            </div>
            <div className="text-[11px] font-semibold text-slate-400">from last period</div>
          </div>
          {/* Sparkline */}
          <div className="w-20 h-10 shrink-0 pb-1">
            <svg viewBox="0 0 100 40" className="w-full h-full">
              <defs>
                <linearGradient id="revenue-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d="M0 30 Q25 35 50 15 T100 10 L100 40 L0 40 Z"
                fill="url(#revenue-gradient)"
              />
              <path
                d="M0 30 Q25 35 50 15 T100 10"
                fill="none"
                stroke="#10B981"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Card 2: Customers */}
        <div className="md:px-6 space-y-2 flex justify-between items-end">
          <div className="space-y-2 flex-1">
            <span className="text-xs font-medium text-slate-400">Total Customers</span>
            <div className="flex items-center gap-2">
              <div className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">
                {data?.totalCutomer || 0}
              </div>
              {data?.newCustomer !== undefined && data?.newCustomer > 0 && (
                <div className="flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-500 dark:bg-blue-950/20">
                  <ArrowUpRight className="w-3 h-3 shrink-0" />
                  <span>+{data?.newCustomer}</span>
                </div>
              )}
            </div>
            <div className="text-[11px] font-semibold text-slate-400">new this period</div>
          </div>
          {/* Sparkline */}
          <div className="w-20 h-10 shrink-0 pb-1">
            <svg viewBox="0 0 100 40" className="w-full h-full">
              <defs>
                <linearGradient id="customer-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d="M0 35 Q25 15 50 25 T100 10 L100 40 L0 40 Z"
                fill="url(#customer-gradient)"
              />
              <path
                d="M0 35 Q25 15 50 25 T100 10"
                fill="none"
                stroke="#3B82F6"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Card 3: Total Products */}
        <div className="md:px-6 space-y-2 flex justify-between items-end">
          <div className="space-y-2 flex-1">
            <span className="text-xs font-medium text-slate-400">Catalog Products</span>
            <div className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">
              {data?.products || 0}
            </div>
            <div className="text-[11px] font-semibold text-slate-400">Items in catalog</div>
          </div>
          {/* Sparkline */}
          <div className="w-20 h-10 shrink-0 pb-1">
            <svg viewBox="0 0 100 40" className="w-full h-full">
              <defs>
                <linearGradient id="product-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d="M0 25 Q25 20 50 30 T100 15 L100 40 L0 40 Z"
                fill="url(#product-gradient)"
              />
              <path
                d="M0 25 Q25 20 50 30 T100 15"
                fill="none"
                stroke="#F59E0B"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Card 4: Total Orders */}
        <div className="md:pl-6 space-y-2 flex justify-between items-end">
          <div className="space-y-2 flex-1">
            <span className="text-xs font-medium text-slate-400">Total Orders</span>
            <div className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">
              {data?.totalOrder || 0}
            </div>
            <div className="text-[11px] font-semibold text-slate-400">Processed this period</div>
          </div>
          {/* Sparkline */}
          <div className="w-20 h-10 shrink-0 pb-1">
            <svg viewBox="0 0 100 40" className="w-full h-full">
              <defs>
                <linearGradient id="order-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d="M0 30 Q25 15 50 35 T100 20 L100 40 L0 40 Z"
                fill="url(#order-gradient)"
              />
              <path
                d="M0 30 Q25 15 50 35 T100 20"
                fill="none"
                stroke="#8B5CF6"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </div>

      <hr className="border-slate-100 dark:border-slate-800/80" />

      {/* ── Admin Management Workflows (Seller Funnel Reference Design) ── */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-400">
          Marketplace Operations
        </h3>

        {/* 5-Column Funnel/Workflow Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 relative">
          {/* Column 1: Registered Vendors */}
          <div className="group bg-slate-50 dark:bg-slate-800/40 hover:bg-[#1E60ED] dark:hover:bg-[#1E60ED] rounded-xl p-4 flex flex-col justify-between min-h-[130px] shadow-xs hover:shadow-lg hover:shadow-blue-500/30 border border-slate-100/50 dark:border-slate-800/40 hover:border-[#1E60ED]/30 hover:scale-105 hover:-translate-y-1 hover:z-20 transition-all duration-300 cursor-pointer">
            <span className="text-[11px] font-semibold text-slate-400 group-hover:text-white/80 leading-none transition-colors">Registered Vendors</span>
            <span className="text-xl group-hover:text-2xl font-bold group-hover:font-black text-slate-800 dark:text-white group-hover:text-white mt-2 transition-all">{formatValue(data?.totalVendor || 0)}</span>
            <span className="text-[10px] font-bold text-transparent group-hover:text-white/90 text-left mt-2 flex items-center gap-0.5 transition-colors">Manage Vendors &gt;</span>
          </div>

          {/* Column 2: Active Stores */}
          <div className="group bg-slate-50 dark:bg-slate-800/40 hover:bg-[#1E60ED] dark:hover:bg-[#1E60ED] rounded-xl p-4 flex flex-col justify-between min-h-[130px] shadow-xs hover:shadow-lg hover:shadow-blue-500/30 border border-slate-100/50 dark:border-slate-800/40 hover:border-[#1E60ED]/30 hover:scale-105 hover:-translate-y-1 hover:z-20 transition-all duration-300 cursor-pointer">
            <span className="text-[11px] font-semibold text-slate-400 group-hover:text-white/80 leading-none transition-colors">Active Stores</span>
            <span className="text-xl group-hover:text-2xl font-bold group-hover:font-black text-slate-800 dark:text-white group-hover:text-white mt-2 transition-all">{formatValue(data?.totalStores || 0)}</span>
            <span className="text-[10px] font-bold text-transparent group-hover:text-white/90 text-left mt-2 flex items-center gap-0.5 transition-colors">View Stores &gt;</span>
          </div>

          {/* Column 3: Escrow Balance */}
          <div className="group bg-slate-50 dark:bg-slate-800/40 hover:bg-[#1E60ED] dark:hover:bg-[#1E60ED] rounded-xl p-4 flex flex-col justify-between min-h-[130px] shadow-xs hover:shadow-lg hover:shadow-blue-500/30 border border-slate-100/50 dark:border-slate-800/40 hover:border-[#1E60ED]/30 hover:scale-105 hover:-translate-y-1 hover:z-20 transition-all duration-300 cursor-pointer">
            <span className="text-[11px] font-semibold text-slate-400 group-hover:text-white/80 leading-none transition-colors">Escrow Ledger</span>
            <span className="text-xl group-hover:text-2xl font-bold group-hover:font-black text-slate-800 dark:text-white group-hover:text-white mt-2 transition-all">৳{formatValue(data?.escrowBalance || 0)}</span>
            <span className="text-[10px] font-bold text-transparent group-hover:text-white/90 text-left mt-2 flex items-center gap-0.5 transition-colors">Escrow Details &gt;</span>
          </div>

          {/* Column 4: Campaigns */}
          <div className="group bg-slate-50 dark:bg-slate-800/40 hover:bg-[#1E60ED] dark:hover:bg-[#1E60ED] rounded-xl p-4 flex flex-col justify-between min-h-[130px] shadow-xs hover:shadow-lg hover:shadow-blue-500/30 border border-slate-100/50 dark:border-slate-800/40 hover:border-[#1E60ED]/30 hover:scale-105 hover:-translate-y-1 hover:z-20 transition-all duration-300 cursor-pointer">
            <span className="text-[11px] font-semibold text-slate-400 group-hover:text-white/80 leading-none transition-colors">Active Campaigns</span>
            <span className="text-xl group-hover:text-2xl font-bold group-hover:font-black text-slate-800 dark:text-white group-hover:text-white mt-2 transition-all">{formatValue(data?.campaignsCount || 12)}</span>
            <span className="text-[10px] font-bold text-transparent group-hover:text-white/90 text-left mt-2 flex items-center gap-0.5 transition-colors">Campaign Hub &gt;</span>
          </div>

          {/* Column 5: Customers */}
          <div className="group bg-slate-50 dark:bg-slate-800/40 hover:bg-[#1E60ED] dark:hover:bg-[#1E60ED] rounded-xl p-4 flex flex-col justify-between min-h-[130px] shadow-xs hover:shadow-lg hover:shadow-blue-500/30 border border-slate-100/50 dark:border-slate-800/40 hover:border-[#1E60ED]/30 hover:scale-105 hover:-translate-y-1 hover:z-20 transition-all duration-300 cursor-pointer">
            <span className="text-[11px] font-semibold text-slate-400 group-hover:text-white/80 leading-none transition-colors">Active Customers</span>
            <span className="text-xl group-hover:text-2xl font-bold group-hover:font-black text-slate-800 dark:text-white group-hover:text-white mt-2 transition-all">{formatValue(data?.totalCutomer || 0)}</span>
            <span className="text-[10px] font-bold text-transparent group-hover:text-white/90 text-left mt-2 flex items-center gap-0.5 transition-colors">Customer List &gt;</span>
          </div>
        </div>
      </div>

      <hr className="border-slate-100 dark:border-slate-800/80" />

      {/* ── Analytics & Growth Section ── */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
        {/* Revenue Overview */}
        <div className="lg:col-span-4 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between min-h-[350px]">
          <div>
            <h4 className="text-[13px] font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              Revenue Overview
            </h4>
            <p className="text-[11px] text-slate-400 font-semibold mt-1">
              Revenue performance for {periodLabel}
            </p>
          </div>
          <div className="flex-1 w-full mt-2">
            <Overview data={overViewData} />
          </div>
        </div>

        {/* Order Status Breakdown */}
        <div className="lg:col-span-3 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between min-h-[350px]">
          <div>
            <h4 className="text-[13px] font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <PieChartIcon className="w-4 h-4 text-blue-500" />
              Order Status Breakdown
            </h4>
            <p className="text-[11px] text-slate-400 font-semibold mt-1">
              Distribution of order statuses ({periodLabel})
            </p>
          </div>
          <div className="flex-1 w-full flex items-center justify-center">
            <OrderStatusChart data={orderStatusData} />
          </div>
        </div>
      </div>

      <hr className="border-slate-100 dark:border-slate-800/80" />

      {/* ── Customer & Seller Registration Growth Section ── */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
        {/* Customer Registration Growth */}
        <div className="lg:col-span-4 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between min-h-[350px]">
          <div>
            <h4 className="text-[13px] font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              Customer Registration Growth
            </h4>
            <p className="text-[11px] text-slate-400 font-semibold mt-1">
              New customer sign-ups ({periodLabel})
            </p>
          </div>
          <div className="flex-1 w-full mt-2">
            <GrowthOverview data={customerGrowthData} type="customer" />
          </div>
        </div>

        {/* Seller Registration Growth */}
        <div className="lg:col-span-3 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between min-h-[350px]">
          <div>
            <h4 className="text-[13px] font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-amber-500" />
              Seller Registration Growth
            </h4>
            <p className="text-[11px] text-slate-400 font-semibold mt-1">
              New seller onboarding ({periodLabel})
            </p>
          </div>
          <div className="flex-1 w-full mt-2">
            <GrowthOverview data={sellerGrowthData} type="seller" />
          </div>
        </div>
      </div>

      <hr className="border-slate-100 dark:border-slate-800/80" />

      {/* ── Top Selling Products Row ── */}
      <div className="grid grid-cols-1 gap-6">
        <div className="border border-slate-100 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between min-h-[300px]">
          <div>
            <h4 className="text-[13px] font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Package className="w-4 h-4 text-amber-500" />
              Top Selling Products
            </h4>
            <p className="text-[11px] text-slate-400 font-semibold mt-1">
              Best selling items by quantity and revenue ({periodLabel})
            </p>
          </div>
          <div className="flex-1 w-full mt-4">
            <TopProducts data={topProductsData} />
          </div>
        </div>
      </div>
    </div>
  );
}



