"use client";

import { Package } from "lucide-react";

export function TopProducts({ data }: { data: any[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[250px] text-muted-foreground text-sm">
        No data available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {data.map((product, index) => (
        <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center shrink-0">
              <Package className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium leading-none truncate max-w-[150px] md:max-w-[200px]">
                {product.name}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {product.quantity} sold
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
              ৳{product.revenue.toLocaleString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
