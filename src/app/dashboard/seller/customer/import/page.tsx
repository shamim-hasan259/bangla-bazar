"use client";
import PageTitle from "@/components/ui/PageTitle";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { X } from "lucide-react";
import CsvUpload from "@/components/CsvUpload";
import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { UserDataTable } from "./data-table";
import { importCustomer } from "../_action";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

export default function CustomerImportPage() {
  type Customer = {
    id: string;
    name: string;
    phone: string;
    email: string;
    district: string;
    division: string;
  };

  const columns: ColumnDef<Customer>[] = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "phone",
      header: "Phone",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "district",
      header: "District",
    },
    {
      accessorKey: "division",
      header: "Division",
    },
  ];
  //   const data: any = await prisma.customer.findMany();
  const [CSV, setCSV] = useState<any>([]);

  const handelImport = async () => {
    //  ("Import", CSV);
    if (CSV?.length > 0) {
      const customer = await importCustomer(CSV);
      if (customer) {
        toast.success("Customer Import Success");
      }
    }
  };

  return (
    <div className="w-full space-y-6 pb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div>
          <PageTitle title="Import Customers" />
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Upload CSV files to batch import customer contacts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CsvUpload setCSV={setCSV} handelImport={handelImport} />
          <Link href={"/dashboard/seller/customer"}>
            <Button variant="outline" className="border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300">
              <X size="16" className="mr-2" /> Cancel
            </Button>
          </Link>
        </div>
      </div>

      <div className="w-full">
        <UserDataTable
          columns={columns}
          data={CSV}
          //@ts-ignore
          //   handelImport={handelImport}
        />
      </div>
      <Toaster />
    </div>
  );
}
