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
    <main className="flex min-h-screen flex-col gap-6 w-full">
      <div className=" flex-col flex w-full">
        <div className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <PageTitle title="Import Customer" />
            <div className="flex items-center space-x-2">
              {/* <CalendarDateRangePicker /> */}
              {/* <CreateCustomerSheet /> */}
              <CsvUpload setCSV={setCSV} handelImport={handelImport} />
              <Link href={"/dashboard/customer"}>
                <Button>
                  <X size="16" className="mr-2" /> Cancle
                </Button>
              </Link>
            </div>
          </div>

          <div className="">
            <UserDataTable
              columns={columns}
              data={CSV}
              //@ts-ignore
              //   handelImport={handelImport}
            />
          </div>
        </div>
      </div>
      <Toaster />
    </main>
  );
}
