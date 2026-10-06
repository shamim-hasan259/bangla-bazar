"use client";

import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export function Overview({ data }: { data: any[] }) {
  return (
    <div className="w-full h-[350px] mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            className="stroke-slate-200 dark:stroke-slate-800"
          />
          <XAxis
            dataKey="name"
            stroke="#888888"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            dy={10}
          />
          <YAxis
            stroke="#888888"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value: any) => `৳${value}`}
            dx={-5}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xl flex flex-col gap-1 transition-all">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold">
                      Revenue Overview
                    </span>
                    <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                      ৳{payload[0].value?.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {payload[0].payload.name}
                    </span>
                  </div>
                );
              }
              return null;
            }}
          />
          <Area
            type="monotone"
            dataKey="total"
            stroke="#10b981"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorRevenue)"
            activeDot={{
              r: 6,
              stroke: "#10b981",
              strokeWidth: 2,
              fill: "#fff",
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
