import PageTitle from "@/components/ui/PageTitle";
import prisma from "@/index";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import AdjustForm from "../create/AdjustForm";

export default async function AdjustPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await prisma.adjust.findFirst({
    where: { id },
    // include: {
    //   masterCategory:{
    //     select:{
    //       name:true
    //     }
    //   }
    // }
  });



  return (
    <main className="flex min-h-screen flex-col gap-6 w-full">
      <div className=" flex-col flex w-full">
        <div className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <div className="flex">
              <Link href="/dashboard/products">
                <Button variant="ghost">
                  <ArrowLeft />
                </Button>
              </Link>
              <PageTitle title="Update Product" />
            </div>
            <div className="flex items-center space-x-2">
              {/* <CalendarDateRangePicker /> */}
              <Link href={"/dashboard/offers"}>
                <Button>Cancle</Button>
              </Link>
            </div>
          </div>
          <div className="flex justify-center">
            <div className="w-full">
              {/* {params.id} */}
              {/* <OfferForm offer={offer} /> */}
              <AdjustForm entry={product} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
