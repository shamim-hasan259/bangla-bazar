import prisma from "@/index";
import CategoryManagerClient from "./CategoryManagerClient";

export default async function ProductsPage() {
  const data: any = await prisma.category.findMany({
    include: {
      parent: {
        select: {
          name: true,
        },
      },
    },
  });

  const totalCategories = await prisma.category.count();
  const activeCategories = await prisma.category.count({
    where: { status: "Active" }
  });
  const parentCategories = await prisma.category.count({
    where: { parentId: null }
  });

  return (
    <CategoryManagerClient
      initialCategories={data}
      totalCategories={totalCategories}
      activeCategories={activeCategories}
      parentCategories={parentCategories}
    />
  );
}
