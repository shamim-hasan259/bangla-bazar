import PageTitle from "@/components/ui/PageTitle";
import prisma from "@/index";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ProductForm from "../create/ProductForm";
import { ArrowLeft } from "lucide-react";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await prisma.product.findFirst({
    where: { id },
  });

  return (
    <main className="flex min-h-screen flex-col gap-6 w-full">
      <div className="flex-col flex w-full">
        <div className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <div className="flex items-center gap-3">
              <Link href="/dashboard/admin/products">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <PageTitle title="Update Product" />
            </div>
            <div className="flex items-center space-x-2">
              <Link href="/dashboard/admin/products">
                <Button variant="outline">Cancel</Button>
              </Link>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
            <ProductForm entry={product} />
          </div>
        </div>
      </div>
    </main>
  );
}
