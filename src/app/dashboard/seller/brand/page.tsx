import prisma from "@/index";
import BrandManagementClient from "./_components/BrandManagementClient";

export default async function BrandPage() {
  const brands = await prisma.brand.findMany({});

  // Serialize to prevent serialization errors for Dates or MongoDB ObjectId structures in Client Components
  const serializedBrands = JSON.parse(JSON.stringify(brands));

  return (
    <BrandManagementClient initialBrands={serializedBrands} />
  );
}
