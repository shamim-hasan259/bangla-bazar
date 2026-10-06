import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function seed() {
  console.log('🌱 Seeding 4-level nested categories...');

  // Helper function to upsert a category
  async function upsertCat(name: string, code: string, parentId: string | null) {
    return await prisma.category.upsert({
      where: { code },
      update: { name, parentId, status: 'Active' },
      create: {
        name,
        code,
        status: 'Active',
        parentId,
      },
    });
  }

  // LEVEL 1
  const digitalGoods = await upsertCat('Digital Goods', 'DIGITAL_GOODS', null);
  const watches = await upsertCat('Watches Sunglasses Jewellery', 'WATCHES_SUNGLASSES_JEWELLERY', null);
  const motherBaby = await upsertCat('Mother & Baby', 'MOTHER_BABY', null);
  const charity = await upsertCat('Charity and Donation', 'CHARITY_DONATION', null);
  const sample = await upsertCat('Sample', 'SAMPLE_CAT', null);
  const specialProducts = await upsertCat('Special Digital Products', 'SPECIAL_DIGITAL_PRODUCTS', null);
  const toysGames = await upsertCat('Toys & Games', 'TOYS_GAMES', null);
  const petSupplies = await upsertCat('Pet Supplies', 'PET_SUPPLIES', null);

  // LEVEL 2 - Under Digital Goods
  const localVouchers = await upsertCat('Local Vouchers', 'LOCAL_VOUCHERS', digitalGoods.id);
  const gamesGiftCards = await upsertCat('Games Gift Cards & Software', 'GAMES_GIFT_CARDS', digitalGoods.id);
  const homeServices = await upsertCat('Home Services', 'HOME_SERVICES', digitalGoods.id);
  const bnpl = await upsertCat('BNPL', 'BNPL', digitalGoods.id);
  const fuel = await upsertCat('Fuel', 'FUEL', digitalGoods.id);
  const education = await upsertCat('Education', 'EDUCATION', digitalGoods.id);

  // LEVEL 3 - Under Local Vouchers
  const foodBeverages = await upsertCat('Food and Beverages', 'FOOD_BEVERAGES', localVouchers.id);
  const beautyWellness = await upsertCat('Beauty & Wellness', 'BEAUTY_WELLNESS', localVouchers.id);
  const hotelTravel = await upsertCat('Hotel and Travel', 'HOTEL_TRAVEL', localVouchers.id);
  const linehaulService = await upsertCat('Linehaul Service', 'LINEHAUL_SERVICE', localVouchers.id);

  // LEVEL 4 - Under Food and Beverages
  const giftCards = await upsertCat('Gift Cards', 'GIFT_CARDS_LEAF', foodBeverages.id);
  const eVouchers = await upsertCat('eVouchers', 'EVOUCHERS', foodBeverages.id);
  const meals = await upsertCat('Meals', 'MEALS', foodBeverages.id);
  const dessertsSnacks = await upsertCat('Desserts and Snacks', 'DESSERTS_SNACKS', foodBeverages.id);
  const coffeeTea = await upsertCat('Coffee and Tea', 'COFFEE_TEA', foodBeverages.id);

  // LEVEL 2 - Under Watches
  const mensWatches = await upsertCat("Men's Watches", 'MENS_WATCHES', watches.id);
  const womensWatches = await upsertCat("Women's Watches", 'WOMENS_WATCHES', watches.id);

  // LEVEL 3 - Under Men's Watches
  const analogWatches = await upsertCat('Analog Watches', 'ANALOG_WATCHES', mensWatches.id);
  const digitalWatches = await upsertCat('Digital Watches', 'DIGITAL_WATCHES', mensWatches.id);

  // LEVEL 4 - Under Analog Watches
  const leatherStrap = await upsertCat('Leather Strap Watches', 'LEATHER_STRAP_WATCHES', analogWatches.id);
  const metalStrap = await upsertCat('Metal Strap Watches', 'METAL_STRAP_WATCHES', analogWatches.id);

  // LEVEL 2 - Under Mother & Baby
  const feeding = await upsertCat('Feeding', 'FEEDING_BABY', motherBaby.id);
  // LEVEL 3 - Under Feeding
  const bottleFeeding = await upsertCat('Bottle Feeding', 'BOTTLE_FEEDING', feeding.id);
  // LEVEL 4 - Under Bottle Feeding
  const babyBottles = await upsertCat('Baby Bottles', 'BABY_BOTTLES', bottleFeeding.id);

  console.log('✅ Categories successfully seeded!');
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
