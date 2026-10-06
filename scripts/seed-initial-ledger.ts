import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  console.log("🚀 Seeding initial stock ledger entries for existing products...");
  
  // 1. Get all products
  const products = await prisma.product.findMany({
    include: {
      variantsList: true
    }
  });

  for (const product of products) {
    // Check if there is already an initial entry for this product
    const existingLog = await prisma.stockLedger.findFirst({
      where: { productId: product.id }
    });

    if (existingLog) {
      console.log(`Product ${product.name} already has ledger logs. Skipping.`);
      continue;
    }

    if (product.hasVariants && product.variantsList && product.variantsList.length > 0) {
      console.log(`Product "${product.name}" has variants. Seeding variant initial entries...`);
      for (const variant of product.variantsList) {
        if (variant.stock > 0) {
          await prisma.stockLedger.create({
            data: {
              productId: product.id,
              variantId: variant.id,
              type: "InitialEntry",
              quantity: variant.stock,
              previousStock: 0,
              newStock: variant.stock,
              note: "Seeded initial stock setup",
              createdAt: variant.createdAt
            }
          });
        }
      }
    } else {
      if (product.stock > 0) {
        console.log(`Seeding base product "${product.name}" stock: ${product.stock}...`);
        await prisma.stockLedger.create({
          data: {
            productId: product.id,
            type: "InitialEntry",
            quantity: product.stock,
            previousStock: 0,
            newStock: product.stock,
            note: "Seeded initial stock setup",
            createdAt: product.createdAt
          }
        });
      }
    }
  }

  console.log("✅ Stock ledger seeding completed!");
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
