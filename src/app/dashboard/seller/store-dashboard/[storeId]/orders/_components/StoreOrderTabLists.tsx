"use client";

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import StoreDataTable from "./StoreDataTable";
import { getStoreColumns } from "./storeColumns";
import { Input } from "@/components/ui/input";
import { Search, Package } from "lucide-react";

interface StoreOrderTabListsProps {
  storeId: string;
  data: any[];
}

const TAB_LINKS = [
  { title: "All", value: "all" },
  { title: "Pending", value: "Pending" },
  { title: "Processing", value: "Processing" },
  { title: "Shipped", value: "Shipped" },
  { title: "Delivered", value: "Delivered" },
  { title: "Canceled", value: "Canceled" },
];

export default function StoreOrderTabLists({
  storeId,
  data = [],
}: StoreOrderTabListsProps) {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const columns = getStoreColumns(storeId);

  // Filter orders by tab and search
  const filteredData = data.filter((order) => {
    // Tab match
    const tabMatch = activeTab === "all" || order.status === activeTab;

    // Search match (by invoiceId or customer name/phone)
    const searchLower = searchQuery.toLowerCase();
    const invoiceMatch = order.invoiceId?.toLowerCase().includes(searchLower);
    const customerMatch =
      order.deliveryAddress?.name?.toLowerCase().includes(searchLower) ||
      order.deliveryAddress?.phone?.toLowerCase().includes(searchLower);

    return tabMatch && (invoiceMatch || customerMatch);
  });

  return (
    <div className="w-full space-y-4 animate-in fade-in duration-300">
      {/* Tabs */}
      <Tabs
        defaultValue="all"
        onValueChange={setActiveTab}
        className="w-full bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-100 dark:border-slate-800 shadow-xs"
      >
        <TabsList className="w-full justify-start h-auto p-0 bg-transparent border-b rounded-none overflow-x-auto overflow-y-hidden gap-6">
          {TAB_LINKS.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className={cn(
                "data-[state=active]:text-[#1E60ED] data-[state=active]:border-b-2 data-[state=active]:border-[#1E60ED] rounded-none px-2 py-3 text-xs font-bold text-slate-500 transition-all hover:text-slate-800 dark:hover:text-slate-200 data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent"
              )}
            >
              {tab.title}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Search Filter input */}
        <div className="mt-4 flex items-center gap-4">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search by invoice ID, name or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 text-xs rounded-xl border-slate-200"
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="mt-4">
          <StoreDataTable columns={columns} data={filteredData} />
        </div>
      </Tabs>
    </div>
  );
}
