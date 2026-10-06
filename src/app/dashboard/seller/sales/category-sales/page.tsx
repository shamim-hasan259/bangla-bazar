import prisma from "@/index";
import CategorySale from "./CategorySale";
export default async function ArticleSale() {
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));

  // TODO: Date Range Filtered Data need to Implemented.

  // TODO: Category Wise Sale need to Implemented.

  const data = await prisma.category.findMany({
    where: {
      parentId: {
        not: null, // Filter out categories where parentId is null
      },
    },
    include: {
      parent: {
        select: {
          name: true,
        },
      },
      masterProducts: true, // Include masterProducts if needed
    },
  });

  const fieldsToInclude = [
    "no",
    "code",
    "name",
    "parentId",
    "totalItem",
    "total",
    "status",
  ];
  return (
    <main className="flex min-h-screen flex-col gap-6 w-full">
      <div className=" flex-col flex w-full">
        <CategorySale />
      </div>
    </main>
  );
}
