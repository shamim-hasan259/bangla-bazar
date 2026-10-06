 import React from "react";
import prisma from "@/index";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import PageTitle from "@/components/ui/PageTitle";
import {
  Package,
  ShoppingBag,
  TrendingUp,
  Store,
  Layers,
  ArrowUpRight,
  Eye,
  Plus,
  Settings,
  MessageSquare,
  Sparkles,
  Boxes,
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function StoreDashboardPage({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) {
  const session = await getServerSession(authOptions);
  const { storeId } = await params;

  if (!session || !session.user) {
    redirect("/auth/login");
  }

  // Find Seller
  const seller = await prisma.seller.findFirst({
    where: {
      OR: [
        { id: session.user.id },
        { phone: session.user.phone || undefined },
        { email: session.user.email || undefined },
      ],
    },
  });

  if (!seller) {
    redirect("/dashboard/seller");
  }

  // Find Store
  const store = await prisma.store.findFirst({
    where: {
      id: storeId,
      sellerId: seller.id,
      deletedAt: null,
    },
    include: {
      masterCategory: true,
      _count: {
        select: {
          products: true,
        },
      },
    },
  });

  if (!store) {
    redirect("/dashboard/seller/store");
  }

  // Pending/Rejected check
  if (store.status === "Pending" || store.status === "Rejected") {
    redirect("/dashboard/seller/store");
  }

  // Query store's products
  const recentProducts = await prisma.product.findMany({
    where: {
      storeId: store.id,
    },
    take: 5,
    orderBy: {
      createdAt: "desc",
    },
  });

  // Fetch total sales count (all-time) for Store Orders KPI
  const totalOrdersCount = await prisma.sales.count({
    where: {
      storeIds: { has: store.id },
    },
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* ── Welcome Banner / Header ── */}
      <div className="bg-gradient-to-r from-[#1E60ED] to-[#00A2FF] rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-lg shadow-blue-500/10">
        {/* Subtle grid background pattern */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
        
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs font-bold w-fit border border-white/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Store ID: {store.slug}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">{store.storeNameEn}</h1>
          <p className="text-sm text-blue-100 max-w-xl font-medium">
            Welcome to your store dashboard. Add featured collections, manage inventory, and message customers.
          </p>
        </div>
      </div>

      {/* ── KPI Stats Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Products */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-xs relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-slate-400 dark:text-slate-500 text-[11px] font-bold uppercase tracking-wider block">Total Products</span>
              <span className="text-3xl font-black text-slate-800 dark:text-white mt-2 block">{store._count.products}</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/20 flex items-center justify-center">
              <Package className="w-6 h-6 text-[#1E60ED]" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
            <span>Live catalog items</span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-xs relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-slate-400 dark:text-slate-500 text-[11px] font-bold uppercase tracking-wider block">Store Orders</span>
              <span className="text-3xl font-black text-slate-800 dark:text-white mt-2 block">{totalOrdersCount}</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/20 flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
            <span className="bg-emerald-50 dark:bg-emerald-950/20 px-1.5 py-0.5 rounded-sm">↗ 14%</span>
            <span className="text-slate-400 font-normal">vs last month</span>
          </div>
        </div>

        {/* Store Category */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-xs relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-slate-400 dark:text-slate-500 text-[11px] font-bold uppercase tracking-wider block">Master Category</span>
              <span className="text-lg font-black text-slate-800 dark:text-white mt-3 block truncate max-w-[150px]">
                {store.masterCategory.name}
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/20 flex items-center justify-center">
              <Layers className="w-6 h-6 text-amber-500" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-[11px] font-semibold text-slate-400">
            <span>Locked Selection</span>
          </div>
        </div>

        {/* Store Status */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-xs relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-slate-400 dark:text-slate-500 text-[11px] font-bold uppercase tracking-wider block">Store Status</span>
              <span className="text-lg font-black mt-3 block capitalize text-emerald-600">
                {store.status === "Approved" ? "Active" : store.status}
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center">
              <Store className="w-6 h-6 text-emerald-500" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-[11px] font-semibold text-slate-400">
            <span>Public storefront enabled</span>
          </div>
        </div>
      </div>

      {/* ── Main Layout Body ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Recent Products */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-xs lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-base font-bold text-slate-800 dark:text-white">Recent Products</h2>
            <Link
              href={`/dashboard/seller/store-dashboard/${store.id}/products`}
              className="text-xs text-[#1E60ED] font-bold flex items-center gap-0.5 hover:underline"
            >
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentProducts.length === 0 ? (
            <div className="text-center py-12 text-slate-450">
              <Package className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
              <p className="text-sm">No products listed in this store yet.</p>
              <Link
                href={`/dashboard/seller/store-dashboard/${store.id}/products/create`}
                className="text-xs text-[#1E60ED] font-bold mt-2 inline-block hover:underline"
              >
                Add Your First Product
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentProducts.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3.5 border border-slate-100 dark:border-slate-850 rounded-2xl hover:border-slate-200 dark:hover:border-slate-800 transition-all text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-50 border rounded-lg shrink-0 overflow-hidden flex items-center justify-center">
                      {p.photo ? (
                        <img src={p.photo} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-4 h-4 text-slate-450" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-slate-850 dark:text-slate-200 line-clamp-1">{p.name}</p>
                      <p className="text-slate-400 text-[10px] mt-0.5">Price: ৳ {p.price}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-700 dark:text-slate-350 block">Stock: {p.stock ?? 0}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Quick Workflows */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-6">
          <h2 className="text-base font-bold text-slate-800 dark:text-white">Quick Operations</h2>
          
          <div className="space-y-3">
            {/* Create Product */}
            <Link
              href={`/dashboard/seller/store-dashboard/${store.id}/products/create`}
              className="flex items-center gap-3 p-4 bg-blue-50/50 hover:bg-blue-50 dark:bg-slate-850 dark:hover:bg-slate-800/80 rounded-2xl border border-blue-100/20 group transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-100/50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                <Plus className="w-5 h-5 text-[#1E60ED]" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-white block group-hover:text-[#1E60ED] transition-colors">
                  Add New Product
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5 block">List items under this storefront category</span>
              </div>
            </Link>

            {/* Manage Profile */}
            <Link
              href={`/dashboard/seller/store-dashboard/${store.id}/profile`}
              className="flex items-center gap-3 p-4 bg-amber-50/50 hover:bg-amber-50 dark:bg-slate-850 dark:hover:bg-slate-800/80 rounded-2xl border border-amber-100/20 group transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-100/50 dark:bg-amber-900/20 flex items-center justify-center shrink-0">
                <Settings className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-white block group-hover:text-amber-600 transition-colors">
                  Edit Store Profile
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5 block">Hours, Return Policies, SEO, Vacation mode</span>
              </div>
            </Link>

            {/* Messages */}
            <Link
              href={`/dashboard/seller/store-dashboard/${store.id}/messages`}
              className="flex items-center gap-3 p-4 bg-emerald-50/50 hover:bg-emerald-50 dark:bg-slate-850 dark:hover:bg-slate-800/80 rounded-2xl border border-emerald-100/20 group transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-100/50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0">
                <MessageSquare className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-white block group-hover:text-emerald-600 transition-colors">
                  Customer Chats
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5 block">Chat live and address product queries</span>
              </div>
            </Link>

            {/* Inventory */}
            <Link
              href={`/dashboard/seller/store-dashboard/${store.id}/inventory/stock`}
              className="flex items-center gap-3 p-4 bg-indigo-50/50 hover:bg-indigo-50 dark:bg-slate-850 dark:hover:bg-slate-800/80 rounded-2xl border border-indigo-100/20 group transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-100/50 dark:bg-indigo-900/20 flex items-center justify-center shrink-0">
                <Boxes className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-white block group-hover:text-indigo-600 transition-colors">
                  Store Inventory & Stock Ledger
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5 block">Manage stock levels & view audit logs</span>
              </div>
            </Link>

            {/* Public Store link */}
            <a
              href={`/store/${store.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800 group transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                <Eye className="w-5 h-5 text-slate-500" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-white block group-hover:text-[#1E60ED] transition-colors">
                  View Public Storefront
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5 block">Browse storefront live on web</span>
              </div>
            </a>
          </div>
        </div>
      </div>


    </div>
  );
}
