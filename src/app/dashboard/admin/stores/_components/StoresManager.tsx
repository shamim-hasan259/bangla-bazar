"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Store,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  AlertTriangle,
  Calendar,
  Layers,
  Phone,
  Mail,
  MapPin,
  Globe,
  User,
  Info,
  DollarSign,
  ShoppingBag,
} from "lucide-react";
import { toast } from "sonner";
import { approveStore, rejectStore, suspendStore } from "../_action";
import { Button } from "@/components/ui/button";

interface IStore {
  id: string;
  storeNameBn: string;
  storeNameEn: string;
  slug: string;
  description: string | null;
  phone: string;
  email: string;
  storeLogo: string | null;
  storeBanner: string | null;
  address: string | null;
  facebook: string | null;
  instagram: string | null;
  x: string | null;
  status: "Pending" | "Approved" | "Rejected" | "Suspended" | "Disabled";
  rejectionReason: string | null;
  createdAt: string | Date;
  seller: {
    id: string;
    name: string;
    phone: string;
    email: string | null;
  };
  masterCategory: {
    name: string;
  };
}

interface StoresManagerProps {
  initialStores: IStore[];
  stats: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    todayRequests: number;
    orders: number;
    revenue: number;
  };
}

export default function StoresManager({ initialStores, stats }: StoresManagerProps) {
  const [stores, setStores] = useState<IStore[]>(initialStores);
  const [selectedStore, setSelectedStore] = useState<IStore | null>(null);
  const [rejectionStoreId, setRejectionStoreId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleApprove = async (id: string) => {
    if (confirm("Are you sure you want to approve this store?")) {
      try {
        setLoadingId(id);
        const res = await approveStore(id);
        if (res.success) {
          toast.success("Store approved successfully!");
          setStores((prev) =>
            prev.map((s) => (s.id === id ? { ...s, status: "Approved", rejectionReason: null } : s))
          );
        } else {
          toast.error(res.error || "Failed to approve store");
        }
      } catch (err: any) {
        toast.error(err.message || "An error occurred");
      } finally {
        setLoadingId(null);
      }
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Please enter a reason for rejection.");
      return;
    }

    const id = rejectionStoreId!;
    try {
      setLoadingId(id);
      const res = await rejectStore(id, rejectionReason);
      if (res.success) {
        toast.success("Store rejected successfully!");
        setStores((prev) =>
          prev.map((s) => (s.id === id ? { ...s, status: "Rejected", rejectionReason: rejectionReason } : s))
        );
        setRejectionStoreId(null);
        setRejectionReason("");
      } else {
        toast.error(res.error || "Failed to reject store");
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setLoadingId(null);
    }
  };

  const handleSuspend = async (id: string) => {
    if (confirm("Are you sure you want to suspend this store?")) {
      try {
        setLoadingId(id);
        const res = await suspendStore(id);
        if (res.success) {
          toast.success("Store suspended successfully!");
          setStores((prev) =>
            prev.map((s) => (s.id === id ? { ...s, status: "Suspended" } : s))
          );
        } else {
          toast.error(res.error || "Failed to suspend store");
        }
      } catch (err: any) {
        toast.error(err.message || "An error occurred");
      } finally {
        setLoadingId(null);
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* ── Stats Row ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Stores */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-slate-400 dark:text-slate-500 font-bold text-xs uppercase tracking-wider block">Total Stores</span>
            <span className="text-2xl font-black text-slate-800 dark:text-white mt-1 block">{stats.total}</span>
          </div>
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950/20 rounded-2xl flex items-center justify-center">
            <Store className="w-6 h-6 text-[#1E60ED]" />
          </div>
        </div>

        {/* Pending Approval */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-slate-400 dark:text-slate-500 font-bold text-xs uppercase tracking-wider block">Pending Approval</span>
            <span className="text-2xl font-black text-amber-500 mt-1 block">{stats.pending}</span>
          </div>
          <div className="w-12 h-12 bg-amber-50 dark:bg-amber-950/20 rounded-2xl flex items-center justify-center">
            <Clock className="w-6 h-6 text-amber-500" />
          </div>
        </div>

        {/* Active/Approved */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-slate-400 dark:text-slate-500 font-bold text-xs uppercase tracking-wider block">Active Stores</span>
            <span className="text-2xl font-black text-emerald-500 mt-1 block">{stats.approved}</span>
          </div>
          <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-emerald-500" />
          </div>
        </div>

        {/* Store Orders & Revenue Mock metrics */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-slate-400 dark:text-slate-500 font-bold text-xs uppercase tracking-wider block">Total Store Revenue</span>
            <span className="text-2xl font-black text-slate-800 dark:text-white mt-1 block">৳ {stats.revenue}</span>
          </div>
          <div className="w-12 h-12 bg-purple-50 dark:bg-purple-950/20 rounded-2xl flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-purple-600" />
          </div>
        </div>
      </div>

      {/* ── Requests Section ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Store Approval Requests</h2>

        {stores.length === 0 ? (
          <div className="text-center py-12 text-slate-400 dark:text-slate-500">
            <Store className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No store registration records found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-slate-600 dark:text-slate-400">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  <th className="pb-4 pr-4">Store Info</th>
                  <th className="pb-4 px-4">Seller Details</th>
                  <th className="pb-4 px-4">Category</th>
                  <th className="pb-4 px-4">Status</th>
                  <th className="pb-4 pl-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {stores.map((s) => {
                  let badge = "bg-amber-50 text-amber-600 border-amber-200/50";
                  if (s.status === "Approved") badge = "bg-emerald-50 text-emerald-600 border-emerald-200/50";
                  if (s.status === "Rejected") badge = "bg-rose-50 text-rose-600 border-rose-200/50";
                  if (s.status === "Suspended") badge = "bg-slate-100 text-slate-600 border-slate-200";

                  return (
                    <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 group">
                      {/* Store Info */}
                      <td className="py-4 pr-4 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl border overflow-hidden relative shrink-0 bg-slate-50 flex items-center justify-center">
                          {s.storeLogo ? (
                            <Image src={s.storeLogo} alt={s.storeNameEn} fill className="object-cover" />
                          ) : (
                            <Store className="w-6 h-6 text-slate-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{s.storeNameEn}</p>
                          <p className="text-xs text-slate-400 font-medium truncate">/{s.slug}</p>
                        </div>
                      </td>

                      {/* Seller Details */}
                      <td className="py-4 px-4">
                        <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-slate-400" /> {s.seller.name}
                        </p>
                        <p className="text-xs text-slate-400">{s.seller.phone}</p>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-4 font-medium text-slate-700 dark:text-slate-300">
                        {s.masterCategory.name}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge} uppercase tracking-wider`}>
                          {s.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 pl-4 text-right space-x-1.5 shrink-0">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setSelectedStore(s)}
                          className="h-8 w-8 rounded-lg border-slate-200 text-slate-500 hover:text-[#1E60ED] hover:border-[#1E60ED]"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>

                        {s.status === "Pending" && (
                          <>
                            <Button
                              variant="outline"
                              size="icon"
                              disabled={loadingId === s.id}
                              onClick={() => handleApprove(s.id)}
                              className="h-8 w-8 rounded-lg border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-500"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            
                            <Button
                              variant="outline"
                              size="icon"
                              disabled={loadingId === s.id}
                              onClick={() => setRejectionStoreId(s.id)}
                              className="h-8 w-8 rounded-lg border-rose-200 text-rose-500 hover:bg-rose-50 hover:border-rose-500"
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </>
                        )}

                        {s.status === "Approved" && (
                          <Button
                            variant="outline"
                            size="icon"
                            disabled={loadingId === s.id}
                            onClick={() => handleSuspend(s.id)}
                            className="h-8 w-8 rounded-lg border-rose-200 text-rose-500 hover:bg-rose-50 hover:border-rose-500"
                          >
                            <AlertTriangle className="w-4 h-4" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── View Details Modal ── */}
      {selectedStore && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Banner preview */}
            <div className="relative h-44 w-full bg-slate-100 flex items-center justify-center">
              {selectedStore.storeBanner ? (
                <Image src={selectedStore.storeBanner} alt="Banner" fill className="object-cover" />
              ) : (
                <Store className="w-12 h-12 text-slate-300" />
              )}
              {/* Logo Overlay */}
              <div className="absolute -bottom-8 left-6 w-20 h-20 rounded-2xl border-4 border-white dark:border-slate-900 bg-white shadow-md overflow-hidden flex items-center justify-center">
                {selectedStore.storeLogo ? (
                  <Image src={selectedStore.storeLogo} alt="Logo" fill className="object-cover" />
                ) : (
                  <Store className="w-8 h-8 text-slate-400" />
                )}
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 pt-12 space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white">{selectedStore.storeNameEn}</h3>
                  <p className="text-xs text-slate-400 font-medium">/{selectedStore.slug}</p>
                </div>
                <span className="text-xs font-bold bg-blue-50 text-[#1E60ED] border border-blue-200 px-3 py-1 rounded-full uppercase tracking-wider">
                  {selectedStore.status}
                </span>
              </div>

              {/* General Description */}
              {selectedStore.description && (
                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-850 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  <p className="font-bold text-slate-800 dark:text-white flex items-center gap-1.5 mb-1.5">
                    <Info className="w-4 h-4 text-slate-400" /> Description
                  </p>
                  {selectedStore.description}
                </div>
              )}

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                {/* Master Category */}
                <div className="space-y-1.5">
                  <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" /> Category Branch
                  </span>
                  <span className="text-slate-800 dark:text-slate-200 font-bold block">
                    {selectedStore.masterCategory.name}
                  </span>
                </div>

                {/* Join Date */}
                <div className="space-y-1.5">
                  <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> Requested Date
                  </span>
                  <span className="text-slate-800 dark:text-slate-200 font-bold block">
                    {new Date(selectedStore.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>

                {/* Contact info */}
                <div className="space-y-1.5 col-span-2 border-t pt-4">
                  <span className="text-slate-400 font-semibold block mb-2">Store Contacts</span>
                  <div className="grid grid-cols-2 gap-3 text-[11px]">
                    <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-medium">
                      <Phone className="w-3.5 h-3.5 text-slate-400" /> {selectedStore.phone}
                    </span>
                    <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-medium truncate">
                      <Mail className="w-3.5 h-3.5 text-slate-400" /> {selectedStore.email}
                    </span>
                    {selectedStore.address && (
                      <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-medium col-span-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" /> {selectedStore.address}
                      </span>
                    )}
                  </div>
                </div>

                {/* Social media connections */}
                {(selectedStore.facebook || selectedStore.instagram || selectedStore.x) && (
                  <div className="space-y-1.5 col-span-2 border-t pt-4">
                    <span className="text-slate-400 font-semibold block mb-2">Social Channels</span>
                    <div className="flex flex-wrap gap-4 text-[11px] text-slate-600 dark:text-slate-400">
                      {selectedStore.facebook && (
                        <a href={selectedStore.facebook} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                          <Globe className="w-3.5 h-3.5 text-blue-600" /> Facebook
                        </a>
                      )}
                      {selectedStore.instagram && (
                        <a href={selectedStore.instagram} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                          <Globe className="w-3.5 h-3.5 text-pink-600" /> Instagram
                        </a>
                      )}
                      {selectedStore.x && (
                        <a href={selectedStore.x} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                          <Globe className="w-3.5 h-3.5 text-slate-800" /> Twitter/X
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Close operations */}
              <div className="flex items-center justify-end pt-4 border-t">
                <Button
                  onClick={() => setSelectedStore(null)}
                  className="bg-[#1E60ED] hover:bg-blue-600 text-white font-bold rounded-xl px-6"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Rejection dialog ── */}
      {rejectionStoreId && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Reject Store Registration</h3>
            <p className="text-xs text-slate-400 mb-4">
              Please enter the reason for rejection. This reason will be displayed to the seller so they can update and resubmit.
            </p>

            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Invalid logo, categories do not match seller profile..."
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 h-28 resize-none mb-6"
            />

            <div className="flex items-center justify-end gap-3">
              <Button
                variant="ghost"
                onClick={() => {
                  setRejectionStoreId(null);
                  setRejectionReason("");
                }}
                className="rounded-xl font-bold"
              >
                Cancel
              </Button>
              <Button
                onClick={handleRejectSubmit}
                className="bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl px-6"
              >
                Reject Store
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
