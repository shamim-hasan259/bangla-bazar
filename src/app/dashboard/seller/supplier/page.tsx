import PageTitle from "@/components/ui/PageTitle";
import { SupplierDataTable } from "./data-table";
import { columns } from "./columns";
import CreateSupplierSheet from "./createSupplierSheet";
import prisma from "@/index";

export default async function ProductsPage() {
  const data: any = await prisma.supplier.findMany({});

  return (
    <div className="w-full space-y-6 pb-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div>
          <PageTitle title="Suppliers" />
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your suppliers, contact details, and company information.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CreateSupplierSheet />
        </div>
      </div>

      <div className="w-full">
        <SupplierDataTable columns={columns} data={data} />
      </div>
    </div>
  );
}
