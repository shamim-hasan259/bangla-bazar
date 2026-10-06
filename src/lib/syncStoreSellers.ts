import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("Starting store product & order seller sync...");
  
  // 1. Sync store products missing sellerId
  const productsWithoutSeller = await prisma.product.findMany({
    where: {
      storeId: { not: null },
      sellerId: null,
    },
    include: {
      store: {
        select: { sellerId: true }
      }
    }
  });

  console.log(`Found ${productsWithoutSeller.length} store products with missing sellerId.`);

  let updatedProductCount = 0;
  for (const product of productsWithoutSeller) {
    if (product.store?.sellerId) {
      await prisma.product.update({
        where: { id: product.id },
        data: {
          sellerId: product.store.sellerId
        }
      });
      updatedProductCount++;
    }
  }

  console.log(`Successfully synced ${updatedProductCount} products with their store sellerId.`);

  // 2. Sync Sales records missing sellerIds
  const salesWithEmptySellerIds = await prisma.sales.findMany({
    where: {
      sellerIds: { isEmpty: true }
    }
  });

  console.log(`Found ${salesWithEmptySellerIds.length} Sales records with empty sellerIds.`);

  let updatedSalesCount = 0;
  for (const sale of salesWithEmptySellerIds) {
    if (sale.storeIds && sale.storeIds.length > 0) {
      const stores = await prisma.store.findMany({
        where: { id: { in: sale.storeIds } },
        select: { sellerId: true }
      });
      const resolvedSellerIds = Array.from(new Set(stores.map(s => s.sellerId).filter(Boolean))) as string[];
      if (resolvedSellerIds.length > 0) {
        await prisma.sales.update({
          where: { id: sale.id },
          data: {
            sellerIds: resolvedSellerIds
          }
        });
        updatedSalesCount++;
      }
    }
  }

  console.log(`Successfully updated ${updatedSalesCount} Sales records with resolved sellerIds.`);
}

main()
  .catch((e) => console.error("Sync error:", e))
  .finally(async () => {
    await prisma.$disconnect();
  });
