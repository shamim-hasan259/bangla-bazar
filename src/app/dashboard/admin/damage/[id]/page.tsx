import PageTitle from "@/components/ui/PageTitle";
import prisma from "@/index";
import Link from "next/link";
import { Button } from "@/components/ui/button";
// import OfferForm from "../offerForm";

export default async function OfferPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // const offer = await prisma.offer.findFirst({ where: { id: params.id } });

  //  (offer)

  return (
    <main className="flex min-h-screen flex-col gap-6 w-full">
      <div className=" flex-col flex w-full">
        <div className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <PageTitle title="Edit Offer" />
            <div className="flex items-center space-x-2">
              {/* <CalendarDateRangePicker /> */}
              <Link href={"/dashboard/offers"}>
                <Button>Cancle</Button>
              </Link>
            </div>
          </div>
          <div className="flex justify-center">
            <div className="w-1/3">
              {/* {params.id} */}
              {/* <OfferForm offer={offer} /> */}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
