"use client";
import React, { useState, useEffect } from "react";
import PageTitle from "@/components/ui/PageTitle";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { X, Store, AlertCircle, Plus, ArrowRight } from "lucide-react";
import CsvUpload from "@/components/CsvUpload";
import { ColumnDef } from "@tanstack/react-table";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { ProductDataTable } from "../data-table";
import { importProduct } from "@/app/dashboard/admin/products/_action";
import { checkSellerStoreStatus } from "../_action";

export default function CustomerImportPage() {
  const [CSV, setCSV] = useState<any>([]);
  const [updatedCSV, setUpdatedCSV] = useState<any>([]);
  const [storeStatus, setStoreStatus] = useState<{
    loading: boolean;
    hasStore: boolean;
    hasApprovedStore: boolean;
  }>({
    loading: true,
    hasStore: true,
    hasApprovedStore: true,
  });

  useEffect(() => {
    async function verifyStore() {
      try {
        const res = await checkSellerStoreStatus();
        setStoreStatus({
          loading: false,
          hasStore: res.hasStore,
          hasApprovedStore: res.hasApprovedStore,
        });
      } catch (err) {
        setStoreStatus({
          loading: false,
          hasStore: false,
          hasApprovedStore: false,
        });
      }
    }
    verifyStore();
  }, []);

  type Product = {
    id: string;
    name: string;
    articleCode: string;
    categoryId: string;
    brandName: string;
    supplierId: string;
    price: number;
    mrp: number;
    pisInPackege: number;
    tp: number;
    status: string;
    vat: number;
    promoPrice: number;
  };

  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: "",
      header: "#",
      cell: ({ row }) => row.index + 1,
    },
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "articleCode",
      header: "ArticleCode",
    },
    {
      accessorKey: "categoryId",
      header: "Category",
    },
    {
      accessorKey: "brandName",
      header: "Brand",
    },
    {
      accessorKey: "supplierId",
      header: "Supplier",
    },
    {
      accessorKey: "tp",
      header: "TP",
    },
    {
      accessorKey: "mrp",
      header: "MRP",
    },
    {
      accessorKey: "price",
      header: "Price",
    },
    {
      accessorKey: "status",
      header: "Status",
    },
  ];

  const handleImport = async () => {
    if (!storeStatus.hasStore || !storeStatus.hasApprovedStore) {
      toast.error("You must set up and activate your store before importing products.");
      return;
    }

    if (CSV?.length > 0) {
      const formattedCSV = CSV.map((item: any) => ({
        ...item,
        price: parseFloat(item.price),
        tp: parseFloat(item.tp),
        mrp: parseFloat(item.mrp),
        pisInPackege: parseFloat(item.pisInPackege),
        vat: item.vat != null ? parseFloat(item.vat) : 0,
        promoPrice: item.promoPrice != null ? parseFloat(item.promoPrice) : 0,
      }));
      const product = await importProduct(formattedCSV);
      if (product) {
        setUpdatedCSV(formattedCSV);
        toast.success("Product Import Success");
      }
    }
  };

  if (!storeStatus.loading && (!storeStatus.hasStore || !storeStatus.hasApprovedStore)) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-slate-50">
        <div className="max-w-xl w-full bg-white rounded-3xl border border-slate-100 p-8 sm:p-10 shadow-sm text-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-5">
            <Store className="w-8 h-8 text-[#1E60ED]" />
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/60 mb-3">
            <AlertCircle className="w-3.5 h-3.5" />
            Store Setup Required
          </span>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            {!storeStatus.hasStore ? "Set Up Store Before Bulk Import" : "Store Approval Required"}
          </h2>
          <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
            {!storeStatus.hasStore
              ? "You must complete your store setup before you can import or upload products to your inventory."
              : "Your store registration is currently pending review. Bulk product import will be unlocked once approved."}
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href={!storeStatus.hasStore ? "/dashboard/seller/store/create" : "/dashboard/seller/store"}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#1E60ED] hover:bg-blue-600 text-white font-semibold text-sm transition-all shadow-md shadow-blue-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>{!storeStatus.hasStore ? "Set Up Store Now" : "View Store Status"}</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
            <Link
              href="/dashboard/seller/products"
              className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-all"
            >
              Back to Products
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col gap-6 w-full">
      <div className="flex-col flex w-full">
        <div className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <PageTitle title="Import Products" />
            <div className="flex items-center space-x-2">
              <CsvUpload
                setCSV={setCSV}
                handelImport={handleImport}
                btnVariant="seller"
              />
              <Link href={"/dashboard/seller/products"}>
                <Button variant="seller">
                  <X size="16" className="mr-2" /> Cancel
                </Button>
              </Link>
            </div>
          </div>

          <div className="">
            <ProductDataTable columns={columns} data={CSV} />
          </div>
        </div>
      </div>
      <Toaster />
    </main>
  );
}
