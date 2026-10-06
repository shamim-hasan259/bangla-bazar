import PageTitle from "@/components/ui/PageTitle";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import DamageMain from "./DamageMain";
export default async function ProductsPage() {
  // const data = await prisma.damage.findMany({
  //   include: {
  //     user: {
  //       select: {
  //         name: true, // Select only the name field from the supplier model
  //         email: true, // Select only the email field from the supplier model
  //         phone: true, // Select only the phone field from the supplier model
  //       },
  //     },
  //     warehouse: {
  //       select: {
  //         name: true, // Select only the name field from the user model
  //         email: true,
  //         phone: true, // Select only the phone field from the supplier model
  //       },
  //     },
  //   },
  // });

  return (
    <main className="flex min-h-screen flex-col gap-6 w-full">
      <div className=" flex-col flex w-full">
        <div className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <PageTitle title="Damage" />
            <div className="flex items-center space-x-2">
              {/* <CalendarDateRangePicker /> */}
              <Link href="/dashboard/damage/create">
                <Button>Create Damage</Button>
              </Link>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
            {/* <DamageDataTable columns={columns} data={data} /> */}
            <DamageMain />
          </div>
        </div>
      </div>
    </main>
  );
}
