import React from "react";
import EmptyState from "./EmptyState";

export default function PotentialHeroProducts() {
  return (
    <div className="space-y-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      
      {/* Top Split Benefits Panel */}
      <div className="grid grid-cols-1 md:grid-cols-12 border border-orange-200 rounded-xl overflow-hidden text-xs">
        {/* Left Indicator */}
        <div className="md:col-span-3 bg-blue-50/50 p-4 border-r border-gray-100 flex flex-col justify-between">
          <h4 className="font-bold text-blue-900 text-sm">PHP Benefits</h4>
          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-4">
            <div className="bg-blue-500 h-1.5 rounded-full w-[0%]" />
          </div>
          <div className="text-right text-[10px] text-gray-400 mt-1">0 / 0 Products</div>
        </div>

        {/* Right Perks Detail Grid */}
        <div className="md:col-span-9 p-4 bg-blue-50/50/10 space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-y-2 text-slate-700">
            <div>🔑 <span className="font-bold">Unlock Benefits</span></div>
            <div className="flex items-center gap-1 text-[#1E60ED]">🏆 Higher priority for flash sale slot</div>
            <div className="flex items-center gap-1 text-purple-600">⭐ Increased Traffic</div>
            <div>📋 <span className="font-semibold text-gray-500">Complete 4 Tasks</span></div>
            <div className="flex items-center gap-1 text-indigo-600">📦 Ensure ALL visible SKUs are in stock</div>
            <div className="flex items-center gap-1 text-teal-600">🚚 Join Free Shipping (FSM)</div>
          </div>
          <div className="flex gap-6 border-t border-orange-100 pt-2 text-[11px] text-gray-400 flex-wrap">
            <span className="flex items-center gap-1">👁️ A+/Mega Campaign Visibility</span>
            <span className="flex items-center gap-1">🤝 Join A+/Mega Campaign</span>
            <span className="flex items-center gap-1">💰 Join Coins Discount</span>
          </div>
        </div>
      </div>

      {/* Missed Benefits Counter Tag */}
      <div className="flex items-center gap-2 text-xs pt-2">
        <span className="text-gray-500">Missed Benefits:</span>
        <span className="bg-slate-100 text-gray-600 px-2 py-0.5 rounded-md font-medium">PHP Benefits (0)</span>
      </div>

      {/* Grid Filtering Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2">
        <div className="flex border border-gray-200 rounded-lg overflow-hidden text-xs bg-white col-span-2 focus-within:border-orange-400">
          <select className="bg-gray-50 px-3 border-r border-gray-200 font-medium text-gray-600 outline-none">
            <option>Product Title</option>
          </select>
          <input type="text" placeholder="Search by product id or title" className="px-3 py-2 w-full outline-none" />
        </div>
        <select className="border border-gray-200 rounded-lg p-2 text-xs bg-white text-gray-400 outline-none">
          <option>Select Category</option>
        </select>
        <div className="flex justify-end">
          <button className="px-4 py-2 border border-gray-200 rounded-lg text-xs font-medium hover:bg-gray-50 bg-white">Reset</button>
        </div>
      </div>

      {/* Table Structure Header */}
      <div className="bg-slate-50 rounded-lg p-3 grid grid-cols-4 text-xs font-semibold text-gray-500 mt-4 border border-slate-100">
        <div>Product Info</div>
        <div>Performance(vs Last Month) ⓘ</div>
        <div>Price & Stock</div>
        <div>Available Benefits</div>
      </div>

      {/* Data Render Area */}
      <EmptyState />
    </div>
  );
}