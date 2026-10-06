import { PrismaClient, AdminUserType, Status, SalesType, StoreStatus } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function cleanDatabase() {
  console.log("🧹 Cleaning database...");

  const models = [
    "transaction",
    "transactions",
    "sales",
    "adjust",
    "damage",
    "grn",
    "tpn",
    "purchaseOrder",
    "order",
    "userLogs",
    "whishListQuery",
    "campaignProduct",
    "campaign",
    "flashSaleProduct",
    "flashSale",
    "storeVoucher",
    "customerVoucher",
    "productBundle",
    "homepageSection",
    "homepageBanner",
    "homepageSetting",
    "storeFeaturedProduct",
    "storePaymentSettings",
    "storeSettings",
    "review",
    "withdrawal",
    "productVariant",
    "stockLedger",
    "productQuestion",
    "productAnswer",
    "product",
    "store",
    "seller",
    "customer",
    "supplier",
    "brand",
    "unit",
    "coupon",
    "banner"
  ];

  for (const model of models) {
    try {
      // @ts-ignore
      if (prisma[model]) {
        // @ts-ignore
        await prisma[model].deleteMany({});
      }
    } catch (e: any) {
      console.log(`⚠️ Could not clear model ${model}: ${e.message}`);
    }
  }
  // Clear Category table by unlinking parentId first
  try {
    await prisma.category.updateMany({
      data: { parentId: null }
    });
    await prisma.category.deleteMany({});
    console.log("✅ Categories cleaned");
  } catch (e: any) {
    console.log(`⚠️ Could not clean categories: ${e.message}`);
  }

  await prisma.user.deleteMany({});
  console.log("✨ Database cleaned successfully");
}

