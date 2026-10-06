import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  console.log("🚀 Starting variants migration to SKU table...");
  const products = await prisma.product.findMany({
    where: {
      hasVariants: true
    }
  });

  console.log(`Found ${products.length} products with variants.`);

  for (const product of products) {
    if (!product.variants) {
      console.log(`Product ${product.name} (${product.id}) has hasVariants: true but no variants JSON.`);
      continue;
    }

    try {
      const v = typeof product.variants === "string" ? JSON.parse(product.variants) : product.variants;
      const loadedData = v.data || [];

      if (!Array.isArray(loadedData) || loadedData.length === 0) {
        console.log(`Product ${product.name} (${product.id}) has empty or invalid variants JSON data.`);
        continue;
      }

      // Check if this product already has database-backed variants in ProductVariant table
      const existingVariantsCount = await prisma.productVariant.count({
        where: { productId: product.id }
      });

      if (existingVariantsCount > 0) {
        console.log(`Product ${product.name} (${product.id}) already has ${existingVariantsCount} variants in the SKU table. Skipping.`);
        continue;
      }

      console.log(`Migrating ${loadedData.length} variants for Product: ${product.name}`);

      for (const row of loadedData) {
        const variantRecord = {
          productId: product.id,
          sku: row.sku || `${product.id}-${row.color || ""}-${row.size || ""}-${Math.floor(Math.random() * 1005)}`,
          color: row.color || null,
          size: row.size || null,
          price: parseFloat(row.price) || product.price,
          specialPrice: row.specialPrice ? parseFloat(row.specialPrice) : null,
          mrp: row.mrp ? parseFloat(row.mrp) : product.mrp,
          costPrice: row.costPrice ? parseFloat(row.costPrice) : product.tp,
          stock: parseInt(row.stock) || 0,
          barcode: row.barcode || null,
          images: row.images || [],
          availability: row.availability !== false,
        };

        // Check if SKU exists globally to avoid index collision
        const existingSku = await prisma.productVariant.findUnique({
          where: { sku: variantRecord.sku }
        });

        if (existingSku) {
          console.warn(`SKU index collision for "${variantRecord.sku}". Generating unique SKU suffix.`);
          variantRecord.sku += `-${Math.floor(Math.random() * 100)}`;
        }

        await prisma.productVariant.create({
          data: variantRecord
        });
      }

      console.log(`Successfully migrated product: ${product.name}`);
    } catch (e: any) {
      console.error(`Failed to migrate variants for product ${product.name} (${product.id}):`, e.message);
    }
  }

  console.log("✅ Variants migration complete.");
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
