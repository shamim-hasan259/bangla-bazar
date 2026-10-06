"use client";

import React from "react";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export function GrowthOverview({ data, type }: { data: any[]; type: "customer" | "seller" }) {
  const stopColor = type === "customer" ? "#3b82f6" : "#f59e0b";
  const labelText = type === "customer" ? "Customer Growth" : "Seller Growth";
  const gradientId = type === "customer" ? "colorCustomer" : "colorSeller";

  return (
    <div className="w-full h-[300px] mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={stopColor} stopOpacity={0.3} />
              <stop offset="95%" stopColor={stopColor} stopOpacity={0.0} />
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
            tickFormatter={(value: any) => `${value}`}
            dx={-5}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xl flex flex-col gap-1 transition-all">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold">
                      {labelText}
                    </span>
                    <span className="text-base font-bold text-slate-900 dark:text-slate-100">
                      {payload[0].value} New {type === "customer" ? "Customers" : "Sellers"}
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
            dataKey="count"
            stroke={stopColor}
            strokeWidth={3}
            fillOpacity={1}
            fill={`url(#${gradientId})`}
            activeDot={{
              r: 6,
              stroke: stopColor,
              strokeWidth: 2,
              fill: "#fff",
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
