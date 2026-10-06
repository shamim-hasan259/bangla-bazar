import ProductForm from "../_components/ProductForm";
import prisma from "@/index";

export default async function UpdateProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await prisma.product.findFirst({
    where: { id },
    include: {
      masterCategory: {
        select: {
          name: true,
        },
      },
      variantsList: true,
    },
  });

  return (
    <main className="p-8 bg-slate-50/50 min-h-screen">
      <ProductForm entry={product} title="Update Product" />
    </main>
  );
}
