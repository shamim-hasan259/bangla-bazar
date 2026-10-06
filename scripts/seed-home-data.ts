import prisma from '../prisma';
import { Status, SalesType } from '@prisma/client';

async function seedHomeData() {
  console.log('🌱 Starting Comprehensive Category & Product Data Seed into MongoDB...');

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

  // 2. Ensure Main Categories Exist with Working Images
  const categoriesData = [
    { name: "Electronics & Gadgets", code: "electronics", photo: "/assets/categories/electronics.png" },
    { name: "Fashion & Apparel", code: "fashion", photo: "/assets/categories/fashion.png" },
    { name: "Beauty & Skincare", code: "beauty", photo: "/assets/categories/beauty.png" },
    { name: "Watches & Jewelry", code: "watches", photo: "/assets/categories/watches.png" },
    { name: "Laptops & Tech", code: "laptops", photo: "/assets/categories/laptops.png" },
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
  console.log('✅ Categories verified/updated:', Object.keys(catMap).length);

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

  // 4. Products Data Set - Realistic, Category-Specific, High-Quality Images
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
    // ==========================================
    // --- 1. MEN'S T-SHIRTS & POLOS (mens-tshirt) ---
    // ==========================================
    {
      name: "Premium Black Cotton Crewneck T-Shirt",
      price: 650,
      mrp: 850,
      photo: "/img/products/black-cotton-tshirt.jpg",
      categoryCode: "mens-tshirt",
      storeSlug: "fashion-wear-studio",
      rating: 4.8,
      reviewCount: 340,
      description: "100% Combed Compact Cotton 180 GSM, breathable regular fit crewneck tee for daily wear.",
    },
    {
      name: "Classic White Pique Polo T-Shirt",
      price: 799,
      mrp: 999,
      photo: "/img/products/white-polo-shirt.jpg",
      categoryCode: "mens-tshirt",
      storeSlug: "fashion-wear-studio",
      rating: 4.7,
      reviewCount: 280,
      description: "220 GSM breathable honeycomb pique cotton polo shirt with ribbed collar and placket buttons.",
    },
    {
      name: "Navy Blue Slim-Fit Pique Polo Shirt",
      price: 850,
      mrp: 1100,
      photo: "https://images.unsplash.com/photo-1625910513413-562624a0d367?w=600&auto=format&fit=crop&q=80",
      categoryCode: "mens-tshirt",
      storeSlug: "fashion-wear-studio",
      rating: 4.8,
      reviewCount: 215,
      description: "Premium rich navy blue tailored fit polo shirt with contrast collar tipping.",
    },
    {
      name: "Charcoal Heather Vintage Cotton Tee",
      price: 599,
      mrp: 799,
      photo: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80",
      categoryCode: "mens-tshirt",
      storeSlug: "fashion-wear-studio",
      rating: 4.6,
      reviewCount: 190,
      description: "Super-soft washed charcoal heather minimalist crewneck tee with reinforced stitching.",
    },
    {
      name: "Olive Green Minimalist Organic Cotton T-Shirt",
      price: 699,
      mrp: 899,
      photo: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&auto=format&fit=crop&q=80",
      categoryCode: "mens-tshirt",
      storeSlug: "fashion-wear-studio",
      rating: 4.7,
      reviewCount: 175,
      description: "Earth-toned bio-washed organic cotton t-shirt with premium pre-shrunk fabric.",
    },
    {
      name: "Burgundy Red Summer Collar Polo Shirt",
      price: 890,
      mrp: 1150,
      photo: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600&auto=format&fit=crop&q=80",
      categoryCode: "mens-tshirt",
      storeSlug: "fashion-wear-studio",
      rating: 4.8,
      reviewCount: 140,
      description: "Elegant burgundy solid color polo shirt engineered for maximum comfort and style.",
    },
    {
      name: "Graphic Streetwear Oversized Heavyweight Tee",
      price: 750,
      mrp: 990,
      photo: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&auto=format&fit=crop&q=80",
      categoryCode: "mens-tshirt",
      storeSlug: "fashion-wear-studio",
      rating: 4.6,
      reviewCount: 230,
      description: "240 GSM drop-shoulder oversized streetwear t-shirt with high density screen print.",
    },
    {
      name: "Striped Nautical Regular Fit Cotton Polo",
      price: 950,
      mrp: 1250,
      photo: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&auto=format&fit=crop&q=80",
      categoryCode: "mens-tshirt",
      storeSlug: "fashion-wear-studio",
      rating: 4.7,
      reviewCount: 160,
      description: "Timeless yarn-dyed horizontal striped knit polo shirt with mother-of-pearl buttons.",
    },

    // ==========================================
    // --- 2. MEN'S PANTS & TROUSERS (mens-pant) ---
    // ==========================================
    {
      name: "Men's Classic Blue Slim Fit Denim Jeans",
      price: 1450,
      mrp: 1850,
      photo: "/img/products/mens-denim-jeans.jpg",
      categoryCode: "mens-pant",
      storeSlug: "fashion-wear-studio",
      rating: 4.8,
      reviewCount: 380,
      description: "12.5 oz durable stretch denim jeans with authentic washed whiskers and copper rivets.",
    },
    {
      name: "Men's Premium Slim Fit Khaki Chino Pants",
      price: 1250,
      mrp: 1550,
      photo: "/img/products/khaki-chino-pants.jpg",
      categoryCode: "mens-pant",
      storeSlug: "fashion-wear-studio",
      rating: 4.7,
      reviewCount: 260,
      description: "Smart casual stretch twill khaki chinos with flat front and tailored tapered legs.",
    },
    {
      name: "Vintage Washed Charcoal Gray Denim Jeans",
      price: 1550,
      mrp: 1950,
      photo: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&auto=format&fit=crop&q=80",
      categoryCode: "mens-pant",
      storeSlug: "fashion-wear-studio",
      rating: 4.7,
      reviewCount: 210,
      description: "Heavyweight stone-washed gray denim with rugged five-pocket styling and YKK zip fly.",
    },
    {
      name: "Tailored Formal Navy Blue Suit Trousers",
      price: 1650,
      mrp: 2100,
      photo: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&auto=format&fit=crop&q=80",
      categoryCode: "mens-pant",
      storeSlug: "fashion-wear-studio",
      rating: 4.8,
      reviewCount: 195,
      description: "Wrinkle-resistant wool-blend formal dress trousers with expandable waistband and clean crease.",
    },
    {
      name: "Urban Tactical Multi-Pocket Cargo Pants (Olive)",
      price: 1399,
      mrp: 1799,
      photo: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&auto=format&fit=crop&q=80",
      categoryCode: "mens-pant",
      storeSlug: "fashion-wear-studio",
      rating: 4.6,
      reviewCount: 180,
      description: "Ripstop cotton combat cargo pants with 6 reinforced utility pockets and drawstring cuffs.",
    },
    {
      name: "Dark Indigo Stretch Comfort Denim Jeans",
      price: 1499,
      mrp: 1899,
      photo: "https://images.unsplash.com/photo-1604176354204-9268737828e4?w=600&auto=format&fit=crop&q=80",
      categoryCode: "mens-pant",
      storeSlug: "fashion-wear-studio",
      rating: 4.8,
      reviewCount: 290,
      description: "Deep raw indigo wash comfort fit jeans with flexible 2-way elastane stretch.",
    },
    {
      name: "Beige Relaxed Cotton Linen Summer Trousers",
      price: 1350,
      mrp: 1700,
      photo: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&auto=format&fit=crop&q=80",
      categoryCode: "mens-pant",
      storeSlug: "fashion-wear-studio",
      rating: 4.5,
      reviewCount: 130,
      description: "Lightweight breathable linen blend trousers perfect for hot tropical climates.",
    },
    {
      name: "Slim Fit Jet Black Formal Dress Trousers",
      price: 1450,
      mrp: 1850,
      photo: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600&auto=format&fit=crop&q=80",
      categoryCode: "mens-pant",
      storeSlug: "fashion-wear-studio",
      rating: 4.7,
      reviewCount: 240,
      description: "Crisp matte black executive formal trousers designed for office and ceremonies.",
    },

    // ==========================================
    // --- 3. ELECTRONICS & GADGETS (electronics) ---
    // ==========================================
    {
      name: "Modern Flagship 5G Smartphone 256GB",
      price: 42500,
      mrp: 48000,
      photo: "/img/products/modern-smartphone.jpg",
      categoryCode: "electronics",
      storeSlug: "tech-vision-gadgets",
      rating: 4.9,
      reviewCount: 450,
      isHotDeal: true,
      isDailyDeal: true,
      description: "6.7\" 120Hz Dynamic AMOLED display, 108MP OIS Camera, Snapdragon 8 Gen 2, 5000mAh battery.",
    },
    {
      name: "Flagship 5G Smartphone 128GB Display",
      price: 32900,
      mrp: 45000,
      photo: "/flashsale/smartphone.jpg",
      categoryCode: "electronics",
      storeSlug: "tech-vision-gadgets",
      rating: 4.9,
      reviewCount: 280,
      isFlashSale: true,
      description: "Ultra slim body, edge-to-edge curved screen, 64MP triple camera and 67W Turbo Charge.",
    },
    {
      name: "True Wireless Earbuds IPX7 Touch Control",
      price: 1899,
      mrp: 2499,
      photo: "/img/products/wireless-earbuds.jpg",
      categoryCode: "electronics",
      storeSlug: "tech-vision-gadgets",
      rating: 4.7,
      reviewCount: 280,
      isHotDeal: true,
      description: "Low latency Bluetooth 5.3, deep punchy bass, IPX7 sweatproof and 36hr total playtime.",
    },
    {
      name: "Portable Bluetooth Speaker 20W Deep Bass",
      price: 2499,
      mrp: 2999,
      photo: "/img/products/portable-speaker.jpg",
      categoryCode: "electronics",
      storeSlug: "tech-vision-gadgets",
      rating: 4.7,
      reviewCount: 190,
      isHotDeal: true,
      description: "IPX7 waterproof cylindrical speaker with dual passive radiators and 12-hour battery life.",
    },
    {
      name: "4K Ultra HD Action Camera Waterproof 30M",
      price: 6800,
      mrp: 8500,
      photo: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80",
      categoryCode: "electronics",
      storeSlug: "tech-vision-gadgets",
      rating: 4.8,
      reviewCount: 155,
      isHotDeal: true,
      description: "4K 60FPS video recording, 6-axis gyro image stabilization, WiFi and dual color screens.",
    },
    {
      name: "Magnetic 15W Fast Wireless Charger Stand",
      price: 1450,
      mrp: 1950,
      photo: "https://images.unsplash.com/photo-1622445262464-84b1456045b6?w=600&auto=format&fit=crop&q=80",
      categoryCode: "electronics",
      storeSlug: "tech-vision-gadgets",
      rating: 4.6,
      reviewCount: 120,
      description: "Qi-certified 3-in-1 magnetic fast charging dock for smartphones, earbuds and smartwatches.",
    },
    {
      name: "20000mAh 65W PD Fast Charging Power Bank",
      price: 2650,
      mrp: 3200,
      photo: "https://images.unsplash.com/photo-1609592426505-59b48c18c66a?w=600&auto=format&fit=crop&q=80",
      categoryCode: "electronics",
      storeSlug: "tech-vision-gadgets",
      rating: 4.8,
      reviewCount: 210,
      description: "Can charge laptops and smartphones simultaneously with real-time digital LED power display.",
    },
    {
      name: "Smart Home 2K Security Camera 360 Night Vision",
      price: 3100,
      mrp: 3800,
      photo: "https://images.unsplash.com/photo-1557324232-b8917d3c3dcb?w=600&auto=format&fit=crop&q=80",
      categoryCode: "electronics",
      storeSlug: "tech-vision-gadgets",
      rating: 4.7,
      reviewCount: 145,
      description: "Full HD 360 degree pan/tilt with AI human detection, two-way audio and infrared night vision.",
    },

    // ==========================================
    // --- 4. FASHION & APPAREL (fashion) ---
    // ==========================================
    {
      name: "Pro Athletic Lightweight Running Sneakers",
      price: 2150,
      mrp: 2650,
      photo: "/deals/deals_sneakers.jpg",
      categoryCode: "fashion",
      storeSlug: "fashion-wear-studio",
      rating: 4.8,
      reviewCount: 410,
      isHotDeal: true,
      description: "Engineered mesh upper with high-rebound cushioning EVA sole for running and gym workouts.",
    },
    {
      name: "Urban Oversized Heavyweight Fleece Hoodie",
      price: 1550,
      mrp: 1999,
      photo: "/img/products/casual-hoodie.jpg",
      categoryCode: "fashion",
      storeSlug: "fashion-wear-studio",
      rating: 4.9,
      reviewCount: 320,
      isHotDeal: true,
      description: "320 GSM brushed fleece cotton hoodie with kangaroo pocket and double-layer hood.",
    },
    {
      name: "Waterproof Commuter Laptop Backpack 30L",
      price: 1999,
      mrp: 2499,
      photo: "/img/products/travel-backpack.jpg",
      categoryCode: "fashion",
      storeSlug: "fashion-wear-studio",
      rating: 4.7,
      reviewCount: 280,
      isHotDeal: true,
      description: "Weatherproof oxford fabric with dedicated padded 15.6\" laptop compartment and USB port.",
    },
    {
      name: "Classic Slim Fit Tailored Blazer",
      price: 4200,
      mrp: 5500,
      photo: "/deals/deals_blazer.jpg",
      categoryCode: "fashion",
      storeSlug: "fashion-wear-studio",
      rating: 4.8,
      reviewCount: 160,
      description: "Single-breasted modern cut blazer crafted from fine blended fabric with notch lapels.",
    },
    {
      name: "Polarized UV400 Wayfarer Sports Sunglasses",
      price: 1250,
      mrp: 1800,
      photo: "/deals/deals_sunglasses.jpg",
      categoryCode: "fashion",
      storeSlug: "fashion-wear-studio",
      rating: 4.9,
      reviewCount: 140,
      isFlashSale: true,
      description: "HD polarized TAC lenses with anti-glare coating and lightweight TR90 unbreakable frame.",
    },
    {
      name: "Premium Oxford Long Sleeve Casual Button-Down Shirt",
      price: 1350,
      mrp: 1750,
      photo: "/deals/deals_menswear.jpg",
      categoryCode: "fashion",
      storeSlug: "fashion-wear-studio",
      rating: 4.7,
      reviewCount: 220,
      description: "100% fine pinpoint Oxford cotton shirt with button-down collar and curved hem.",
    },
    {
      name: "Streetwear Colorblock Casual Windbreaker Jacket",
      price: 2450,
      mrp: 3100,
      photo: "https://images.unsplash.com/photo-1548883354-7622d03aca27?w=600&auto=format&fit=crop&q=80",
      categoryCode: "fashion",
      storeSlug: "fashion-wear-studio",
      rating: 4.6,
      reviewCount: 135,
      description: "Lightweight windproof and water-repellent jacket with breathable mesh inner lining.",
    },
    {
      name: "Casual Canvas Low-Top Everyday Sneakers",
      price: 1650,
      mrp: 2100,
      photo: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&auto=format&fit=crop&q=80",
      categoryCode: "fashion",
      storeSlug: "fashion-wear-studio",
      rating: 4.8,
      reviewCount: 245,
      isFlashSale: true,
      description: "Vulcanized rubber sole with durable canvas upper for casual lifestyle and daily walking.",
    },

    // ==========================================
    // --- 5. WATCHES & JEWELRY (watches) ---
    // ==========================================
    {
      name: "Luxury Gold Chronograph Leather Watch",
      price: 2850,
      mrp: 3450,
      photo: "/assets/banner/watches.png",
      categoryCode: "watches",
      storeSlug: "tech-vision-gadgets",
      rating: 4.8,
      reviewCount: 290,
      isHotDeal: true,
      description: "Japanese quartz movement with chronograph sub-dials, date display and genuine leather strap.",
    },
    {
      name: "Smart Watch Series 8 Bluetooth Health & Fitness",
      price: 2199,
      mrp: 2899,
      photo: "/assets/smart-watch.png",
      categoryCode: "watches",
      storeSlug: "tech-vision-gadgets",
      rating: 4.8,
      reviewCount: 242,
      isHotDeal: true,
      description: "1.9\" HD full touch screen with Heart Rate, SpO2, Sleep Monitor and Bluetooth HD calling.",
    },
    {
      name: "Classic Silver Stainless Steel Analog Men's Watch",
      price: 3499,
      mrp: 4200,
      photo: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600&auto=format&fit=crop&q=80",
      categoryCode: "watches",
      storeSlug: "tech-vision-gadgets",
      rating: 4.7,
      reviewCount: 190,
      description: "Solid 316L stainless steel case and bracelet with sapphire crystal scratch-resistant glass.",
    },
    {
      name: "Minimalist Black Dial Mesh Strap Watch",
      price: 2250,
      mrp: 2850,
      photo: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&auto=format&fit=crop&q=80",
      categoryCode: "watches",
      storeSlug: "tech-vision-gadgets",
      rating: 4.6,
      reviewCount: 165,
      description: "Ultra-slim 7mm profile with matte black sunray dial and magnetic Milanese loop strap.",
    },
    {
      name: "Apple Watch Ultra 2 GPS + Cellular 49mm Titanium",
      price: 88500,
      mrp: 96000,
      photo: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&auto=format&fit=crop&q=80",
      categoryCode: "watches",
      storeSlug: "tech-vision-gadgets",
      rating: 4.9,
      reviewCount: 380,
      isHotDeal: true,
      description: "Rugged aerospace-grade titanium case, precision dual-frequency GPS, up to 72 hours battery life.",
    },
    {
      name: "Samsung Galaxy Watch 6 Classic 47mm Rotating Bezel",
      price: 32500,
      mrp: 36900,
      photo: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&auto=format&fit=crop&q=80",
      categoryCode: "watches",
      storeSlug: "tech-vision-gadgets",
      rating: 4.8,
      reviewCount: 260,
      isHotDeal: true,
      description: "Physical rotating bezel, advanced sleep coaching, BIA body composition and ECG analysis.",
    },
    {
      name: "Rose Gold Women's Crystal Accent Quartz Watch",
      price: 2750,
      mrp: 3400,
      photo: "https://images.unsplash.com/photo-1539185441755-769473a23570?w=600&auto=format&fit=crop&q=80",
      categoryCode: "watches",
      storeSlug: "tech-vision-gadgets",
      rating: 4.8,
      reviewCount: 180,
      description: "Jeweled bezel with genuine Austrian crystals and polished rose gold PVD coating.",
    },
    {
      name: "Diver Pro 200M Water Resistant Automatic Watch",
      price: 6900,
      mrp: 8500,
      photo: "https://images.unsplash.com/photo-1533139502658-0198f920d8e8?w=600&auto=format&fit=crop&q=80",
      categoryCode: "watches",
      storeSlug: "tech-vision-gadgets",
      rating: 4.9,
      reviewCount: 215,
      description: "Self-winding mechanical automatic movement with luminous hands and 120-click uni-directional bezel.",
    },

    // ==========================================
    // --- 6. LAPTOPS & TECH (laptops) ---
    // ==========================================
    {
      name: "Apple MacBook Air M2 Chip 13.6\" Liquid Retina",
      price: 118000,
      mrp: 129000,
      photo: "/assets/Macbook-laptop.png",
      categoryCode: "laptops",
      storeSlug: "digital-hub-laptops",
      rating: 4.9,
      reviewCount: 420,
      isHotDeal: true,
      description: "Apple M2 8-Core CPU, 10-Core GPU, 8GB Unified Memory, 256GB SSD, MagSafe 3 charging.",
    },
    {
      name: "Apple MacBook Pro 14\" M3 Max Space Gray",
      price: 189000,
      mrp: 205000,
      photo: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80",
      categoryCode: "laptops",
      storeSlug: "digital-hub-laptops",
      rating: 4.9,
      reviewCount: 380,
      isHotDeal: true,
      description: "Extreme performance 14-core CPU, 30-core GPU, Liquid Retina XDR 120Hz ProMotion display.",
    },
    {
      name: "ASUS ROG Zephyrus G14 Gaming Laptop RTX 4070",
      price: 145000,
      mrp: 162000,
      photo: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&auto=format&fit=crop&q=80",
      categoryCode: "laptops",
      storeSlug: "digital-hub-laptops",
      rating: 4.9,
      reviewCount: 290,
      description: "AMD Ryzen 9 7940HS, NVIDIA RTX 4070 8GB, 16GB DDR5, 1TB NVMe Gen4 SSD, 165Hz ROG Nebula Display.",
    },
    {
      name: "Dell XPS 13 Plus 4K OLED Touchscreen Core i7",
      price: 135000,
      mrp: 149000,
      photo: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&auto=format&fit=crop&q=80",
      categoryCode: "laptops",
      storeSlug: "digital-hub-laptops",
      rating: 4.8,
      reviewCount: 230,
      description: "13th Gen Intel Core i7-1360P, 3.5K OLED InfinityEdge Touch, 16GB LPDDR5, capacitive touch function row.",
    },
    {
      name: "Lenovo ThinkPad X1 Carbon Gen 11 Ultralight Laptop",
      price: 128000,
      mrp: 140000,
      photo: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80",
      categoryCode: "laptops",
      storeSlug: "digital-hub-laptops",
      rating: 4.8,
      reviewCount: 210,
      description: "Carbon fiber chassis weighing only 1.12kg, MIL-SPEC tested durability, Intel Evo certified Core i7.",
    },
    {
      name: "HP Pavilion 15.6\" Ryzen 7 FHD Rose Gold Laptop",
      price: 68500,
      mrp: 76000,
      photo: "/img/products/1791189734778-HP_15_6_Ryzen_5_8GB_256GB_Laptop_Rose_Gold_36809cf3_480b_47a5_94f0_e1d5e70c58c0_3.fcc0d6494b0e279a13c32c80c28abfa3.avif",
      categoryCode: "laptops",
      storeSlug: "digital-hub-laptops",
      rating: 4.7,
      reviewCount: 175,
      description: "AMD Ryzen 7 5700U 8-Core, 16GB RAM, 512GB NVMe SSD, B&O Audio, backlit keyboard.",
    },
    {
      name: "Microsoft Surface Laptop 5 13.5\" PixelSense Touch",
      price: 98000,
      mrp: 110000,
      photo: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&auto=format&fit=crop&q=80",
      categoryCode: "laptops",
      storeSlug: "digital-hub-laptops",
      rating: 4.7,
      reviewCount: 160,
      description: "Vibrant PixelSense touchscreen with Surface Pen support, Thunderbolt 4 and Alcantara keyboard deck.",
    },
    {
      name: "Pro Slim Silver Laptop 15.6\" FHD Intel Core i5",
      price: 46900,
      mrp: 53000,
      photo: "/assets/categories/laptops.png",
      categoryCode: "laptops",
      storeSlug: "digital-hub-laptops",
      rating: 4.6,
      reviewCount: 360,
      description: "Intel Core i5 12th Gen, 8GB DDR4, 512GB SSD, aluminum chassis with fast charging Type-C.",
    },

    // ==========================================
    // --- 7. BEAUTY & SKINCARE (beauty) ---
    // ==========================================
    {
      name: "Aura Nocturne Luxury Eau De Parfum 100ml",
      price: 1450,
      mrp: 1800,
      photo: "/img/products/luxury-perfume.jpg",
      categoryCode: "beauty",
      storeSlug: "bangla-bazar-official",
      rating: 4.8,
      reviewCount: 320,
      description: "Long lasting oriental woody notes with vanilla, amber and sandalwood essence.",
    },
    {
      name: "Vitamin C Brightening Face Serum 30ml",
      price: 899,
      mrp: 1099,
      photo: "/img/products/vitamin-c-serum.jpg",
      categoryCode: "beauty",
      storeSlug: "bangla-bazar-official",
      rating: 4.7,
      reviewCount: 270,
      description: "20% pure L-Ascorbic Acid with Hyaluronic Acid and Vitamin E for glowing radiant skin.",
    },
    {
      name: "French Royal Bloom Luxury EDP Spray 100ml",
      price: 1650,
      mrp: 1999,
      photo: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600&auto=format&fit=crop&q=80",
      categoryCode: "beauty",
      storeSlug: "bangla-bazar-official",
      rating: 4.8,
      reviewCount: 210,
      description: "Exquisite French floral bouquet featuring Bulgarian rose, Jasmine sambac and white musk.",
    },
    {
      name: "Organic Honey Spa Body Lotion & Skincare Kit",
      price: 2100,
      mrp: 3500,
      photo: "/flashsale/spa.jpg",
      categoryCode: "beauty",
      storeSlug: "bangla-bazar-official",
      rating: 5.0,
      reviewCount: 32,
      isFlashSale: true,
      isDailyDeal: true,
      description: "Nourishing spa essentials formulated with raw organic forest honey, shea butter and essential oils.",
    },
    {
      name: "Bleu De Chanel Luxury Eau De Parfum Pour Homme 100ml",
      price: 12500,
      mrp: 14000,
      photo: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=600&auto=format&fit=crop&q=80",
      categoryCode: "beauty",
      storeSlug: "bangla-bazar-official",
      rating: 4.9,
      reviewCount: 310,
      isHotDeal: true,
      description: "Authentic luxury French aromatic-woody fragrance with cedar, sandalwood and fresh citrus.",
    },
    {
      name: "Dior Sauvage Eau De Toilette Luxury Spray 100ml",
      price: 11800,
      mrp: 13500,
      photo: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=600&auto=format&fit=crop&q=80",
      categoryCode: "beauty",
      storeSlug: "bangla-bazar-official",
      rating: 4.9,
      reviewCount: 295,
      isHotDeal: true,
      description: "Iconic fresh raw fragrance with Calabrian bergamot and radiant Ambroxan trail.",
    },
    {
      name: "Advanced Night Repair Synchronized Serum 50ml",
      price: 4200,
      mrp: 4999,
      photo: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop&q=80",
      categoryCode: "beauty",
      storeSlug: "bangla-bazar-official",
      rating: 4.8,
      reviewCount: 180,
      description: "Deep anti-aging multi-recovery serum targeting fine lines, firmness and overnight hydration.",
    },
    {
      name: "Hydrating Hyaluronic Acid Moisture Boosting Gel Cream",
      price: 1150,
      mrp: 1450,
      photo: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80",
      categoryCode: "beauty",
      storeSlug: "bangla-bazar-official",
      rating: 4.7,
      reviewCount: 155,
      description: "Ultra-lightweight oil-free water gel instantly quenches dehydrated skin for 72 hours.",
    },

    // ==========================================
    // --- 8. HEADPHONES & AUDIO (audio) ---
    // ==========================================
    {
      name: "Sony WH-1000XM5 Wireless Noise Cancelling Headphones",
      price: 34500,
      mrp: 38900,
      photo: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
      categoryCode: "audio",
      storeSlug: "tech-vision-gadgets",
      rating: 4.9,
      reviewCount: 480,
      isHotDeal: true,
      description: "Industry-leading noise cancellation with 8 microphones, Auto NC Optimizer and 30-hour battery.",
    },
    {
      name: "Bose QuietComfort 45 Bluetooth Wireless Headphones",
      price: 28900,
      mrp: 32500,
      photo: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&auto=format&fit=crop&q=80",
      categoryCode: "audio",
      storeSlug: "tech-vision-gadgets",
      rating: 4.8,
      reviewCount: 340,
      isHotDeal: true,
      description: "Legendary quiet, lightweight plush comfort materials and proprietary acoustic technology.",
    },
    {
      name: "Sennheiser Momentum 4 Wireless Audiophile Headphones",
      price: 31000,
      mrp: 35000,
      photo: "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&auto=format&fit=crop&q=80",
      categoryCode: "audio",
      storeSlug: "tech-vision-gadgets",
      rating: 4.9,
      reviewCount: 220,
      description: "Audiophile-grade 42mm transducer system delivering incredible dynamics and up to 60-hour battery life.",
    },
    {
      name: "Beats Studio Pro Premium Wireless Over-Ear Headphones",
      price: 24900,
      mrp: 28500,
      photo: "/assets/banner/headphone.png",
      categoryCode: "audio",
      storeSlug: "tech-vision-gadgets",
      rating: 4.8,
      reviewCount: 290,
      isHotDeal: true,
      description: "Custom acoustic platform with Personalized Spatial Audio, Dynamic Head Tracking and Lossless USB-C audio.",
    },
    {
      name: "Apple AirPods Pro 2nd Gen with USB-C MagSafe Case",
      price: 24500,
      mrp: 27900,
      photo: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&auto=format&fit=crop&q=80",
      categoryCode: "audio",
      storeSlug: "tech-vision-gadgets",
      rating: 4.9,
      reviewCount: 510,
      isHotDeal: true,
      description: "Apple H2 chip, 2x more Active Noise Cancellation, Adaptive Audio and precision dust resistance.",
    },
    {
      name: "JBL Flip 6 Waterproof Portable Bluetooth Speaker",
      price: 9500,
      mrp: 11200,
      photo: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&auto=format&fit=crop&q=80",
      categoryCode: "audio",
      storeSlug: "tech-vision-gadgets",
      rating: 4.8,
      reviewCount: 390,
      description: "2-way speaker system with racetrack-shaped woofer, separate tweeter and dual pumping passive radiators.",
    },
    {
      name: "Marshall Emberton II Portable Bluetooth Speaker",
      price: 16500,
      mrp: 18900,
      photo: "https://images.unsplash.com/photo-1589003077984-894e133dabab?w=600&auto=format&fit=crop&q=80",
      categoryCode: "audio",
      storeSlug: "tech-vision-gadgets",
      rating: 4.9,
      reviewCount: 275,
      description: "Signature Marshall sound with 360 True Stereophonic multidirectional sound and 30+ hours playtime.",
    },
    {
      name: "Zeb-Duke 2 Wireless Bluetooth Headphone",
      price: 1450,
      mrp: 1799,
      photo: "/assets/banner/headphone.png",
      categoryCode: "audio",
      storeSlug: "tech-vision-gadgets",
      rating: 4.7,
      reviewCount: 380,
      isFlashSale: true,
      description: "Deep bass 40mm drivers with RGB breathing LED lights and built-in voice assistant.",
    },

    // ==========================================
    // --- 9. HOME, FURNITURE & GROCERIES ---
    // ==========================================
    {
      name: "Modern Geometric Indoor Succulent Pot",
      price: 950,
      mrp: 2000,
      photo: "/flashsale/plant.jpg",
      categoryCode: "home",
      storeSlug: "green-life-plants",
      rating: 5.0,
      reviewCount: 14,
      isFlashSale: true,
      isDailyDeal: true,
      description: "Ceramic handcrafted minimalist plant pot with natural bamboo drainage saucer tray.",
    },
    {
      name: "Scandinavian Salmon Pink Accent Lounge Chair",
      price: 12400,
      mrp: 18500,
      photo: "/flashsale/chair.jpg",
      categoryCode: "furniture",
      storeSlug: "living-style-furnishings",
      rating: 5.0,
      reviewCount: 9,
      isFlashSale: true,
      isDailyDeal: true,
      description: "Velvet upholstered ergonomic accent single sofa chair with brushed gold metal legs.",
    },
    {
      name: "Pure Organic Sundarban Raw Honey 500g",
      price: 650,
      mrp: 950,
      photo: "/deals/deals_honey.jpg",
      categoryCode: "groceries",
      storeSlug: "bangla-bazar-official",
      rating: 4.9,
      reviewCount: 110,
      isFlashSale: true,
      description: "100% pure raw unprocessed natural wild honey harvested directly from the Sundarbans mangrove forest.",
    },
    {
      name: "Ergonomic High-Back Mesh Office Chair",
      price: 8900,
      mrp: 11500,
      photo: "https://images.unsplash.com/photo-1580481077194-469b66504a74?w=600&auto=format&fit=crop&q=80",
      categoryCode: "furniture",
      storeSlug: "living-style-furnishings",
      rating: 4.8,
      reviewCount: 85,
      isDailyDeal: true,
      description: "Breathable mesh back with adjustable lumbar support, 3D armrests and smooth heavy duty nylon castors.",
    },
    {
      name: "Premium Aromatic Kalijira Rice 5kg",
      price: 780,
      mrp: 920,
      photo: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80",
      categoryCode: "groceries",
      storeSlug: "bangla-bazar-official",
      rating: 4.9,
      reviewCount: 140,
      description: "Naturally aged small grain fine aromatic rice for premium biryani, polao and festive dishes.",
    },
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
          averageRating: item.rating || 4.8,
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
          averageRating: item.rating || 4.8,
          reviewCount: item.reviewCount || 25,
          salesType: item.isFlashSale ? SalesType.Offer : SalesType.Standerd,
          featured: (item.isHotDeal || item.isFlashSale || item.isDailyDeal) ? 'true' : 'false',
        },
      });
    }
    createdProducts.push({ ...product, meta: item, assignedStoreId: storeId });
    seededCount++;
  }

  console.log(`✅ Seeded & Verified ${seededCount} realistic category-matched products in MongoDB!`);

  // 5. Update any existing products with broken or invalid photo references
  const remainingProducts = await prisma.product.findMany({
    where: {
      name: { notIn: allProductsToSeed.map((p) => p.name) },
    },
    include: { category: true },
  });

  for (const p of remainingProducts) {
    let catCode = p.category?.code || "";
    let matchingItem = allProductsToSeed.find((it) => it.categoryCode === catCode) || allProductsToSeed[0];
    let photo = p.photo;
    let needsUpdate = false;

    if (!photo || (Array.isArray(photo) && photo.length === 0)) {
      photo = [matchingItem.photo];
      needsUpdate = true;
    } else if (typeof photo === "string" && !photo.startsWith("/") && !photo.startsWith("http")) {
      photo = [matchingItem.photo];
      needsUpdate = true;
    }

    if (needsUpdate) {
      await prisma.product.update({
        where: { id: p.id },
        data: { photo },
      });
    }
  }

  // 6. Ensure Flash Sale & FlashSaleProducts
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
  const flashSaleItems = createdProducts.filter((p) => p.meta?.isFlashSale);
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
