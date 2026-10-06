import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  const catCount = await prisma.category.count();
  const brandCount = await prisma.brand.count();
  const unitCount = await prisma.unit.count();
  console.log('COUNT:', { catCount, brandCount, unitCount });
  const sampleCats = await prisma.category.findMany({ take: 5 });
  console.log('Sample categories:', sampleCats);
}
run().finally(() => prisma.$disconnect());
