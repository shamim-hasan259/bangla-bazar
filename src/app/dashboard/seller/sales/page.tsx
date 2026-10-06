import PageTitle from "@/components/ui/PageTitle";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Archive, BadgeCheck, Plus } from "lucide-react";
import { Menubar, MenubarMenu, MenubarTrigger } from "@/components/ui/menubar";
import SaleList from "./SaleList";
import prisma from "@/index";
export default async function OrderPage() {
  // const data = await prisma.sales.findMany({
  //   where: {
  //     // createdAt: {
  //     //   gte: startOfDay,
  //     //   lte: endOfDay,
  //     // },
  //   },
  //   include: {
  //     customer: {
  //       select: {
  //         // name: true,
  //         phone: true,
  //         // company: true,
  //       },
  //     },
  //     user: {
  //       select: {
  //         name: true,
  //       },
  //     },
  //     warehouse: {
  //       select: {
  //         name: true,
  //         phone: true,
  //         address: true,
  //         email: true,
  //       },
  //     },
  //   },
  // });

  // sending All sell list using this function
  const startDate = new Date("2024-07-27"); // Example start date
  const endDate = new Date("2024-07-29"); // Example end date

  // const data = await getSaleDataByDate({ startDate, endDate });

  // TODO: Date Range Formatted Data need to pass to DATA-TABLE :(

  const fieldsToInclude = [
    "invoiceId",
    "userId",
    "customerId",
    "grossTotalRound",
    "createdAt",
    "updatedAt",
    "status",
  ];

  return (
    <>
      <main className="flex min-h-screen flex-col gap-6 w-full">
        <div className=" flex-col flex w-full">
          <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
              <PageTitle title="Sales" />
              <div className="flex items-center space-x-2">
                <Menubar>
                  <MenubarMenu>
                    <MenubarTrigger>
                      <BadgeCheck className="mr-2 h-3 w-3" />
                      <Link href="/dashboard/seller/sales/article-sales">
                        Article Sale
                      </Link>
                    </MenubarTrigger>
                  </MenubarMenu>
                  <MenubarMenu>
                    <MenubarTrigger>
                      <Archive className="mr-2 h-3 w-3" />
                      <Link href="/dashboard/seller/sales/category-sales">
                        Category Sale
                      </Link>
                    </MenubarTrigger>
                  </MenubarMenu>
                </Menubar>

                {/* <CSVDownload data={data} filename={`sales_data.csv`} fields={fieldsToInclude}></CSVDownload> */}

                <Link href="/dashboard/seller/sales/create-order">
                  <Button variant="seller" className="mr-2">
                    <Plus className="mr-2 h-4 w-4" /> Create Order
                  </Button>
                </Link>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
              {/* <UserDataTable  columns={columns}    /> */}
              <SaleList />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
