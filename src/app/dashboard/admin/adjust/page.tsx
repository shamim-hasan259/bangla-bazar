import PageTitle from "@/components/ui/PageTitle";
import { UserDataTable } from "./data-table";
import { Toast } from "@/components/ui/toast";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { columns } from "./column";
import AdjustMain from "./AdjustMain";
import prisma from "@/index";

export default async function ProductsPage() {
  const data: any = await prisma.adjust.findMany({});
  //  (data);

  return (
    <main className="flex min-h-screen flex-col gap-6 w-full">
      <div className=" flex-col flex w-full">
        <div className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <PageTitle title="Adjust" />
            <div className="flex items-center space-x-2">
              <Link href="/dashboard/admin/adjust/create">
                <Button>Create Adjust</Button>
              </Link>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
            <AdjustMain />
          </div>
        </div>
      </div>
    </main>
  );
}