async function main() {
  console.log("🌱 Starting complete seed process...");

  await cleanDatabase();

  // ============================================
  // 1. CREATE ADMIN USER
  // ============================================
  const hashedPassword = await bcrypt.hash("admin123", 10);
  const adminUser = await prisma.user.upsert({
    where: { username: "admin" },
    update: { password: hashedPassword },
    create: {
      email: "admin@banglabazar.com",
      phone: "01700000000",
      name: "System Administrator",
      username: "admin",
      password: hashedPassword,
      type: AdminUserType.Admin,
      status: Status.Active,
    },
  });
  console.log("✅ Admin user created: admin / admin123");

  // ============================================
  // 2. CREATE TEST CUSTOMER
  // ============================================
  const customerPassword = await bcrypt.hash("customer123", 10);
  const testCustomer = await prisma.customer.upsert({
    where: { phone: "01800000000" },
    update: { password: customerPassword, type: "Customer", walletBalance: 5000 },
    create: {
      name: "Shafin Ahmed",
      phone: "01800000000",
      email: "customer@banglabazar.com",
      type: "Customer",
      password: customerPassword,
      customerId: "CUST001",
      walletBalance: 5000,
      status: Status.Active,
    },
  });
  console.log("✅ Test customer created: 01800000000 / customer123");

  // ============================================
  // 3. CREATE TEST SELLER & STORE
  // ============================================
  const sellerPassword = await bcrypt.hash("seller123", 10);
  const testSeller = await prisma.seller.upsert({
    where: { phone: "01784773949" },
    update: { password: sellerPassword },
    create: {
      name: "Bangla Bazaar Retailer",
      phone: "01784773949",
      email: "seller@banglabazar.com",
      type: "seller",
      password: sellerPassword,
      sellerId: "SEL001",
      walletBalance: 25000,
      commissionRate: 10,
      tier: "Gold",
      status: Status.Active,
    }
  });
  console.log("✅ Test seller created: 01784773949 / seller123");

  // ============================================
  // 4. CREATE UNITS
  // ============================================
  const unitPcs = await prisma.unit.create({
    data: { name: "Pieces", code: "PCS", symbol: "pcs", status: "Active" }
  });
  const unitKg = await prisma.unit.create({
    data: { name: "Kilogram", code: "KG", symbol: "kg", status: "Active" }
  });
  const unitBox = await prisma.unit.create({
    data: { name: "Box", code: "BOX", symbol: "box", status: "Active" }
  });
  const unitPair = await prisma.unit.create({
    data: { name: "Pair", code: "PAIR", symbol: "pair", status: "Active" }
  });
  console.log("✅ Units created");

  // ============================================
  // 5. CREATE BRANDS
  // ============================================
  const brandSamsung = await prisma.brand.create({ data: { name: "Samsung", code: "SAMSUNG", status: "Active" } });
  const brandApple = await prisma.brand.create({ data: { name: "Apple", code: "APPLE", status: "Active" } });
  const brandSony = await prisma.brand.create({ data: { name: "Sony", code: "SONY", status: "Active" } });
  const brandNike = await prisma.brand.create({ data: { name: "Nike", code: "NIKE", status: "Active" } });
  const brandZara = await prisma.brand.create({ data: { name: "Zara", code: "ZARA", status: "Active" } });
  const brandCasio = await prisma.brand.create({ data: { name: "Casio", code: "CASIO", status: "Active" } });
  const brandFurnicom = await prisma.brand.create({ data: { name: "Furnicom", code: "FURNICOM", status: "Active" } });
  console.log("✅ Brands created");

  // ============================================
  // 6. CREATE SUPPLIER
  // ============================================
  const supplier = await prisma.supplier.create({
    data: {
      name: "Apex Global Distribution",
      phone: "01900000000",
      email: "supply@apexglobal.com",
      address: "Gulshan-2, Dhaka",
      company: "Apex Global Distribution Ltd",
      country: "Bangladesh",
      description: "Primary authorized e-commerce supplier",
      designation: "Managing Director",
      status: Status.Active
    }
  });
  console.log("✅ Supplier created");

  // ============================================
  // 7. CREATE CATEGORIES
  // ============================================
  const createCategory = async (name: string, code: string, photo: string, parentId?: string | null) => {
    return await prisma.category.upsert({
      where: { code },
      update: { name, photo, status: "Active", parentId: parentId || null },
      create: { name, code, status: "Active", photo, parentId: parentId || null }
    });
  };

  // Main Categories
  const catElectronics = await createCategory("Electronics & Gadgets", "electronics", "/categories/electronics.png");
  const catFashion = await createCategory("Fashion & Apparel", "fashion", "/categories/fashion.png");
  const catBeauty = await createCategory("Beauty & Skincare", "beauty", "/categories/beauty.png");
  const catWatches = await createCategory("Watches & Jewelry", "watches", "/assets/smart-watch.png");
  const catLaptops = await createCategory("Laptops & Tech", "laptops", "/categories/laptops.png");
  const catAudio = await createCategory("Headphones & Audio", "audio", "/assets/banner/headphone.png");
  const catHome = await createCategory("Home & Living", "home", "/flashsale/plant.jpg");
  const catGroceries = await createCategory("Groceries", "groceries", "/deals/deals_honey.jpg");
  const catFootwear = await createCategory("Footwear", "footwear", "/deals/deals_sneakers.jpg");

  // Subcategories
  const catMensTshirt = await createCategory("Men's T-Shirts & Polos", "mens-tshirt", "/img/products/black-cotton-tshirt.jpg", catFashion.id);
  const catMensPant = await createCategory("Men's Pants & Trousers", "mens-pant", "/img/products/mens-denim-jeans.jpg", catFashion.id);
  const catSmartphones = await createCategory("Smartphones & 5G Tablets", "smartphones", "/img/products/modern-smartphone.jpg", catElectronics.id);
  const catEarbuds = await createCategory("True Wireless Earbuds", "earbuds", "/img/products/wireless-earbuds.jpg", catAudio.id);
  const catPerfumes = await createCategory("Luxury Perfumes & Fragrance", "perfumes", "/img/products/luxury-perfume.jpg", catBeauty.id);
  const catFurniture = await createCategory("Accent Furniture & Living", "furniture", "/flashsale/chair.jpg", catHome.id);
  console.log("✅ Categories & Subcategories created");

  // ============================================
  // 8. CREATE STORE FOR SELLER
  // ============================================
  const officialStore = await prisma.store.create({
    data: {
      sellerId: testSeller.id,
      storeNameBn: "বাংলা বাজার অফিসিয়াল স্টোর",
      storeNameEn: "Bangla Bazaar Official Store",
      storeName: "Bangla Bazaar Official Store",
      slug: "bangla-bazar-official",
      description: "Official Flagship Store on Bangla Bazaar",
      phone: "01784773949",
      email: "store@banglabazar.com",
      storeLogo: "/logo-blue.png",
      storeBanner: "/flashsale/vendor_banner.jpg",
      status: StoreStatus.Approved,
      masterCategoryId: catElectronics.id,
      address: "Banani, Dhaka, Bangladesh"
    }
  });
  console.log("✅ Official Store created");

  // ============================================
  // 9. CREATE PRODUCTS CATALOG
  // ============================================
  const productsData = [
    // Flash / Deal Items
    {
      name: "Modern Geometric Indoor Succulent Pot",
      price: 950,
      mrp: 2000,
      tp: 750,
      photo: "/flashsale/plant.jpg",
      categoryId: catHome.id,
      brandId: brandFurnicom.id,
      unitId: unitPcs.id,
      stock: 50,
      soldQty: 38,
      averageRating: 5,
      reviewCount: 14,
      description: "High quality ceramic geometric succulent plant pot perfect for home and office decor.",
    },
    {
      name: "Flagship 5G Smartphone 128GB Display",
      price: 32900,
      mrp: 45000,
      tp: 29000,
      photo: "/flashsale/smartphone.jpg",
      categoryId: catElectronics.id,
      brandId: brandSamsung.id,
      unitId: unitPcs.id,
      stock: 20,
      soldQty: 17,
      averageRating: 5,
      reviewCount: 28,
      description: "Latest 5G flagship smartphone with OLED display, 128GB storage, and quad camera setup.",
    },
    {
      name: "Scandinavian Salmon Pink Accent Lounge Chair",
      price: 12400,
      mrp: 18500,
      tp: 10000,
      photo: "/flashsale/chair.jpg",
      categoryId: catFurniture.id,
      brandId: brandFurnicom.id,
      unitId: unitPcs.id,
      stock: 15,
      soldQty: 9,
      averageRating: 5,
      reviewCount: 9,
      description: "Nordic styled ergonomic accent armchair with solid wooden legs and velvet fabric finish.",
    },
    {
      name: "Organic Honey Spa Body Lotion & Skincare Kit",
      price: 2100,
      mrp: 3500,
      tp: 1600,
      photo: "/flashsale/spa.jpg",
      categoryId: catBeauty.id,
      brandId: brandZara.id,
      unitId: unitBox.id,
      stock: 80,
      soldQty: 62,
      averageRating: 5,
      reviewCount: 32,
      description: "All-natural organic honey herbal skincare spa collection for glowing moisturized skin.",
    },
    {
      name: "Polarized UV400 Sports Sunglasses",
      price: 1250,
      mrp: 1800,
      tp: 900,
      photo: "/deals/deals_sunglasses.jpg",
      categoryId: catFashion.id,
      brandId: brandNike.id,
      unitId: unitPcs.id,
      stock: 40,
      soldQty: 28,
      averageRating: 4.8,
      reviewCount: 21,
      description: "Lightweight UV400 polarized shades with yellow tinted night-vision and cycling lenses.",
    },
    {
      name: "Designer Pink Premium Blazer",
      price: 2450,
      mrp: 3200,
      tp: 1900,
      photo: "/deals/deals_blazer.jpg",
      categoryId: catFashion.id,
      brandId: brandZara.id,
      unitId: unitPcs.id,
      stock: 25,
      soldQty: 18,
      averageRating: 5,
      reviewCount: 16,
      description: "Contemporary tailored double-breasted formal blazer in luxury pastel rose finish.",
    },
    {
      name: "Pro Air Cushion Running Sneakers",
      price: 2650,
      mrp: 3800,
      tp: 2100,
      photo: "/deals/deals_sneakers.jpg",
      categoryId: catFootwear.id,
      brandId: brandNike.id,
      unitId: unitPair.id,
      stock: 30,
      soldQty: 22,
      averageRating: 5,
      reviewCount: 43,
      description: "Breathable mesh lightweight marathon running sneakers with responsive air cushioning.",
    },
    {
      name: "Pure Raw Organic Honey 500g Jar",
      price: 890,
      mrp: 1400,
      tp: 650,
      photo: "/deals/deals_honey.jpg",
      categoryId: catGroceries.id,
      brandId: brandFurnicom.id,
      unitId: unitPcs.id,
      stock: 60,
      soldQty: 49,
      averageRating: 5,
      reviewCount: 58,
      description: "100% pure unfiltered organic Sundarbans forest wild raw honey in sealed glass jar.",
    },
    {
      name: "Ultra Slim Titanium Pro Edition",
      price: 69900,
      mrp: 85000,
      tp: 62000,
      photo: "/deals/deals_iphone.jpg",
      categoryId: catElectronics.id,
      brandId: brandApple.id,
      unitId: unitPcs.id,
      stock: 12,
      soldQty: 8,
      averageRating: 5,
      reviewCount: 37,
      description: "Titanium grade premium luxury flagship smartphone with studio camera sensors.",
    },
    {
      name: "Urban Heritage Classic Slim Denim",
      price: 1550,
      mrp: 2200,
      tp: 1100,
      photo: "/deals/deals_menswear.jpg",
      categoryId: catMensPant.id,
      brandId: brandZara.id,
      unitId: unitPcs.id,
      stock: 45,
      soldQty: 31,
      averageRating: 5,
      reviewCount: 29,
      description: "Authentic indigo wash stretch cotton denim trousers with reinforced stitching.",
    },

    // Men's T-Shirts & Polos
    {
      name: "Premium Black Cotton Crewneck T-Shirt",
      price: 650,
      mrp: 850,
      tp: 450,
      photo: "/img/products/black-cotton-tshirt.jpg",
      categoryId: catMensTshirt.id,
      brandId: brandZara.id,
      unitId: unitPcs.id,
      stock: 100,
      soldQty: 45,
      averageRating: 4.8,
      reviewCount: 34,
      description: "100% combed ring-spun organic cotton breathable solid black crewneck t-shirt.",
    },
    {
      name: "Classic White Pique Polo T-Shirt",
      price: 799,
      mrp: 999,
      tp: 550,
      photo: "/img/products/white-polo-shirt.jpg",
      categoryId: catMensTshirt.id,
      brandId: brandNike.id,
      unitId: unitPcs.id,
      stock: 75,
      soldQty: 32,
      averageRating: 4.7,
      reviewCount: 28,
      description: "Timeless pique knit structured collar polo shirt with ribbed cuffs and mother-of-pearl buttons.",
    },
    {
      name: "Casual Fleece Pullover Hoodie Sweatshirt",
      price: 1299,
      mrp: 1699,
      tp: 900,
      photo: "/img/products/casual-hoodie.jpg",
      categoryId: catFashion.id,
      brandId: brandNike.id,
      unitId: unitPcs.id,
      stock: 60,
      soldQty: 25,
      averageRating: 4.8,
      reviewCount: 25,
      description: "Ultra soft heavyweight fleece hooded sweatshirt with front kangaroo pocket.",
    },

    // Men's Pants & Trousers
    {
      name: "Men's Classic Blue Slim Fit Denim Jeans",
      price: 1450,
      mrp: 1850,
      tp: 1050,
      photo: "/img/products/mens-denim-jeans.jpg",
      categoryId: catMensPant.id,
      brandId: brandZara.id,
      unitId: unitPcs.id,
      stock: 80,
      soldQty: 38,
      averageRating: 4.8,
      reviewCount: 38,
      description: "Premium washed stretch denim jeans with 5-pocket styling and tapered slim cut.",
    },
    {
      name: "Men's Premium Slim Fit Casual Chino Pants",
      price: 1250,
      mrp: 1550,
      tp: 850,
      photo: "/img/products/khaki-chino-pants.jpg",
      categoryId: catMensPant.id,
      brandId: brandZara.id,
      unitId: unitPcs.id,
      stock: 90,
      soldQty: 26,
      averageRating: 4.7,
      reviewCount: 26,
      description: "Tailored flat-front khaki chino trousers for office, business casual and weekend wear.",
    },

    // Electronics & Tech
    {
      name: "Modern Flagship 5G Smartphone 256GB",
      price: 42500,
      mrp: 48000,
      tp: 38000,
      photo: "/img/products/modern-smartphone.jpg",
      categoryId: catSmartphones.id,
      brandId: brandSamsung.id,
      unitId: unitPcs.id,
      stock: 25,
      soldQty: 19,
      averageRating: 4.8,
      reviewCount: 45,
      description: "Top-tier high speed 5G device with 120Hz AMOLED display, 256GB storage, 5000mAh battery.",
    },
    {
      name: "True Wireless Earbuds IPX7 Touch Control",
      price: 1899,
      mrp: 2499,
      tp: 1300,
      photo: "/img/products/wireless-earbuds.jpg",
      categoryId: catEarbuds.id,
      brandId: brandSony.id,
      unitId: unitBox.id,
      stock: 65,
      soldQty: 35,
      averageRating: 4.8,
      reviewCount: 35,
      description: "Lossless Hi-Fi deep bass bluetooth 5.3 earbuds with active ENC noise isolation.",
    },
    {
      name: "Portable Bluetooth Speaker 20W Waterproof",
      price: 2499,
      mrp: 2999,
      tp: 1800,
      photo: "/img/products/portable-speaker.jpg",
      categoryId: catAudio.id,
      brandId: brandSony.id,
      unitId: unitPcs.id,
      stock: 45,
      soldQty: 22,
      averageRating: 4.7,
      reviewCount: 22,
      description: "Rich 360 degree sound projection with 12hr continuous playtime and rugged IPX7 rating.",
    },
    {
      name: "Smart Watch Series 8 Bluetooth Health & Fitness",
      price: 2199,
      mrp: 2899,
      tp: 1600,
      photo: "/assets/smart-watch.png",
      categoryId: catWatches.id,
      brandId: brandApple.id,
      unitId: unitPcs.id,
      stock: 55,
      soldQty: 34,
      averageRating: 4.7,
      reviewCount: 34,
      description: "Comprehensive health tracker with ECG, SpO2 sensor, heart rate monitor, and retina display.",
    },
    {
      name: "Pro Slim Silver Laptop 15.6 Inch FHD",
      price: 46900,
      mrp: 53000,
      tp: 41000,
      photo: "/assets/categories/laptops.png",
      categoryId: catLaptops.id,
      brandId: brandSamsung.id,
      unitId: unitPcs.id,
      stock: 18,
      soldQty: 12,
      averageRating: 4.9,
      reviewCount: 36,
      description: "Intel Core i7 ultrabook with 16GB DDR5 RAM, 512GB NVMe SSD, full HD IPS backlit screen.",
    },
    {
      name: "MacBook Air M2 Chip 13.6 Inch Liquid Retina",
      price: 118000,
      mrp: 129000,
      tp: 105000,
      photo: "/assets/Macbook-laptop.png",
      categoryId: catLaptops.id,
      brandId: brandApple.id,
      unitId: unitPcs.id,
      stock: 10,
      soldQty: 6,
      averageRating: 4.9,
      reviewCount: 42,
      description: "Incredibly thin aluminum design with next-generation M2 speed, 18 hours battery life.",
    },
    {
      name: "Zeb-Duke 2 Wireless Bluetooth Headphone",
      price: 1450,
      mrp: 1799,
      tp: 1050,
      photo: "/assets/banner/headphone.png",
      categoryId: catAudio.id,
      brandId: brandSony.id,
      unitId: unitBox.id,
      stock: 50,
      soldQty: 29,
      averageRating: 4.7,
      reviewCount: 38,
      description: "Comfortable cushioned over-ear bluetooth wireless headphones with RGB lighting and microphone.",
    },
    {
      name: "Luxury Gold Chronograph Leather Watch",
      price: 2850,
      mrp: 3450,
      tp: 2000,
      photo: "/assets/banner/watches.png",
      categoryId: catWatches.id,
      brandId: brandCasio.id,
      unitId: unitBox.id,
      stock: 35,
      soldQty: 20,
      averageRating: 4.8,
      reviewCount: 29,
      description: "Precision Japanese quartz movement with genuine brown leather strap and gold stainless steel dial.",
    },
    {
      name: "Aura Nocturne Eau De Parfum 100ml Luxury",
      price: 1450,
      mrp: 1800,
      tp: 1000,
      photo: "/img/products/luxury-perfume.jpg",
      categoryId: catBeauty.id,
      brandId: brandZara.id,
      unitId: unitPcs.id,
      stock: 60,
      soldQty: 32,
      averageRating: 4.8,
      reviewCount: 32,
      description: "Long-lasting unisex French oriental fragrance infused with amber, bergamot, and cedarwood notes.",
    },
    {
      name: "Vitamin C Brightening Face Serum 30ml",
      price: 899,
      mrp: 1099,
      tp: 600,
      photo: "/img/products/vitamin-c-serum.jpg",
      categoryId: catBeauty.id,
      brandId: brandZara.id,
      unitId: unitPcs.id,
      stock: 90,
      soldQty: 48,
      averageRating: 4.7,
      reviewCount: 27,
      description: "Concentrated 20% Vitamin C + Hyaluronic Acid face serum for spot reduction and bright radiance.",
    },
    {
      name: "Waterproof Travel Laptop Backpack 30L",
      price: 1999,
      mrp: 2499,
      tp: 1400,
      photo: "/img/products/travel-backpack.jpg",
      categoryId: catFashion.id,
      brandId: brandNike.id,
      unitId: unitPcs.id,
      stock: 40,
      soldQty: 19,
      averageRating: 4.7,
      reviewCount: 19,
      description: "Ergonomic multi-compartment travel daypack with USB charging port and anti-theft zipper locks.",
    }
  ];

  const createdProducts = [];
  for (const item of productsData) {
    const p = await prisma.product.create({
      data: {
        name: item.name,
        price: item.price,
        mrp: item.mrp,
        tp: item.tp,
        photo: item.photo,
        categoryId: item.categoryId,
        masterCategoryId: item.categoryId,
        brandId: item.brandId,
        unitId: item.unitId,
        sellerId: testSeller.id,
        storeId: officialStore.id,
        supplierId: supplier.id,
        stock: item.stock,
        availableQty: item.stock,
        soldQty: item.soldQty,
        averageRating: item.averageRating,
        reviewCount: item.reviewCount,
        description: item.description,
        status: Status.Active,
        salesType: SalesType.Standerd
      }
    });
    createdProducts.push(p);
  }
  console.log(`✅ Created ${createdProducts.length} Products`);

  // ============================================
  // 10. CREATE FLASH SALE & FLASH SALE PRODUCTS
  // ============================================
  const flashSaleEndDate = new Date();
  flashSaleEndDate.setDate(flashSaleEndDate.getDate() + 214);
  flashSaleEndDate.setHours(flashSaleEndDate.getHours() + 14);

  const flashSale = await prisma.flashSale.create({
    data: {
      name: "Summer Mega Flash Deals",
      banner: "/flashsale/vendor_banner.jpg",
      startDate: new Date(),
      endDate: flashSaleEndDate,
      productLimit: 50,
      minDiscountPercentage: 20,
    }
  });

  // Link first 8 products to Flash Sale
  for (let i = 0; i < Math.min(8, createdProducts.length); i++) {
    const product = createdProducts[i];
    const discountPct = Math.round(((product.mrp! - product.price) / product.mrp!) * 100) || 30;
    await prisma.flashSaleProduct.create({
      data: {
        flashSaleId: flashSale.id,
        productId: product.id,
        sellerId: testSeller.id,
        storeId: officialStore.id,
        discountPercentage: discountPct,
        flashSaleStock: 25,
        purchaseLimit: 3,
        status: "Approved",
      }
    });
  }
  console.log("✅ Flash Sale created with approved products");

  // ============================================
  // 11. CREATE MEGA CAMPAIGN & PRODUCTS
  // ============================================
  const campaignEndDate = new Date();
  campaignEndDate.setDate(campaignEndDate.getDate() + 30);

  const campaign = await prisma.campaign.create({
    data: {
      name: "Grand Eid Mega Festival 2026",
      banner: "/flashsale/vendor_banner.jpg",
      description: "Exclusive nationwide seasonal discounts up to 60% across all authentic brands.",
      startDate: new Date(),
      endDate: campaignEndDate,
      eligibleCategoryIds: [catElectronics.id, catFashion.id, catBeauty.id, catWatches.id],
      maxProductLimit: 100,
      minDiscountPercentage: 15,
      status: "Running",
    }
  });

  for (let i = 8; i < Math.min(16, createdProducts.length); i++) {
    const product = createdProducts[i];
    await prisma.campaignProduct.create({
      data: {
        campaignId: campaign.id,
        productId: product.id,
        sellerId: testSeller.id,
        storeId: officialStore.id,
        discountPercentage: 25,
        status: "Approved",
      }
    });
  }
  console.log("✅ Mega Campaign created with approved products");

  // ============================================
  // 12. CREATE HOMEPAGE BANNERS
  // ============================================
  await prisma.homepageBanner.createMany({
    data: [
      {
        title: "Latest Tech & Flagship Gadgets",
        subtitle: "Up to 40% OFF with official warranty",
        desktopImage: "/assets/banner/tech_bundle.png",
        linkUrl: "/products?category=electronics",
        position: 1,
        enabled: true,
      },
      {
        title: "Premium Wireless Over-Ear Audio",
        subtitle: "Studio grade sound with active noise cancellation",
        desktopImage: "/assets/banner/headphone.png",
        linkUrl: "/products?category=audio",
        position: 2,
        enabled: true,
      },
      {
        title: "Luxury Timepieces & Smart Fitness Watches",
        subtitle: "Elegant craftsmanship meet modern technology",
        desktopImage: "/assets/banner/watches.png",
        linkUrl: "/products?category=watches",
        position: 3,
        enabled: true,
      },
    ]
  });

  await prisma.banner.createMany({
    data: [
      {
        title: "Tech Innovation Hub",
        imageUrl: "/assets/banner/tech_bundle.png",
        link: "/products?category=electronics",
        type: "MainSlider" as any,
        order: 1,
        status: Status.Active,
      },
      {
        title: "Pro Sound Series",
        imageUrl: "/assets/banner/headphone.png",
        link: "/products?category=audio",
        type: "MainSlider" as any,
        order: 2,
        status: Status.Active,
      },
      {
        title: "Chrono Heritage",
        imageUrl: "/assets/banner/watches.png",
        link: "/products?category=watches",
        type: "MainSlider" as any,
        order: 3,
        status: Status.Active,
      },
    ]
  });
  console.log("✅ Homepage Banners created");

  // ============================================
  // 13. CONFIGURE HOMEPAGE SECTIONS
  // ============================================
  const sections = [
    { sectionType: "Navbar", position: 1, enabled: true },
    { sectionType: "HeroBanner", position: 2, enabled: true },
    { sectionType: "Categories", titleEn: "Explore Popular Categories", position: 3, enabled: true },
    { sectionType: "FlashSale", titleEn: "Flash Sale", flashSaleId: flashSale.id, position: 4, enabled: true },
    { sectionType: "TodayDeals", titleEn: "Deals Of The Day", position: 5, enabled: true },
    { sectionType: "WeeklyBest", titleEn: "Weekly Best Products", position: 6, enabled: true, config: { limit: 12 } },
    { sectionType: "CampaignBanner", titleEn: "Seasonal Mega Campaign", campaignId: campaign.id, position: 7, enabled: true },
    { sectionType: "FeaturedProducts", titleEn: "Featured Products Grid", position: 8, enabled: true, config: { limit: 24 } },
    { sectionType: "Footer", position: 9, enabled: true },
  ];

  for (const sec of sections) {
    await prisma.homepageSection.create({
      data: sec
    });
  }
  console.log("✅ Dynamic Homepage Sections configured");

  console.log("🎉 All data successfully seeded into database!");
}

main()
  .catch((e) => {
    console.error("❌ Error during seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });