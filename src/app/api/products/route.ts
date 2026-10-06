export const dynamic = "force-dynamic";
import prisma from "@/index";
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../helpers/server-helpers";

export const GET = async (req: Request) => {
  try {
    await connectToDatabase();

    const url = new URL(req.url);
    const query = url.searchParams.get("query") || "";
    const categoryParam = url.searchParams.get("categoryId") || url.searchParams.get("category") || "";
    const section = url.searchParams.get("section") || "";
    const featured = url.searchParams.get("featured");
    const limit = url.searchParams.get("limit") ? parseInt(url.searchParams.get("limit")!) : undefined;
    const skip = url.searchParams.get("skip") ? parseInt(url.searchParams.get("skip")!) : undefined;
    const storeSlug = url.searchParams.get("storeSlug") || "";

    const whereConditions: any = {
      status: "Active",
    };

    if (query) {
      whereConditions.name = { contains: query, mode: "insensitive" };
    }

    if (featured === "true") {
      whereConditions.featured = "true";
    }

    if (storeSlug) {
      const store = await prisma.store.findUnique({
        where: { slug: storeSlug },
        select: { id: true },
      });
      if (store) {
        whereConditions.storeId = store.id;
      }
    }

    // Handle Category Filter (by ObjectId OR by code / name)
    if (categoryParam) {
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(categoryParam);
      let targetCatId: string | null = null;

      if (isObjectId) {
        targetCatId = categoryParam;
      } else {
        const cat = await prisma.category.findFirst({
          where: {
            OR: [
              { code: { equals: categoryParam, mode: "insensitive" } },
              { name: { contains: categoryParam, mode: "insensitive" } },
            ],
          },
          select: { id: true },
        });
        if (cat) {
          targetCatId = cat.id;
        } else {
          whereConditions.name = { contains: categoryParam, mode: "insensitive" };
        }
      }

      if (targetCatId) {
        // Also fetch all subcategory IDs under this category
        const subCategories = await prisma.category.findMany({
          where: { parentId: targetCatId },
          select: { id: true },
        });
        const allCategoryIds = [targetCatId, ...subCategories.map((sc) => sc.id)];

        whereConditions.OR = [
          { categoryId: { in: allCategoryIds } },
          { masterCategoryId: { in: allCategoryIds } },
        ];
      }
    }

    // Section Specific Filters
    if (section === "flash-sale") {
      const flashSaleProducts = await prisma.flashSaleProduct.findMany({
        where: { status: "Approved" },
        include: {
          product: {
            include: {
              category: true,
              store: true,
            },
          },
        },
        take: limit || 20,
      });

      if (flashSaleProducts.length > 0) {
        const mapped = flashSaleProducts
          .filter((fsp) => fsp.product && fsp.product.status === "Active")
          .map((fsp) => ({
            ...fsp.product,
            flashSaleStock: fsp.flashSaleStock,
            discountPercentage: fsp.discountPercentage,
            purchaseLimit: fsp.purchaseLimit,
          }));
        return NextResponse.json(mapped);
      }

      // Fallback to offer products if no flash sale product relation
      whereConditions.salesType = "Offer";
    }

    if (section === "hot-deal" || section === "daily-deals") {
      whereConditions.OR = [
        { featured: "true" },
        { salesType: "Offer" },
        { averageRating: { gte: 4.5 } },
      ];
    }

    const products = await prisma.product.findMany({
      where: whereConditions,
      include: {
        category: true,
        store: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      skip: skip,
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
};
