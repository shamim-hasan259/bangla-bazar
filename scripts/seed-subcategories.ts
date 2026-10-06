import prisma from "../prisma/index.ts";

async function seedSubs() {
  const subsToAdd = [
    { parentName: "Electronics & Gadgets", subs: ["Smartphones & Tablets", "Smart Home & IoT", "Camera & Photo"] },
    { parentName: "Fashion & Apparel", subs: ["Men's T-Shirts & Polos", "Men's Pants & Trousers", "Women's Ethnic Wear", "Casual Shirts"] },
    { parentName: "Beauty & Skincare", subs: ["Luxury Perfumes & Fragrance", "Facial Care & Serums", "Hair Care & Styling"] },
    { parentName: "Watches & Jewelry", subs: ["Smartwatches", "Luxury Chronographs", "Fine Jewelry & Rings"] },
    { parentName: "Laptops & Tech", subs: ["Gaming Laptops", "Business Ultrabooks", "PC Accessories & Keyboards"] },
    { parentName: "Headphones & Audio", subs: ["True Wireless Earbuds", "Noise Cancelling Headphones", "Bluetooth Speakers"] },
    { parentName: "Home & Living", subs: ["Furniture & Decor", "Kitchenware & Dining", "Bedding & Bath"] },
    { parentName: "Groceries", subs: ["Organic Spices & Oils", "Tea, Coffee & Beverages", "Snacks & Packaged Food"] },
    { parentName: "Footwear", subs: ["Sneakers & Running Shoes", "Formal Leather Shoes", "Casual Loafers & Sandals"] },
  ];

  for (const group of subsToAdd) {
    const parent = await prisma.category.findFirst({ where: { name: group.parentName } });
    if (!parent) continue;
    for (const subName of group.subs) {
      const existing = await prisma.category.findFirst({ where: { name: subName } });
      if (!existing) {
        const code = subName.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "_" + Math.random().toString(36).substring(2, 6);
        await prisma.category.create({
          data: {
            name: subName,
            code,
            parentId: parent.id,
            status: "Active",
            description: `${subName} under ${parent.name}`,
          },
        });
        console.log("Created subcategory:", subName, "under", parent.name);
      } else if (existing.parentId !== parent.id) {
        await prisma.category.update({
          where: { id: existing.id },
          data: { parentId: parent.id },
        });
        console.log("Linked subcategory:", subName, "to parent:", parent.name);
      }
    }
  }

  // Also link products to subcategories if they only have masterCategoryId
  const subCats = await prisma.category.findMany({ where: { parentId: { not: null } } });
  for (const sc of subCats) {
    const prods = await prisma.product.findMany({ where: { categoryId: null, masterCategoryId: sc.parentId }, take: 2 });
    for (const p of prods) {
      await prisma.product.update({
        where: { id: p.id },
        data: { categoryId: sc.id },
      });
      console.log(`Linked product "${p.name}" to subcategory "${sc.name}"`);
    }
  }

  console.log("Seeding subcategories complete!");
}

seedSubs()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    process.exit(0);
  });
