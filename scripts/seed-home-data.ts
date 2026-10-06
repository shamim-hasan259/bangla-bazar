import prisma from '../prisma';
import { Status, SalesType } from '@prisma/client';

async function seedHomeData() {
  console.log('🌱 Starting Home Data Seed into MongoDB...');

  // 1. Ensure Default Seller & Store exists
  let seller = await prisma.seller.findFirst({
    where: { phone: '01900000000' },
  });

  if (!seller) {
    seller = await prisma.seller.create({
      data: {
        name: 'Bangla Bazaar Official',
        phone: '01900000000',
        email: 'seller@banglamart.com',
        type: 'seller',
        password: 'password123',
        sellerId: 'SEL_OFFICIAL',
        status: Status.Active,
      },
    });
  }

  // Ensure Unit exists
  let unit = await prisma.unit.findFirst({
    where: { code: 'PCS' },
  });
  if (!unit) {
    unit = await prisma.unit.create({
      data: {
        name: 'Piece',
        code: 'PCS',
        symbol: 'pcs',
        status: 'Active',
      },
    });
  }

  // Ensure Master Category "All Products"
  let masterCat = await prisma.category.findFirst({
    where: { code: 'MASTER_CAT' },
  });
  if (!masterCat) {
    masterCat = await prisma.category.create({
      data: {
        name: 'Master Catalog',
        code: 'MASTER_CAT',
        status: 'Active',
      },
    });
  }

  // 2. Ensure Main Categories Exist
  const categoriesData = [
    { name: "Electronics & Gadgets", code: "electronics", photo: "/categories/electronics.png" },
    { name: "Fashion & Apparel", code: "fashion", photo: "/categories/fashion.png" },
    { name: "Beauty & Skincare", code: "beauty", photo: "/categories/beauty.png" },
    { name: "Watches & Jewelry", code: "watches", photo: "/assets/smart-watch.png" },
    { name: "Laptops & Tech", code: "laptops", photo: "/categories/laptops.png" },
    { name: "Headphones & Audio", code: "audio", photo: "/assets/banner/headphone.png" },
    { name: "Home & Living", code: "home", photo: "/flashsale/plant.jpg" },
    { name: "Groceries", code: "groceries", photo: "/deals/deals_honey.jpg" },
    { name: "Footwear", code: "footwear", photo: "/deals/deals_sneakers.jpg" },
    { name: "Men's T-Shirts & Polos", code: "mens-tshirt", photo: "/img/products/black-cotton-tshirt.jpg" },
    { name: "Men's Pants & Trousers", code: "mens-pant", photo: "/img/products/mens-denim-jeans.jpg" },
    { name: "Furniture & Decor", code: "furniture", photo: "/flashsale/chair.jpg" },
    { name: "Smartphones & Tablets", code: "smartphones", photo: "/img/products/modern-smartphone.jpg" },
  ];

  const catMap: Record<string, string> = {};

  for (const c of categoriesData) {
    let cat = await prisma.category.findUnique({
      where: { code: c.code },
    });
    if (!cat) {
      cat = await prisma.category.create({
        data: {
          name: c.name,
          code: c.code,
          photo: c.photo,
          status: "Active",
          parentId: masterCat.id,
        },
      });
    } else {
      cat = await prisma.category.update({
        where: { id: cat.id },
        data: {
          name: c.name,
          photo: c.photo,
          status: "Active",
        },
      });
    }
    catMap[c.code] = cat.id;
  }
  console.log('✅ Categories created/updated:', Object.keys(catMap).length);

  // 3. Create Stores for Vendors
  const vendorStoresData = [
    {
      name: "Bangla Bazaar Official Store",
      slug: "bangla-bazar-official",
      logo: "/assets/logo.png",
      cat: "electronics",
    },
    {
      name: "Fashion Wear Studio",
      slug: "fashion-wear-studio",
      logo: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=200&auto=format&fit=crop&q=80",
      cat: "fashion",
    },
    {
      name: "Tech Vision Gadgets",
      slug: "tech-vision-gadgets",
      logo: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&auto=format&fit=crop&q=80",
      cat: "electronics",
    },
    {
      name: "Green Life & Plants",
      slug: "green-life-plants",
      logo: "/flashsale/plant.jpg",
      cat: "home",
    },
    {
      name: "Living Style Furnishings",
      slug: "living-style-furnishings",
      logo: "/flashsale/chair.jpg",
      cat: "furniture",
    },
    {
      name: "Digital Hub Laptops",
      slug: "digital-hub-laptops",
      logo: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=200&auto=format&fit=crop&q=80",
      cat: "laptops",
    },
    {
      name: "Urban Footwear & Shoes",
      slug: "urban-footwear-shoes",
      logo: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&auto=format&fit=crop&q=80",
      cat: "footwear",
    },
  ];

  const storeMap: Record<string, string> = {};

  for (const vs of vendorStoresData) {
    let store = await prisma.store.findUnique({
      where: { slug: vs.slug },
    });
    if (!store) {
      store = await prisma.store.create({
        data: {
          seller: { connect: { id: seller.id } },
          storeNameBn: vs.name,
          storeNameEn: vs.name,
          storeName: vs.name,
          slug: vs.slug,
          description: `Top verified seller for ${vs.name}`,
          phone: "01700000000",
          email: `${vs.slug}@banglamart.com`,
          storeLogo: vs.logo,
          masterCategory: { connect: { id: catMap[vs.cat] || catMap["electronics"] } },
          status: "Approved",
        },
      });
    }
    storeMap[vs.slug] = store.id;
  }
  console.log('✅ Vendor Stores verified:', Object.keys(storeMap).length);

  // 4. Products Data Set to Seed
  const allProductsToSeed: Array<{
    name: string;
    price: number;
    mrp: number;
    photo: string;
    categoryCode: string;
    storeSlug: string;
    rating?: number;
    reviewCount?: number;
    isFlashSale?: boolean;
    isHotDeal?: boolean;
    isDailyDeal?: boolean;
    description?: string;
  }> = [
    // --- MEN'S T-SHIRTS & POLOS ---
    { name: "Premium Black Cotton Crewneck T-Shirt", price: 650, mrp: 850, photo: "/img/products/black-cotton-tshirt.jpg", categoryCode: "mens-tshirt", storeSlug: "fashion-wear-studio", rating: 4.8, reviewCount: 340 },
    { name: "Classic White Pique Polo T-Shirt", price: 799, mrp: 999, photo: "/img/products/white-polo-shirt.jpg", categoryCode: "mens-tshirt", storeSlug: "fashion-wear-studio", rating: 4.7, reviewCount: 280 },
    { name: "Modern Soft Everyday Cotton Tee", price: 900, mrp: 1100, photo: "/img/products/1784459338017-arturo_mendez_65Ug9pxoiaA_unsplash.jpg", categoryCode: "mens-tshirt", storeSlug: "fashion-wear-studio", rating: 4.6, reviewCount: 190 },
    { name: "Vintage Washed Gray Minimalist T-Shirt", price: 950, mrp: 1200, photo: "/img/products/1784543229064-nate_sagrada_dookSAJI3OU_unsplash.jpg", categoryCode: "mens-tshirt", storeSlug: "fashion-wear-studio", rating: 4.5, reviewCount: 150 },
    { name: "Heavy Metal Hard Rock Graphic T-Shirt", price: 900, mrp: 1150, photo: "/img/products/1784540897286-steven_rector__PScwvDBcdA_unsplash.jpg", categoryCode: "mens-tshirt", storeSlug: "fashion-wear-studio", rating: 4.7, reviewCount: 220 },
    { name: "Modern Casual Printed Cotton T-Shirt", price: 543, mrp: 750, photo: "/img/products/1785836415827-otabek_xatipov_pN2AWzvw_14_unsplash.jpg", categoryCode: "mens-tshirt", storeSlug: "fashion-wear-studio", rating: 4.4, reviewCount: 120 },
    { name: "Classic Slim Fit Black Short-Sleeve Tee", price: 620, mrp: 799, photo: "/img/products/black-cotton-tshirt.jpg", categoryCode: "mens-tshirt", storeSlug: "fashion-wear-studio", rating: 4.8, reviewCount: 300 },
    { name: "Sport Athletic White Collar Polo Shirt", price: 850, mrp: 1050, photo: "/img/products/white-polo-shirt.jpg", categoryCode: "mens-tshirt", storeSlug: "fashion-wear-studio", rating: 4.6, reviewCount: 170 },

    // --- MEN'S PANTS & TROUSERS ---
    { name: "Men's Classic Blue Slim Fit Denim Jeans", price: 1450, mrp: 1850, photo: "/img/products/mens-denim-jeans.jpg", categoryCode: "mens-pant", storeSlug: "fashion-wear-studio", rating: 4.8, reviewCount: 380 },
    { name: "Men's Premium Slim Fit Casual Chino Pants", price: 1250, mrp: 1550, photo: "/img/products/khaki-chino-pants.jpg", categoryCode: "mens-pant", storeSlug: "fashion-wear-studio", rating: 4.7, reviewCount: 260 },
    { name: "Vintage Wash Straight Leg Denim Jeans", price: 1399, mrp: 1750, photo: "/img/products/1786172426238-Men_s_Jeans_PNG.jpg", categoryCode: "mens-pant", storeSlug: "fashion-wear-studio", rating: 4.6, reviewCount: 210 },
    { name: "Casual Khaki Stretch Cotton Chinos", price: 1199, mrp: 1499, photo: "/img/products/khaki-chino-pants.jpg", categoryCode: "mens-pant", storeSlug: "fashion-wear-studio", rating: 4.5, reviewCount: 160 },
    { name: "Comfort Fit Dark Indigo Denim Jeans", price: 1599, mrp: 1999, photo: "/img/products/mens-denim-jeans.jpg", categoryCode: "mens-pant", storeSlug: "fashion-wear-studio", rating: 4.8, reviewCount: 290 },
    { name: "Tailored Flat Front Khaki Chino Trousers", price: 1299, mrp: 1650, photo: "/img/products/khaki-chino-pants.jpg", categoryCode: "mens-pant", storeSlug: "fashion-wear-studio", rating: 4.6, reviewCount: 140 },
    { name: "Modern Tapered Fit Blue Denim Jeans", price: 1499, mrp: 1899, photo: "/img/products/mens-denim-jeans.jpg", categoryCode: "mens-pant", storeSlug: "fashion-wear-studio", rating: 4.7, reviewCount: 240 },
    { name: "Classic Khaki Workwear Chino Pants", price: 1150, mrp: 1450, photo: "/img/products/khaki-chino-pants.jpg", categoryCode: "mens-pant", storeSlug: "fashion-wear-studio", rating: 4.4, reviewCount: 110 },

    // --- ELECTRONICS & GADGETS ---
    { name: "Modern Flagship 5G Smartphone 256GB", price: 42500, mrp: 48000, photo: "/img/products/modern-smartphone.jpg", categoryCode: "electronics", storeSlug: "tech-vision-gadgets", rating: 4.8, reviewCount: 450, isHotDeal: true, isDailyDeal: true },
    { name: "Flagship 5G Smartphone 128GB Display", price: 32900, mrp: 45000, photo: "/flashsale/smartphone.jpg", categoryCode: "electronics", storeSlug: "tech-vision-gadgets", rating: 4.9, reviewCount: 280, isFlashSale: true },
    { name: "True Wireless Earbuds IPX7 Touch Control", price: 1899, mrp: 2499, photo: "/img/products/wireless-earbuds.jpg", categoryCode: "electronics", storeSlug: "tech-vision-gadgets", rating: 4.7, reviewCount: 280, isHotDeal: true },
    { name: "Portable Bluetooth Speaker 20W Waterproof", price: 2499, mrp: 2999, photo: "/img/products/portable-speaker.jpg", categoryCode: "electronics", storeSlug: "tech-vision-gadgets", rating: 4.7, reviewCount: 190, isHotDeal: true },
    { name: "Smart Watch Series 8 Bluetooth Health", price: 2199, mrp: 2699, photo: "/assets/smart-watch.png", categoryCode: "watches", storeSlug: "tech-vision-gadgets", rating: 4.6, reviewCount: 310, isHotDeal: true },
    { name: "Sleek 5G Android Smartphone Dual SIM", price: 38900, mrp: 44000, photo: "/img/products/modern-smartphone.jpg", categoryCode: "electronics", storeSlug: "tech-vision-gadgets", rating: 4.7, reviewCount: 220 },
    { name: "Active Noise Cancelling Wireless Earbuds", price: 2299, mrp: 2899, photo: "/img/products/wireless-earbuds.jpg", categoryCode: "electronics", storeSlug: "tech-vision-gadgets", rating: 4.8, reviewCount: 160 },
    { name: "High Power 360 Portable Wireless Speaker", price: 2899, mrp: 3499, photo: "/img/products/portable-speaker.jpg", categoryCode: "electronics", storeSlug: "tech-vision-gadgets", rating: 4.7, reviewCount: 140 },

    // --- FASHION & APPAREL ---
    { name: "Pro Athletic Lightweight Running Sneakers", price: 2150, mrp: 2650, photo: "/deals/deals_sneakers.jpg", categoryCode: "fashion", storeSlug: "fashion-wear-studio", rating: 4.8, reviewCount: 410 },
    { name: "Classic Cotton Pique Polo T-Shirt", price: 799, mrp: 999, photo: "/img/products/white-polo-shirt.jpg", categoryCode: "fashion", storeSlug: "fashion-wear-studio", rating: 4.6, reviewCount: 320 },
    { name: "Slim Fit Stretch Denim Jeans", price: 1450, mrp: 1850, photo: "/img/products/mens-denim-jeans.jpg", categoryCode: "fashion", storeSlug: "fashion-wear-studio", rating: 4.7, reviewCount: 280 },
    { name: "Casual Fleece Pullover Hoodie Sweatshirt", price: 1299, mrp: 1699, photo: "/img/products/black-cotton-tshirt.jpg", categoryCode: "fashion", storeSlug: "fashion-wear-studio", rating: 4.8, reviewCount: 250 },
    { name: "Waterproof Travel Laptop Backpack 30L", price: 1999, mrp: 2499, photo: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format&fit=crop&q=80", categoryCode: "fashion", storeSlug: "fashion-wear-studio", rating: 4.7, reviewCount: 190 },
    { name: "Polarized UV400 Sports Sunglasses", price: 1250, mrp: 1800, photo: "/deals/deals_sunglasses.jpg", categoryCode: "fashion", storeSlug: "fashion-wear-studio", rating: 4.9, reviewCount: 140, isFlashSale: true },

    // --- WATCHES & JEWELRY ---
    { name: "Luxury Gold Chronograph Leather Watch", price: 2850, mrp: 3450, photo: "/assets/banner/watches.png", categoryCode: "watches", storeSlug: "tech-vision-gadgets", rating: 4.8, reviewCount: 290, isHotDeal: true },
    { name: "Smart Watch Series 8 Bluetooth Health & Fitness", price: 2199, mrp: 2899, photo: "/assets/smart-watch.png", categoryCode: "watches", storeSlug: "tech-vision-gadgets", rating: 4.8, reviewCount: 242, isHotDeal: true },
    { name: "Classic Analog Dial Stainless Steel Watch", price: 3499, mrp: 4200, photo: "/assets/banner/watches.png", categoryCode: "watches", storeSlug: "tech-vision-gadgets", rating: 4.6, reviewCount: 190 },
    { name: "Sports GPS Watch Running Fitness Tracker", price: 2999, mrp: 3699, photo: "/assets/smart-watch.png", categoryCode: "watches", storeSlug: "tech-vision-gadgets", rating: 4.8, reviewCount: 250 },
    { name: "Executive Dress Watch Stainless Steel", price: 2650, mrp: 3200, photo: "/assets/banner/watches.png", categoryCode: "watches", storeSlug: "tech-vision-gadgets", rating: 4.6, reviewCount: 160 },
    { name: "NextGen Bluetooth Calling Smart Watch", price: 2599, mrp: 3199, photo: "/assets/smart-watch.png", categoryCode: "watches", storeSlug: "tech-vision-gadgets", rating: 4.7, reviewCount: 180 },

    // --- LAPTOPS & TECH ---
    { name: "Pro Slim Silver Laptop 15.6 Inch FHD", price: 46900, mrp: 53000, photo: "/categories/laptops.png", categoryCode: "laptops", storeSlug: "digital-hub-laptops", rating: 4.9, reviewCount: 360 },
    { name: "MacBook Air M2 Chip 13.6 Inch Liquid Retina", price: 118000, mrp: 129000, photo: "/assets/Macbook-laptop.png", categoryCode: "laptops", storeSlug: "digital-hub-laptops", rating: 4.9, reviewCount: 420, isHotDeal: true },
    { name: "Slim Ultrabook Core i7 16GB RAM 512GB SSD", price: 64500, mrp: 74000, photo: "/categories/laptops.png", categoryCode: "laptops", storeSlug: "digital-hub-laptops", rating: 4.8, reviewCount: 270 },
    { name: "MacBook Pro M3 Max 14-inch Space Gray", price: 189000, mrp: 205000, photo: "/assets/Macbook-laptop.png", categoryCode: "laptops", storeSlug: "digital-hub-laptops", rating: 4.9, reviewCount: 380 },
    { name: "Business Laptop 14 Inch Full HD Intel", price: 34500, mrp: 39500, photo: "/categories/laptops.png", categoryCode: "laptops", storeSlug: "digital-hub-laptops", rating: 4.6, reviewCount: 150 },
    { name: "MacBook Air 15-inch M2 Midnight Edition", price: 134000, mrp: 146000, photo: "/assets/Macbook-laptop.png", categoryCode: "laptops", storeSlug: "digital-hub-laptops", rating: 4.9, reviewCount: 310 },

    // --- BEAUTY & SKINCARE ---
    { name: "Aura Nocturne Eau De Parfum 100ml Luxury", price: 1450, mrp: 1800, photo: "/img/products/luxury-perfume.jpg", categoryCode: "beauty", storeSlug: "bangla-bazar-official", rating: 4.8, reviewCount: 320 },
    { name: "Vitamin C Brightening Face Serum 30ml", price: 899, mrp: 1099, photo: "/img/products/vitamin-c-serum.jpg", categoryCode: "beauty", storeSlug: "bangla-bazar-official", rating: 4.7, reviewCount: 270 },
    { name: "French Royal Bloom Eau De Parfum 100ml", price: 1650, mrp: 1999, photo: "/img/products/luxury-perfume.jpg", categoryCode: "beauty", storeSlug: "bangla-bazar-official", rating: 4.8, reviewCount: 210 },
    { name: "Organic Honey Spa Body Lotion & Skincare Kit", price: 2100, mrp: 3500, photo: "/flashsale/spa.jpg", categoryCode: "beauty", storeSlug: "bangla-bazar-official", rating: 5.0, reviewCount: 32, isFlashSale: true, isDailyDeal: true },
    { name: "Luminance Glow Vitamin C + HA Face Serum", price: 950, mrp: 1199, photo: "/img/products/vitamin-c-serum.jpg", categoryCode: "beauty", storeSlug: "bangla-bazar-official", rating: 4.7, reviewCount: 180 },

    // --- AUDIO & HEADPHONES ---
    { name: "Zeb-Duke 2 Wireless Bluetooth Headphone", price: 1450, mrp: 1799, photo: "/assets/banner/headphone.png", categoryCode: "audio", storeSlug: "tech-vision-gadgets", rating: 4.7, reviewCount: 380, isHotDeal: true, isFlashSale: true },
    { name: "Studio Pro Wireless ANC Over-Ear Headphone", price: 4899, mrp: 5999, photo: "/assets/banner/headphone.png", categoryCode: "audio", storeSlug: "tech-vision-gadgets", rating: 4.9, reviewCount: 290 },

    // --- HOME & FURNITURE ---
    { name: "Modern Geometric Indoor Succulent Pot", price: 950, mrp: 2000, photo: "/flashsale/plant.jpg", categoryCode: "home", storeSlug: "green-life-plants", rating: 5.0, reviewCount: 14, isFlashSale: true, isDailyDeal: true },
    { name: "Scandinavian Salmon Pink Accent Lounge Chair", price: 12400, mrp: 18500, photo: "/flashsale/chair.jpg", categoryCode: "furniture", storeSlug: "living-style-furnishings", rating: 5.0, reviewCount: 9, isFlashSale: true, isDailyDeal: true },
    { name: "Pure Organic Sundarban Raw Honey 500g", price: 650, mrp: 950, photo: "/deals/deals_honey.jpg", categoryCode: "groceries", storeSlug: "bangla-bazar-official", rating: 4.9, reviewCount: 110, isFlashSale: true },
    { name: "Casual Canvas Low-Top Sneakers", price: 1450, mrp: 2200, photo: "/deals/deals_sneakers.jpg", categoryCode: "footwear", storeSlug: "urban-footwear-shoes", rating: 4.7, reviewCount: 95, isFlashSale: true },
  ];

  let seededCount = 0;
  const createdProducts: any[] = [];

  for (const item of allProductsToSeed) {
    const catId = catMap[item.categoryCode] || catMap["electronics"];
    const storeId = storeMap[item.storeSlug] || storeMap["bangla-bazar-official"];
    const slug = item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    let product = await prisma.product.findFirst({
      where: { name: item.name },
    });

    if (product) {
      product = await prisma.product.update({
        where: { id: product.id },
        data: {
          name: item.name,
          slug: slug,
          description: item.description || `High quality verified authentic product: ${item.name}.`,
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
          stock: 50,
          availableQty: 50,
          averageRating: item.rating || 4.7,
          reviewCount: item.reviewCount || 25,
          salesType: item.isFlashSale ? SalesType.Offer : SalesType.Standerd,
          featured: (item.isHotDeal || item.isFlashSale || item.isDailyDeal) ? 'true' : 'false',
        },
      });
    } else {
      product = await prisma.product.create({
        data: {
          name: item.name,
          slug: slug,
          description: item.description || `High quality verified authentic product: ${item.name}.`,
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
          stock: 50,
          availableQty: 50,
          averageRating: item.rating || 4.7,
          reviewCount: item.reviewCount || 25,
          salesType: item.isFlashSale ? SalesType.Offer : SalesType.Standerd,
          featured: (item.isHotDeal || item.isFlashSale || item.isDailyDeal) ? 'true' : 'false',
        },
      });
    }
    createdProducts.push({ ...product, meta: item, assignedStoreId: storeId });
    seededCount++;
  }

  console.log(`✅ Seeded / Verified ${seededCount} total products in database!`);

  // 5. Ensure Flash Sale and FlashSaleProducts
  let flashSale = await prisma.flashSale.findFirst();
  if (!flashSale) {
    flashSale = await prisma.flashSale.create({
      data: {
        name: "Mega Weekend Flash Deals",
        banner: "/flashsale/vendor_banner.jpg",
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        productLimit: 50,
        minDiscountPercentage: 20,
      },
    });
  }

  // Link flash sale products
  const flashSaleItems = createdProducts.filter((p) => p.meta.isFlashSale);
  for (const fItem of flashSaleItems) {
    const existingFSP = await prisma.flashSaleProduct.findUnique({
      where: {
        flashSaleId_productId: {
          flashSaleId: flashSale.id,
          productId: fItem.id,
        },
      },
    });

    const discountPct = Math.round(((fItem.mrp - fItem.price) / fItem.mrp) * 100) || 25;

    if (!existingFSP) {
      await prisma.flashSaleProduct.create({
        data: {
          flashSale: { connect: { id: flashSale.id } },
          product: { connect: { id: fItem.id } },
          storeId: fItem.assignedStoreId,
          sellerId: seller.id,
          discountPercentage: discountPct,
          flashSaleStock: 25,
          purchaseLimit: 2,
          status: "Approved",
        },
      });
    }
  }
  console.log('✅ Flash sale products linked:', flashSaleItems.length);

  console.log('🎉 MongoDB Data Seeding Successfully Finished!');
}

seedHomeData()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
