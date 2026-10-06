"use client";
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { DataTable } from "../_components/data-table";
import { columns } from "../_components/coulumns";
import { Input } from "@/components/ui/input";
import { Search, Info, ChevronDown, Package, Truck, Handshake } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Products {
  id: string;
}

interface Orders {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  country: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  products: Products[];
  totalPrice: number;
  status: string;
  createdAt: Date;
}

const OrderTabLists = ({ data }: { data: Orders[] | any }) => {
  const [activeTab, setActiveTab] = useState("all");
  const [activeSubTab, setActiveSubTab] = useState("to_pack");

  return (
    <div className="w-full space-y-4">
      <Tabs defaultValue="all" onValueChange={setActiveTab} className="w-full bg-white dark:bg-slate-950 rounded-lg p-2 shadow-sm">
        <TabsList className="w-full justify-start h-auto p-0 bg-transparent border-b rounded-none overflow-x-auto overflow-y-hidden">
          {orderTabListLinks.map((link) => (
            <TabsTrigger
              key={link.value}
              className={cn(
                "data-[state=active]:text-[#1E60ED] data-[state=active]:border-b-2 data-[state=active]:border-[#1E60ED] rounded-none px-6 py-3 text-sm font-medium text-slate-600 transition-all hover:text-[#1E60ED] data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              )}
              value={link.value}
            >
              {link.title}
            </TabsTrigger>
          ))}
        </TabsList>

        {activeTab === "to ship" && (
          <div className="mt-4 grid grid-cols-3 gap-4">
            <button
              onClick={() => setActiveSubTab("to_pack")}
              className={cn(
                "flex items-center justify-center gap-2 py-3 rounded-lg border transition-all font-medium text-sm",
                activeSubTab === "to_pack" 
                  ? "border-[#1E60ED] text-[#1E60ED] bg-blue-50/50 dark:bg-orange-950/20 shadow-sm" 
                  : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900"
              )}
            >
              <Package className="size-4" /> To Pack
            </button>
            <button
              onClick={() => setActiveSubTab("to_arrange_shipment")}
              className={cn(
                "flex items-center justify-center gap-2 py-3 rounded-lg border transition-all font-medium text-sm",
                activeSubTab === "to_arrange_shipment" 
                  ? "border-[#1E60ED] text-[#1E60ED] bg-blue-50/50 dark:bg-orange-950/20 shadow-sm" 
                  : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900"
              )}
            >
              <Truck className="size-4" /> To Arrange Shipment
            </button>
            <button
              onClick={() => setActiveSubTab("to_handover")}
              className={cn(
                "flex items-center justify-center gap-2 py-3 rounded-lg border transition-all font-medium text-sm",
                activeSubTab === "to_handover" 
                  ? "border-[#1E60ED] text-[#1E60ED] bg-blue-50/50 dark:bg-orange-950/20 shadow-sm" 
                  : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900"
              )}
            >
              <Handshake className="size-4" /> To Handover
            </button>
          </div>
        )}

        {/* Filters Section (Always visible, but could be specific to tabs) */}
        <div className="mt-4 p-4 border rounded-lg bg-white dark:bg-slate-950 space-y-4 shadow-sm">
          {/* SLA Section */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold bg-red-600 text-white px-1.5 py-0.5 rounded shadow-sm">NEW</span>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 mr-2">Fulfillment SLA:</span>
            <button className="flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-full text-xs font-medium text-slate-600 dark:text-slate-300 transition-colors">
              About to Breach SLA(0) <Info className="size-3 text-slate-400" />
            </button>
            <button className="flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-full text-xs font-medium text-slate-600 dark:text-slate-300 transition-colors">
              SLA Breached(0) <Info className="size-3 text-slate-400" />
            </button>
          </div>

          {/* Print Status */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 mr-2">Print Status:</span>
            {["AWB Unprinted", "AWB Printed", "Invoice Unprinted", "Invoice Printed", "PickList Unprinted", "PickList Printed"].map((status) => (
              <button key={status} className="px-3 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-full text-xs font-medium text-slate-600 dark:text-slate-300 transition-colors">
                {status}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="flex items-center justify-between">
            <div className="relative w-64 flex items-center">
              <Input 
                placeholder="Order Number" 
                className="pl-3 pr-16 h-9 rounded-md border-slate-200 dark:border-slate-800 focus-visible:ring-[#1E60ED]" 
              />
              <div className="absolute right-0 top-0 h-full flex items-center">
                 <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>
                 <button className="h-full px-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                    <Search className="size-4" />
                 </button>
              </div>
            </div>
            
            <Button variant="ghost" className="text-[#1E60ED] hover:text-[#1E60ED] hover:bg-blue-50/50 dark:hover:bg-orange-950/20 text-sm h-9 px-3 gap-1">
              More <ChevronDown className="size-4" />
            </Button>
          </div>
        </div>

        <div className="mt-4 bg-white dark:bg-slate-950 rounded-lg p-0">
           <TabsContent value="all" className="mt-0">
             <DataTable columns={columns} data={data} />
           </TabsContent>
           <TabsContent value="unpaid" className="mt-0">
             <DataTable columns={columns} data={data?.filter((o: any) => o.status === 'Unpaid') || []} />
           </TabsContent>
           <TabsContent value="to ship" className="mt-0">
             <DataTable columns={columns} data={data?.filter((o: any) => o.status === 'Pending' || o.status === 'OrderPlaced' || o.status === 'Processing') || []} />
           </TabsContent>
           <TabsContent value="shipping" className="mt-0">
             <DataTable columns={columns} data={data?.filter((o: any) => o.status === 'Shipped') || []} />
           </TabsContent>
           <TabsContent value="delivered" className="mt-0">
             <DataTable columns={columns} data={data?.filter((o: any) => o.status === 'Delivered') || []} />
           </TabsContent>
           <TabsContent value="failed delivery" className="mt-0">
             <DataTable columns={columns} data={data?.filter((o: any) => o.status === 'Failed Delivery') || []} />
           </TabsContent>
           <TabsContent value="cancellation" className="mt-0">
             <DataTable columns={columns} data={data?.filter((o: any) => o.status === 'Canceled') || []} />
           </TabsContent>
           <TabsContent value="return or refund" className="mt-0">
             <DataTable columns={columns} data={data?.filter((o: any) => o.status === 'Return') || []} />
           </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default OrderTabLists;

const orderTabListLinks = [
  { title: "All", value: "all" },
  { title: "Unpaid", value: "unpaid" },
  { title: "To Ship", value: "to ship" },
  { title: "Shipping", value: "shipping" },
  { title: "Delivered", value: "delivered" },
  { title: "Failed Delivery", value: "failed delivery" },
  { title: "Cancellation", value: "cancellation" },
  { title: "Return Or Refund", value: "return or refund" },
];
