import PageTitle from "@/components/ui/PageTitle";
import { VendorDataTable } from "./data-table";
import { columns } from "./columns";
import CreateVendorSheet from "./createVendorSheet";
import prisma from "@/index";

export default async function ProductsPage() {
  const data: any = await prisma.seller.findMany();
  // console.log(data);

  return (
    <main className="flex min-h-screen flex-col gap-6 w-full">
      <div className=" flex-col flex w-full">
        <div className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <PageTitle title="Vendor" />
            <div className="flex items-center space-x-2">
              <CreateVendorSheet />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
            <VendorDataTable columns={columns} data={data} />
          </div>
        </div>
      </div>
    </main>
  );
}
