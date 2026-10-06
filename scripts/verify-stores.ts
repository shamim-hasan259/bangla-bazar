import prisma from '../prisma';

async function main() {
  const allStores = await prisma.store.findMany();
  console.log('Stores before update:', allStores.map(s => ({ id: s.id, name: s.storeNameEn, status: s.status })));

  await prisma.store.updateMany({
    data: {
      status: 'Approved',
      deletedAt: null,
    },
  });

  const updatedStores = await prisma.store.findMany({
    where: { status: 'Approved' },
    include: { products: true },
  });

  console.log('Approved Stores count:', updatedStores.length);
  for (const st of updatedStores) {
    console.log(`Store: ${st.storeNameEn} -> Products count: ${st.products.length}`);
  }
}

main().finally(() => prisma.$disconnect());
