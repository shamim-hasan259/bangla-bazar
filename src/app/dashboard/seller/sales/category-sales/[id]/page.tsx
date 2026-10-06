import prisma from "@/index";
import CategoryWiseSaleComponent from "./CategoryWiseSaleComponent";
export default async function ArticleSale() {
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));

  const data = await prisma.sales.findMany({
    where: {
      createdAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    include: {
      customer: {
        select: {
          name: true,
          phone: true,
          company: true,
        },
      },
      user: {
        select: {
          name: true,
        },
      },
    },
  });

  return (
    <main className="flex min-h-screen flex-col gap-6 w-full">
      <div className=" flex-col flex w-full">
        <CategoryWiseSaleComponent data={data} />
      </div>
    </main>
  );
}
