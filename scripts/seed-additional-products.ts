import prisma from '../prisma';
import { Status, SalesType } from '@prisma/client';

async function seedAdditionalProducts() {
  console.log('🌱 Adding more dynamic products to MongoDB...');

  const seller = await prisma.seller.findFirst({
    where: { phone: '01900000000' },
  });
  if (!seller) {
    throw new Error('Default seller not found');
  }

  const unit = await prisma.unit.findFirst({
    where: { code: 'PCS' },
  });
  if (!unit) {
    throw new Error('Default unit not found');
  }

  const masterCat = await prisma.category.findFirst({
    where: { code: 'MASTER_CAT' },
  });
  if (!masterCat) {
    throw new Error('Master category not found');
  }

  // Get categories
  const categories = await prisma.category.findMany();
  const catMap: Record<string, string> = {};
  categories.forEach((c) => {
    catMap[c.code] = c.id;
  });

  // Get stores
  const stores = await prisma.store.findMany();
  const storeMap: Record<string, string> = {};
  stores.forEach((s) => {
    storeMap[s.slug] = s.id;
  });

  const defaultStoreId = stores[0]?.id;

  const newProducts = [
    // ==========================================
    // HEADPHONES & AUDIO (audio) - Fill with 8+ products
    // ==========================================
    {
      name: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones',
      price: 34500,
      mrp: 38900,
      photo: '/assets/banner/headphone.png',
      categoryCode: 'audio',
      storeSlug: 'tech-vision-gadgets',
      rating: 4.9,
      reviewCount: 420,
      isHotDeal: true,
      description: 'Industry-leading noise cancellation with two processors and eight microphones for unprecedented sound clarity.',
    },
    {
      name: 'JBL Flip 6 Waterproof Portable Bluetooth Speaker',
      price: 11500,
      mrp: 13900,
      photo: '/img/products/portable-speaker.jpg',
      categoryCode: 'audio',
      storeSlug: 'tech-vision-gadgets',
      rating: 4.8,
      reviewCount: 310,
      isHotDeal: true,
      description: 'Bold JBL Original Pro Sound with exceptional clarity thanks to its 2-way speaker system and IP67 waterproof design.',
    },
    {
      name: 'Apple AirPods Pro 2nd Gen with USB-C MagSafe Case',
      price: 26900,
      mrp: 29900,
      photo: '/img/products/wireless-earbuds.jpg',
      categoryCode: 'audio',
      storeSlug: 'tech-vision-gadgets',
      rating: 4.9,
      reviewCount: 560,
      isHotDeal: true,
      description: 'Up to 2x more Active Noise Cancellation, Transparency mode, and Adaptive Audio for rich immersive acoustics.',
    },
    {
      name: 'Bose QuietComfort 45 Bluetooth Wireless Headphones',
      price: 31000,
      mrp: 35000,
      photo: '/assets/banner/headphone.png',
      categoryCode: 'audio',
      storeSlug: 'tech-vision-gadgets',
      rating: 4.8,
      reviewCount: 275,
      description: 'Iconic quiet, comfort, and sound. TriPort acoustic architecture delivers depth and fullness for high fidelity audio.',
    },
    {
      name: 'Marshall Emberton II Portable Bluetooth Speaker',
      price: 18500,
      mrp: 21900,
      photo: '/img/products/portable-speaker.jpg',
      categoryCode: 'audio',
      storeSlug: 'tech-vision-gadgets',
      rating: 4.7,
      reviewCount: 180,
      description: 'Compact portable speaker with loud and vibrant sound that only Marshall can deliver, offering 30+ hours of playtime.',
    },
    {
      name: 'Sennheiser Momentum 4 Wireless Audiophile Headphones',
      price: 36500,
      mrp: 41000,
      photo: '/assets/banner/headphone.png',
      categoryCode: 'audio',
      storeSlug: 'tech-vision-gadgets',
      rating: 4.9,
      reviewCount: 195,
      description: 'Signature Sennheiser sound with an astounding 60-hour battery life and customizable sound personalization.',
    },
    {
      name: 'Anker Soundcore Liberty 4 NC Wireless Earbuds',
      price: 8900,
      mrp: 10500,
      photo: '/img/products/wireless-earbuds.jpg',
      categoryCode: 'audio',
      storeSlug: 'tech-vision-gadgets',
      rating: 4.7,
      reviewCount: 340,
      description: 'Reduce noise by up to 98.5% with high sensitivity in-ear sound sensor and custom 11mm drivers for crisp Hi-Res audio.',
    },
    {
      name: 'Beats Studio Pro Premium Wireless Over-Ear Headphones',
      price: 32900,
      mrp: 36500,
      photo: '/assets/banner/headphone.png',
      categoryCode: 'audio',
      storeSlug: 'tech-vision-gadgets',
      rating: 4.8,
      reviewCount: 230,
      description: 'Custom acoustic platform delivers rich, immersive sound with Personalized Spatial Audio and dynamic head tracking.',
    },

    // ==========================================
    // BEAUTY & SKINCARE (beauty)
    // ==========================================
    {
      name: 'Advanced Night Repair Synchronized Multi-Recovery Serum 50ml',
      price: 7800,
      mrp: 9200,
      photo: '/img/products/vitamin-c-serum.jpg',
      categoryCode: 'beauty',
      storeSlug: 'bangla-bazar-official',
      rating: 4.9,
      reviewCount: 310,
      description: 'Deep-penetrating serum infused with Chronolux Power Signal Technology to significantly reduce visible signs of aging.',
    },
    {
      name: 'Bleu De Chanel Luxury Eau De Parfum Pour Homme 100ml',
      price: 15400,
      mrp: 17500,
      photo: '/img/products/luxury-perfume.jpg',
      categoryCode: 'beauty',
      storeSlug: 'bangla-bazar-official',
      rating: 5.0,
      reviewCount: 450,
      description: 'An aromatic-woody fragrance with captivating notes of New Caledonian sandalwood and ambery cedar.',
    },
    {
      name: 'Hydrating Hyaluronic Acid Moisture Boosting Gel Cream',
      price: 1250,
      mrp: 1650,
      photo: '/img/products/vitamin-c-serum.jpg',
      categoryCode: 'beauty',
      storeSlug: 'bangla-bazar-official',
      rating: 4.8,
      reviewCount: 220,
      description: 'Ultralight gel moisturizer with triple hyaluronic acid complex providing 72-hour continuous hydration.',
    },
    {
      name: 'Dior Sauvage Eau De Toilette Luxury Spray 100ml',
      price: 14800,
      mrp: 16900,
      photo: '/img/products/luxury-perfume.jpg',
      categoryCode: 'beauty',
      storeSlug: 'bangla-bazar-official',
      rating: 4.9,
      reviewCount: 520,
      description: 'A radically fresh composition with raw and noble notes of Calabrian bergamot and ambroxan woody trail.',
    },

    // ==========================================
    // LAPTOPS & TECH (laptops)
    // ==========================================
    {
      name: 'ASUS ROG Zephyrus G14 Gaming Laptop Ryzen 9 RTX 4070',
      price: 185000,
      mrp: 205000,
      photo: '/assets/Macbook-laptop.png',
      categoryCode: 'laptops',
      storeSlug: 'digital-hub-laptops',
      rating: 4.9,
      reviewCount: 210,
      description: 'Ultra-portable compact gaming powerhouse featuring 3K 120Hz OLED display, AMD Ryzen 9 8945HS and RTX 4070 GPU.',
    },
    {
      name: 'Dell XPS 13 Plus OLED Touchscreen Core i7 32GB RAM',
      price: 165000,
      mrp: 182000,
      photo: '/categories/laptops.png',
      categoryCode: 'laptops',
      storeSlug: 'digital-hub-laptops',
      rating: 4.8,
      reviewCount: 160,
      description: 'Minimalist cutting-edge design with invisible glass touchpad, edge-to-edge keyboard and 3.5K OLED infinity display.',
    },
    {
      name: 'Lenovo ThinkPad X1 Carbon Gen 11 Ultralight Laptop',
      price: 152000,
      mrp: 168000,
      photo: '/categories/laptops.png',
      categoryCode: 'laptops',
      storeSlug: 'digital-hub-laptops',
      rating: 4.8,
      reviewCount: 190,
      description: 'Ultralight carbon-fiber business laptop built with Intel Evo certification and military-grade durability testing.',
    },

    // ==========================================
    // WATCHES & JEWELRY (watches)
    // ==========================================
    {
      name: 'Apple Watch Ultra 2 GPS + Cellular 49mm Titanium',
      price: 88500,
      mrp: 96000,
      photo: '/assets/smart-watch.png',
      categoryCode: 'watches',
      storeSlug: 'tech-vision-gadgets',
      rating: 4.9,
      reviewCount: 380,
      description: 'The most rugged and capable Apple Watch featuring 3000 nits display, precision dual-frequency GPS, and up to 72 hours battery life.',
    },
    {
      name: 'Samsung Galaxy Watch 6 Classic 47mm Rotating Bezel',
      price: 32500,
      mrp: 36900,
      photo: '/assets/smart-watch.png',
      categoryCode: 'watches',
      storeSlug: 'tech-vision-gadgets',
      rating: 4.8,
      reviewCount: 260,
      description: 'Timeless style with a physical rotating bezel, crystal sapphire glass and advanced health sleep monitoring.',
    },

    // ==========================================
    // FASHION & APPAREL (fashion)
    // ==========================================
    {
      name: 'Urban Oversized Heavyweight Fleece Hoodie',
      price: 1550,
      mrp: 1999,
      photo: '/img/products/casual-hoodie.jpg',
      categoryCode: 'fashion',
      storeSlug: 'fashion-wear-studio',
      rating: 4.8,
      reviewCount: 320,
      description: 'Premium brushed cotton fleece with dropped shoulders, kangaroo pocket, and double-layered ribbed hood.',
    },
    {
      name: 'Waterproof Commuter Laptop Backpack 25L with USB Port',
      price: 2450,
      mrp: 3100,
      photo: '/img/products/travel-backpack.jpg',
      categoryCode: 'fashion',
      storeSlug: 'fashion-wear-studio',
      rating: 4.7,
      reviewCount: 280,
      description: 'Ergonomic breathable back panel with dedicated padded laptop compartment and anti-theft hidden pocket.',
    },
    {
      name: 'Ultra-Comfort Knit Breathable Running Sneakers',
      price: 2850,
      mrp: 3500,
      photo: '/img/products/running-sneakers.jpg',
      categoryCode: 'fashion',
      storeSlug: 'fashion-wear-studio',
      rating: 4.8,
      reviewCount: 410,
      description: 'High-rebound EVA foam midsole with responsive cushioning and seamless engineered mesh upper.',
    },
  ];

  let count = 0;
  for (const item of newProducts) {
    const catId = catMap[item.categoryCode] || catMap['electronics'];
    const storeId = storeMap[item.storeSlug] || defaultStoreId;
    const slug = item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const existing = await prisma.product.findFirst({
      where: { name: item.name },
    });

    if (existing) {
      await prisma.product.update({
        where: { id: existing.id },
        data: {
          price: item.price,
          mrp: item.mrp,
          tp: Math.round(item.price * 0.8),
          photo: [item.photo],
          category: { connect: { id: catId } },
          store: { connect: { id: storeId } },
          status: Status.Active,
          averageRating: item.rating || 4.8,
          reviewCount: item.reviewCount || 50,
          description: item.description,
        },
      });
      console.log(`Updated product: ${item.name}`);
    } else {
      await prisma.product.create({
        data: {
          name: item.name,
          slug: `${slug}-${Date.now().toString(36).slice(-4)}`,
          description: item.description,
          price: item.price,
          mrp: item.mrp,
          tp: Math.round(item.price * 0.8),
          photo: [item.photo],
          category: { connect: { id: catId } },
          masterCategory: { connect: { id: masterCat.id } },
          store: { connect: { id: storeId } },
          seller: { connect: { id: seller.id } },
          unit: { connect: { id: unit.id } },
          status: Status.Active,
          stock: 60,
          availableQty: 60,
          averageRating: item.rating || 4.8,
          reviewCount: item.reviewCount || 50,
          salesType: item.isHotDeal ? SalesType.Offer : SalesType.Standerd,
          featured: item.isHotDeal ? 'true' : 'false',
        },
      });
      console.log(`Created product: ${item.name}`);
      count++;
    }
  }

  console.log(`✅ Finished seeding! Added/Updated products. Total newly inserted: ${count}`);
}

seedAdditionalProducts()
  .catch((e) => {
    console.error('Error seeding additional products:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
