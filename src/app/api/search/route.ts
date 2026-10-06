export const dynamic = "force-dynamic";

import prisma from "@/index";
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../helpers/server-helpers";

// Default trending search tags for e-commerce
const POPULAR_SEARCH_TAGS = [
  "Smartphones",
  "T-Shirts",
  "Wireless Earbuds",
  "Gaming Laptops",
  "Smart Watches",
  "Men's Jeans",
  "Luxury Perfume",
  "Skincare & Serums",
];

export const GET = async (req: Request) => {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim();
    const scope = searchParams.get("scope") || "all"; // 'all' | 'products' | 'stores'
    const categoryId = searchParams.get("category");

    // Zero-query return: trending suggestions
    if (!q) {
      return NextResponse.json({
        products: [],
        categories: [],
        stores: [],
        trending: POPULAR_SEARCH_TAGS,
      });
    }

    const promises: Promise<any>[] = [];

    // 1. Fetch matching Products (unless scope is strictly stores)
    if (scope !== "stores") {
      const productWhere: any = {
        status: "Active",
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
          { model: { contains: q, mode: "insensitive" } },
          { brand: { is: { name: { contains: q, mode: "insensitive" } } } },
          { category: { is: { name: { contains: q, mode: "insensitive" } } } },
        ],
      };

      if (categoryId) {
        productWhere.categoryId = categoryId;
      }

      promises.push(
        prisma.product.findMany({
          where: productWhere,
          select: {
            id: true,
            name: true,
            price: true,
            photo: true,
            mrp: true,
            brand: { select: { name: true } },
            category: { select: { id: true, name: true } },
            store: { select: { id: true, storeNameEn: true, slug: true } },
          },
          take: 6,
          orderBy: { createdAt: "desc" },
        })
      );
    } else {
      promises.push(Promise.resolve([]));
    }

    // 2. Fetch matching Categories
    if (scope !== "stores") {
      promises.push(
        prisma.category.findMany({
          where: {
            status: "Active",
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { code: { contains: q, mode: "insensitive" } },
            ],
          },
          select: {
            id: true,
            name: true,
            code: true,
            photo: true,
            _count: { select: { products: true } },
          },
          take: 4,
          orderBy: { name: "asc" },
        })
      );
    } else {
      promises.push(Promise.resolve([]));
    }

    // 3. Fetch matching Stores / Suppliers
    if (scope !== "products") {
      promises.push(
        prisma.store.findMany({
          where: {
            OR: [
              { storeNameEn: { contains: q, mode: "insensitive" } },
              { storeNameBn: { contains: q, mode: "insensitive" } },
              { slug: { contains: q, mode: "insensitive" } },
            ],
          },
          select: {
            id: true,
            storeNameEn: true,
            slug: true,
            storeLogo: true,
            description: true,
            _count: { select: { products: true } },
          },
          take: 3,
        })
      );
    } else {
      promises.push(Promise.resolve([]));
    }

    const [products, categories, stores] = await Promise.all(promises);

    return NextResponse.json({
      query: q,
      products,
      categories,
      stores,
      trending: POPULAR_SEARCH_TAGS,
    });
  } catch (error: any) {
    console.error("Search API Error:", error);
    return NextResponse.json(
      { error: "Failed to execute search", details: error?.message },
      { status: 500 }
    );
  }
};
