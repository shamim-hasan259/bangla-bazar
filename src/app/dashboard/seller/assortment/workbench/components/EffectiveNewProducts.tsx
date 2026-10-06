import React from "react";
import EmptyState from "./EmptyState";

export default function EffectiveNewProducts() {
  return (
    <div className="space-y-5">

      {/* ── 3x Traffic Support Header ─────────────────────────────────── */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5 space-y-4">

        {/* Title row */}
        <div className="flex items-center gap-2">
          <span className="text-base">🚩</span>
          <span className="text-sm font-bold text-gray-800">
            Get <span className="text-[#1E60ED]">Up to 3x Traffic Support!</span>
          </span>
          <span className="text-[11px] text-gray-400">ⓘ</span>
          <a href="#" className="text-[11px] text-blue-500 hover:underline font-normal ml-1">Learn more</a>
        </div>

        {/* Tasks box */}
        <div className="border border-orange-200/60 bg-[#FFFBF7] rounded-lg overflow-hidden">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3 text-xs">
            <span className="font-bold text-gray-700 bg-white border border-gray-200 px-2.5 py-1 rounded text-[11px]">
              Complete 3 Tasks
            </span>
            <span className="flex items-center gap-1.5 text-gray-600">
              <span className="text-purple-500">💰</span> Join Early Bird Price Discount
              <span className="text-[10px] text-gray-400 font-normal">(Mandatory)</span>
            </span>
            <span className="flex items-center gap-1.5 text-gray-600">
              <span className="text-[#1E60ED]">🚚</span> Join Free Shipping (FSM)
            </span>
            <span className="flex items-center gap-1.5 text-gray-600">
              <span className="text-teal-500">💎</span> Join A+/Mega Campaign
            </span>
          </div>
          <div className="px-4 py-2 border-t border-orange-100 bg-[#FFF9F2] text-[10px] text-gray-400 leading-normal">
            ⓘ Enrolling in the Early Bird Pricing Program is <strong className="text-gray-500">mandatory</strong> to join. Completing the remaining two tasks will help to further boost your sales.
          </div>
        </div>

        {/* KPI metric cards 2×2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { label: "Products currently boosted", value: "0", icon: "🚀", suffix: "" },
            { label: "L60D Effective New Product Orders in L14D", value: "0", icon: "", suffix: "vs L14 days" },
            { label: "Boosted & Selling Products", value: "0", icon: "", suffix: "vs L14 days" },
            { label: "L60D Effective New Product GMV in L14D", value: "৳ —", icon: "👛", suffix: "" },
          ].map((kpi, i) => (
            <div key={i} className="bg-[#FAFBFC] border border-gray-100 rounded-lg p-4 flex items-start justify-between">
              <div>
                <p className="text-[11px] text-gray-500 flex items-center gap-1">
                  {kpi.label} <span className="text-gray-300">ⓘ</span>
                </p>
                <p className="text-lg font-bold text-gray-800 mt-1.5 flex items-center gap-1.5">
                  {kpi.value}
                  {kpi.icon && <span className="text-sm">{kpi.icon}</span>}
                  {kpi.suffix && (
                    <span className="text-[10px] text-gray-400 font-normal ml-1">{kpi.suffix}</span>
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Target incentive bar */}
        <div className="bg-[#EFF6FF] border border-blue-100 rounded-lg px-4 py-3 flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center gap-1.5">
            <span>Quickly complete tasks for <strong className="text-[#1E60ED] text-[13px]">0</strong> products to receive traffic boost!</span>
          </div>
          <div className="text-gray-400 text-[11px]">
            👤 Re**et reached <span className="text-[#1E60ED] font-bold">649 orders</span>
          </div>
        </div>
      </div>

      {/* ── Filtering & Table ─────────────────────────────────────────── */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5 space-y-4">

        {/* Status filter row */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-gray-400 font-medium">Current Status <span className="text-gray-300">ⓘ</span>:</span>
          <button className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded font-semibold border border-gray-200 text-[11px]">
            Tasks or Orders Pending
          </button>
          <button className="px-3 py-1.5 bg-white text-gray-500 rounded border border-gray-200 hover:bg-gray-50 text-[11px]">
            Promoted
          </button>
          <button className="px-3 py-1.5 bg-white text-gray-500 rounded border border-gray-200 hover:bg-gray-50 text-[11px]">
            Dropped out
          </button>
          <div className="ml-auto">
            <button className="px-4 py-1.5 border border-gray-200 rounded text-[11px] font-medium text-gray-500 bg-white hover:bg-gray-50">
              Reset
            </button>
          </div>
        </div>

        {/* Search & filter row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Product Title search */}
          <div className="md:col-span-4 flex border border-gray-200 rounded overflow-hidden text-xs bg-white focus-within:border-[#1E60ED]">
            <div className="bg-gray-50 px-3 py-2 border-r border-gray-200 text-gray-500 font-medium whitespace-nowrap flex items-center gap-1 text-[11px]">
              Product Title
              <svg className="w-2.5 h-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
            </div>
            <div className="flex items-center flex-1 px-2 gap-1">
              <input type="text" placeholder="Search by product id or title" className="py-2 w-full outline-none text-xs text-gray-600 placeholder-gray-400" />
              <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
          </div>

          {/* Product Stage */}
          <div className="md:col-span-3">
            <div className="flex items-center border border-gray-200 rounded bg-white text-xs">
              <span className="text-gray-500 font-medium px-3 py-2 border-r border-gray-200 whitespace-nowrap text-[11px]">Product Stage</span>
              <select className="flex-1 px-2 py-2 outline-none text-gray-400 bg-transparent text-[11px] cursor-pointer">
                <option>Select Product Round</option>
              </select>
            </div>
          </div>

          {/* New Item Source */}
          <div className="md:col-span-3">
            <div className="flex items-center border border-gray-200 rounded bg-white text-xs">
              <span className="text-gray-500 font-medium px-3 py-2 border-r border-gray-200 whitespace-nowrap text-[11px]">New Item Source</span>
              <select className="flex-1 px-2 py-2 outline-none text-gray-400 bg-transparent text-[11px] cursor-pointer">
                <option>Select Item Type</option>
              </select>
            </div>
          </div>

          {/* empty spacer */}
          <div className="md:col-span-2" />
        </div>

        {/* Table header */}
        <div className="bg-[#FAFBFC] border border-gray-100 rounded p-3 grid grid-cols-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
          <div>Product Information</div>
          <div>Product Performance <span className="text-gray-300">ⓘ</span></div>
          <div>Boosting Tasks & Status <span className="text-gray-300">ⓘ</span></div>
        </div>

        {/* Empty state */}
        <EmptyState />
      </div>
    </div>
  );
}