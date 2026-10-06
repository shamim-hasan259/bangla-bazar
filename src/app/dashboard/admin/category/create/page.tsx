import prisma from "@/index";
import CreateCategoryForm from "./CreateCategoryForm";

export default async function CreateCategoryPage() {
  const masterCategories = await prisma.category.findMany({
    select: {
      id: true,
      name: true,
      code: true,
      parentId: true,
    },
  });

  return (
    <main className="flex min-h-screen flex-col w-full bg-slate-50/50 dark:bg-slate-950/20">
      <div className="flex-col flex w-full">
        <div className="flex-1 space-y-6 p-8 pt-6">
          <CreateCategoryForm masterCategories={masterCategories} />
        </div>
      </div>
    </main>
  );
}
