import PageTitle from "@/components/ui/PageTitle";
import { PayoutDataTable } from "./data-table";
import { columns } from "./columns";
import prisma from "@/index";

export default async function PayoutsPage() {
  const data = await prisma.withdrawal.findMany({
    include: {
      seller: true
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  return (
    <main className="flex min-h-screen flex-col gap-6 w-full">
      <div className=" flex-col flex w-full">
        <div className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <PageTitle title="Vendor Payouts" />
          </div>
          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
            <PayoutDataTable columns={columns} data={data} />
          </div>
        </div>
      </div>
    </main>
  );
}
