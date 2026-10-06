"use client";
import React, { useState } from "react";
import PageTitle from "@/components/ui/PageTitle";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Router, X } from "lucide-react";
import CsvUpload from "@/components/CsvUpload";
import { ColumnDef } from "@tanstack/react-table";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { ProductDataTable } from "../data-table";
import { importProduct } from "../_action";
import { getBrandNameById } from "../../brand/_action";

export default function CustomerImportPage() {
  const [CSV, setCSV] = useState<any>([]);
  const [updatedCSV, setUpdatedCSV] = useState<any>([]); // New state to store updated CSV data

  type Product = {
    id: string;
    name: string;
    articleCode: string;
    categoryId: string;
    brandName: string; // Changed type from 'brandId' to 'brandName'
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
    if (CSV?.length > 0) {
      // Convert price, tp, and mrp to float
      const formattedCSV = CSV.map((item: any) => ({
        ...item,
        price: parseFloat(item.price),
        tp: parseFloat(item.tp),
        mrp: parseFloat(item.mrp),
        pisInPackege: parseFloat(item.pisInPackege),
        vat: item.vat != null ? parseFloat(item.vat) : 0,
        promoPrice: item.promoPrice != null ? parseFloat(item.promoPrice) : 0,
      }));
      "formattedCSV", formattedCSV;
      const product = await importProduct(formattedCSV);
      if (product) {
        // Update the updatedCSV state with new data
        setUpdatedCSV(formattedCSV);
        toast.success("Product Import Success");
      }
    }
  };

  return (
    <main className="flex min-h-screen flex-col gap-6 w-full">
      <div className=" flex-col flex w-full">
        <div className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <PageTitle title="Import Products" />
            <div className="flex items-center space-x-2">
              <CsvUpload setCSV={setCSV} handelImport={handleImport} />
              <Link href={"/dashboard/products"}>
                <Button>
                  <X size="16" className="mr-2" /> Cancle
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
