import PageTitle from "@/components/ui/PageTitle";
import { UserDataTable } from "./data-table";
import { columns } from "./columns";
import prisma from "@/index";
import CreateBrandSheet from "./createBrandSheet";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function BrandPage() {
  const data: any = await prisma.brand.findMany({});

  return (
    <main className="flex min-h-screen flex-col gap-6 w-full">
      <div className=" flex-col flex w-full">
        <div className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <div className="flex">
              <Link href="/dashboard/admin/products">
                <Button variant="ghost">
                  <ArrowLeft />
                </Button>
              </Link>
              <PageTitle title="Brand" />
            </div>
            <div className="flex items-center space-x-2">
              <CreateBrandSheet />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
            <UserDataTable columns={columns} data={data} />
          </div>
        </div>
      </div>
    </main>
  );
}
