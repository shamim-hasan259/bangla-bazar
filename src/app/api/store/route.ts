export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../helpers/server-helpers";
import prisma from "@/index";

// Helper for unique slug generation
async function generateUniqueSlug(baseSlug: string): Promise<string> {
  // Clean slug: lowercase, replace spaces/special chars with hyphens
  let slug = baseSlug
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
  
  if (!slug) slug = "store";

  let count = 0;
  let uniqueSlug = slug;

  while (true) {
    const existing = await prisma.store.findUnique({
      where: { slug: uniqueSlug },
    });

    if (!existing) {
      break;
    }

    count++;
    uniqueSlug = `${slug}-${count}`;
  }

  return uniqueSlug;
}

export const GET = async (req: Request) => {
  try {
    await connectToDatabase();
    const url = new URL(req.url);
    const limit = url.searchParams.get("limit") ? parseInt(url.searchParams.get("limit")!) : 12;
    const includeProducts = url.searchParams.get("includeProducts") === "true";

    const stores = await prisma.store.findMany({
      where: {
        status: "Approved",
        deletedAt: null,
      },
      include: {
        products: includeProducts
          ? {
              where: { status: "Active" },
              take: 3,
              select: {
                id: true,
                name: true,
                photo: true,
                price: true,
                slug: true,
              },
            }
          : false,
        _count: {
          select: { products: true },
        },
      },
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(stores);
  } catch (error: any) {
    console.error("Error fetching stores:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch stores" },
      { status: 500 }
    );
  }
};

export const POST = async (req: Request) => {
  try {
    const {
      storeNameBn,
      storeNameEn,
      sellerId,
      slug,
      description,
      phone,
      email,
      address,
      uploadedStoreLogo,
      uploadedStoreBanner,
      facebook,
      instagram,
      x,
      masterCategoryId,
    } = await req.json();

    if (!storeNameEn || !storeNameBn || !sellerId || !slug || !masterCategoryId) {
      return NextResponse.json(
        { error: "Missing required store details" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check seller limits
    const seller = await prisma.seller.findUnique({
      where: { id: sellerId },
    });

    if (!seller) {
      return NextResponse.json({ error: "Seller not found" }, { status: 404 });
    }

    const currentStoreCount = await prisma.store.count({
      where: {
        sellerId: sellerId,
        deletedAt: null,
      },
    });

    const storeLimit = seller.storeLimit ?? 5;
    if (currentStoreCount >= storeLimit) {
      return NextResponse.json(
        { error: `Store limit reached. You are allowed a maximum of ${storeLimit} stores.` },
        { status: 403 }
      );
    }

    // Generate unique slug
    const finalSlug = await generateUniqueSlug(slug);

    // Create the Store along with settings and payments 1-to-1 mappings
    const response = await prisma.store.create({
      data: {
        storeNameBn,
        storeNameEn,
        storeName: storeNameEn, // compatibility fallback
        slug: finalSlug,
        sellerId,
        description,
        phone,
        email,
        address,
        storeLogo: uploadedStoreLogo,
        storeBanner: uploadedStoreBanner,
        facebook,
        instagram,
        x,
        status: "Pending",
        deletedAt: null,
        masterCategoryId,
        settings: {
          create: {},
        },
        paymentSettings: {
          create: {},
        },
      },
    });

    return NextResponse.json({ success: true, data: response }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create store" },
      { status: 500 }
    );
  }
};
