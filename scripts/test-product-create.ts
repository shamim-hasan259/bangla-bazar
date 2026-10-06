import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testCreate() {
  try {
    const categories = await prisma.category.findMany({ take: 2 });
    if (categories.length < 2) {
      console.log("Not enough categories to test");
      return;
    }
    const cat1 = categories[0];
    const cat2 = categories[1];

    const brand = await prisma.brand.findFirst();
    const unit = await prisma.unit.findFirst();

    const product = await prisma.product.create({
      data: {
        name: "Test Product - " + Date.now(),
        category: { connect: { id: cat1.id } },
        masterCategory: { connect: { id: cat2.id } },
        brand: brand ? { connect: { id: brand.id } } : undefined,
        unit: unit ? { connect: { id: unit.id } } : undefined,
        price: 500,
        stock: 50,
        weight: 1.5,
        salesType: "Standerd",
        hasVariants: true,
        variants: {
            name: "Size",
            options: ["Small", "Large"],
            data: [
                { optionValue: "Small", price: "500", stock: "25", availability: true },
                { optionValue: "Large", price: "700", stock: "25", availability: true }
            ]
        },
        dimensions: { length: 10, width: 15, height: 5 },
        dangerousGoods: "None"
      },
    });

    console.log("Successfully created product!", product.id);
  } catch (error) {
    console.error("Failed to create product:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testCreate();
