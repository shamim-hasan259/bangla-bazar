import PageTitle from "@/components/ui/PageTitle";
import { Button } from "@/components/ui/button";
import { UserDataTable } from "./data-table";
import { columns } from "./columns";
import Link from "next/link";
import { UploadCloud } from "lucide-react";
import prisma from "@/index";
import CreateCustomerSheet from "./createCustomerSheet";

export default async function CustomerPage() {
  const data: any = await prisma.customer.findMany({});

  return (
    <div className="w-full space-y-6 pb-6 p-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div>
          <PageTitle title="Customers" />
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your customer accounts, view information, and import client details.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={"/dashboard/admin/customer/import"}>
            <Button variant="outline" className="border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300">
              <UploadCloud size="16" className="mr-2 text-slate-500" /> Import
            </Button>
          </Link>
          <CreateCustomerSheet />
        </div>
      </div>

      <div className="w-full">
        <UserDataTable columns={columns} data={data} />
      </div>
    </div>
  );
}
