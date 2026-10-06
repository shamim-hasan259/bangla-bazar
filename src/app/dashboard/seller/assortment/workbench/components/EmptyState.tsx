import React from "react";

export default function EmptyState() {
  return (
    <div className="py-20 flex flex-col items-center justify-center space-y-3 bg-white border border-dashed border-gray-200 rounded-xl">
      {/* Premium Minimal Empty Icon */}
      <div className="relative w-16 h-16 flex items-center justify-center bg-gradient-to-tr from-blue-50 to-indigo-50/50 rounded-full shadow-inner">
        <svg className="w-8 h-8 text-blue-400/80" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
        </svg>
        <span className="absolute top-2 right-2 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
        </span>
      </div>
      <p className="text-xs text-gray-400 font-medium">No data</p>
    </div>
  );
}