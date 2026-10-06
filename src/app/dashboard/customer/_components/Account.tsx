"use client";

import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/app/redux-store/store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import RecentOrderHistory from "./RecentOrderHistory";
import { 
  ShoppingCart, 
  Heart, 
  ShoppingBag, 
  MapPin, 
  Mail, 
  Phone,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";

interface AccountProps {
  customer: {
    name: string;
    email?: string | null;
    phone: string;
    address?: any;
    photo?: string;
  }
}

const Account = ({ customer }: AccountProps) => {
  const billingAddress = Array.isArray(customer.address)
    ? customer.address.find((addr: any) => addr.type === "Billing" || addr.type === "Home") || customer.address[0]
    : null;

  // Redux states for Stats
  const cartItemsCount = useSelector((state: RootState) => state.cart.items.length);
  const wishlistItemsCount = useSelector((state: RootState) => state.wishlist.items.length);

  return (
    <div className="w-full space-y-6 pt-2 pb-12 font-sans">
      {/* Welcome Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-5 w-5 text-amber-500 animate-pulse" />
            <h2 className="text-xl font-extrabold text-slate-850 dark:text-slate-100 tracking-tight">
              Welcome back, {customer.name}!
            </h2>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Access your order tracking history, saved items, and update your billing settings.
          </p>
        </div>
        <Link href="/products">
          <Button className="bg-[#1E60ED] hover:bg-[#164ec2] text-white dark:bg-white dark:text-slate-900 font-semibold h-10 px-5 rounded-lg text-xs uppercase tracking-wider shrink-0 flex items-center gap-1.5 cursor-pointer shadow-sm transition-all">
            Explore Store
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>

      {/* Quick Stats Grid — KPI Stat Cards style */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Stat Card 1: Shopping Cart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex justify-between items-end transition-all hover:shadow-md hover:-translate-y-0.5 duration-300">
          <div className="space-y-2 flex-1">
            <span className="text-xs font-semibold text-slate-400">Shopping Cart</span>
            <div className="flex items-center gap-2">
              <div className="text-3xl font-extrabold text-slate-850 dark:text-white tracking-tight">
                {cartItemsCount}
              </div>
              <div className="flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-500 dark:bg-emerald-950/20">
                <ArrowUpRight className="w-3 h-3 shrink-0" />
                <span>Active</span>
              </div>
            </div>
            <Link href="/products" className="text-[11px] font-bold text-[#1E60ED] hover:underline flex items-center gap-0.5 pt-1">
              View Cart Items <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {/* Sparkline */}
          <div className="w-20 h-10 shrink-0 pb-1">
            <svg viewBox="0 0 100 40" className="w-full h-full">
              <defs>
                <linearGradient id="cart-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1E60ED" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#1E60ED" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path d="M0 30 Q25 15 50 25 T100 10 L100 40 L0 40 Z" fill="url(#cart-gradient)" />
              <path d="M0 30 Q25 15 50 25 T100 10" fill="none" stroke="#1E60ED" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Stat Card 2: Saved Wishlist */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex justify-between items-end transition-all hover:shadow-md hover:-translate-y-0.5 duration-300">
          <div className="space-y-2 flex-1">
            <span className="text-xs font-semibold text-slate-400">Saved Wishlist</span>
            <div className="flex items-center gap-2">
              <div className="text-3xl font-extrabold text-slate-850 dark:text-white tracking-tight">
                {wishlistItemsCount}
              </div>
              <div className="flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-500 dark:bg-emerald-950/20">
                <ArrowUpRight className="w-3 h-3 shrink-0" />
                <span>Saved</span>
              </div>
            </div>
            <Link href="/dashboard/customer/wishlist" className="text-[11px] font-bold text-[#1E60ED] hover:underline flex items-center gap-0.5 pt-1">
              View Wishlist <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {/* Sparkline */}
          <div className="w-20 h-10 shrink-0 pb-1">
            <svg viewBox="0 0 100 40" className="w-full h-full">
              <defs>
                <linearGradient id="wishlist-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1E60ED" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#1E60ED" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path d="M0 30 Q25 35 50 15 T100 20 L100 40 L0 40 Z" fill="url(#wishlist-gradient)" />
              <path d="M0 30 Q25 35 50 15 T100 20" fill="none" stroke="#1E60ED" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Stat Card 3: Purchase History */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex justify-between items-end transition-all hover:shadow-md hover:-translate-y-0.5 duration-300">
          <div className="space-y-2 flex-1">
            <span className="text-xs font-semibold text-slate-400">Purchase History</span>
            <div className="flex items-center gap-2">
              <div className="text-3xl font-extrabold text-slate-850 dark:text-white tracking-tight">
                History
              </div>
              <div className="flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-500 dark:bg-emerald-950/20">
                <ArrowUpRight className="w-3 h-3 shrink-0" />
                <span>Orders</span>
              </div>
            </div>
            <Link href="/dashboard/customer/order-history" className="text-[11px] font-bold text-[#1E60ED] hover:underline flex items-center gap-0.5 pt-1">
              View History <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {/* Sparkline */}
          <div className="w-20 h-10 shrink-0 pb-1">
            <svg viewBox="0 0 100 40" className="w-full h-full">
              <defs>
                <linearGradient id="history-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1E60ED" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#1E60ED" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path d="M0 25 Q25 20 50 35 T100 15 L100 40 L0 40 Z" fill="url(#history-gradient)" />
              <path d="M0 25 Q25 20 50 35 T100 15" fill="none" stroke="#1E60ED" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </div>

      {/* 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Recent Order History (span 2) */}
        <div className="lg:col-span-2 space-y-4">
          <RecentOrderHistory />
        </div>

        {/* Right column: Profile Info & Billing Address (span 1) */}
        <div className="space-y-6">
          {/* Profile Card */}
          <Card className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 shadow-xs overflow-hidden rounded-2xl">
            <div className="h-2 bg-gradient-to-r from-[#1E60ED]/30 via-[#1E60ED] to-[#1E60ED]/30" />
            <CardContent className="p-6 text-center flex flex-col items-center">
              <Avatar className="w-24 h-24 border-4 border-slate-50 dark:border-slate-950 shadow-md">
                {customer?.photo ? (
                  <AvatarImage src={customer.photo} className="object-cover" />
                ) : (
                  <AvatarFallback className="text-xl font-bold bg-slate-100 dark:bg-slate-800 text-slate-850 dark:text-slate-200">
                    {customer.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>

              <h3 className="mt-4 text-base font-extrabold text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                {customer.name}
              </h3>
              
              <span className="mt-1.5 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-50 text-slate-650 dark:bg-slate-850 dark:text-slate-400 border border-slate-100 dark:border-slate-800">
                <ShieldCheck className="h-3.5 w-3.5 text-green-500" />
                Active Member
              </span>

              <div className="w-full border-t border-slate-100 dark:border-slate-850/60 my-5" />

              <div className="w-full text-left space-y-3 text-xs text-slate-655 dark:text-slate-400">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                  <span className="truncate">{customer.email || "No email address"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                  <span>{customer.phone}</span>
                </div>
              </div>

              <Link href="/dashboard/customer/setting" className="w-full mt-6">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full justify-center text-xs font-bold h-9 border-[#1E60ED]/30 text-[#1E60ED] hover:bg-[#1E60ED]/5 cursor-pointer rounded-lg"
                >
                  Edit Profile
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Billing Address Card */}
          <Card className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 shadow-xs overflow-hidden rounded-2xl">
            <CardHeader className="border-b border-slate-50 dark:border-slate-850 pb-3 flex flex-row items-center justify-between space-y-0">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                Billing Address
              </span>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              {billingAddress ? (
                <div className="space-y-1.5">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase">
                    {customer.name}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-455 leading-relaxed">
                    {billingAddress.streetAddress}, {billingAddress.city}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-455 uppercase leading-relaxed">
                    {billingAddress.district}, {billingAddress.country}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-slate-400 dark:text-slate-500 italic py-2">
                  No billing address added yet.
                </p>
              )}

              <Link href="/dashboard/customer/setting" className="block w-full">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full justify-center text-xs font-bold h-9 border-[#1E60ED]/30 text-[#1E60ED] hover:bg-[#1E60ED]/5 cursor-pointer rounded-lg"
                >
                  {billingAddress ? "Edit Address" : "Add Address"}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Account;
