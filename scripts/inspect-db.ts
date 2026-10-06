import prisma from '../prisma';

async function main() {
  const products = await prisma.product.findMany({
    select: { id: true, name: true, price: true, categoryId: true, photo: true },
    take: 20,
  });
  console.log('Total Products:', await prisma.product.count());
  console.log('Sample Products:', products.slice(0, 5));

  const categories = await prisma.category.findMany({
    select: { id: true, name: true, code: true, photo: true, _count: { select: { products: true } } },
  });
  console.log('Total Categories:', categories.length);
  console.log('Categories:', categories);

  const stores = await prisma.store.findMany({
    select: { id: true, storeNameEn: true, slug: true, _count: { select: { products: true } } },
  });
  console.log('Total Stores:', stores.length);
  console.log('Stores:', stores);

  const flashSales = await prisma.flashSale.findMany({
    include: { products: { include: { product: true } } },
  });
  console.log('Total Flash Sales:', flashSales.length);
  console.log('Flash Sales:', flashSales);
}

main().finally(() => prisma.$disconnect());
