import prisma from "@/index";
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../../../helpers/server-helpers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET: Fetch all reviews for a product
export const GET = async (
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id: productIdParam } = await params;

  try {
    await connectToDatabase();

    const isHexObjectId = /^[0-9a-fA-F]{24}$/.test(productIdParam);
    let targetProductId = productIdParam;

    if (!isHexObjectId) {
      const prod = await prisma.product.findFirst({
        where: { slug: productIdParam },
        select: { id: true },
      });
      if (prod) targetProductId = prod.id;
    }

    // 1. Fetch reviews including customer details
    const reviews = await prisma.review.findMany({
      where: {
        OR: [
          { productId: targetProductId },
          ...(productIdParam !== targetProductId ? [{ productId: productIdParam }] : []),
        ],
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            photo: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // 2. Fetch sales for verified purchase check
    const customerIds = reviews.map((r) => r.customerId).filter(Boolean);
    let productSales: any[] = [];
    if (customerIds.length > 0) {
      productSales = await prisma.sales.findMany({
        where: {
          customerId: { in: customerIds },
          status: { in: ["Complete", "Delivered", "Shipped"] },
        },
        select: {
          customerId: true,
          products: true,
        },
      });
    }

    // 3. Map reviews with verified purchase status
    const reviewsWithVerifiedStatus = reviews.map((review) => {
      const hasPurchased = productSales.some((sale) => {
        if (sale.customerId !== review.customerId) return false;
        const products = (sale.products || []) as any[];
        return products.some(
          (p: any) =>
            p.id === targetProductId ||
            p.productId === targetProductId ||
            p._id === targetProductId ||
            p.id === productIdParam ||
            p.productId === productIdParam
        );
      });

      return {
        ...review,
        id: review.id?.toString() || "",
        productId: review.productId?.toString() || "",
        customerId: review.customerId?.toString() || "",
        createdAt: review.createdAt ? new Date(review.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: review.updatedAt ? new Date(review.updatedAt).toISOString() : new Date().toISOString(),
        verifiedPurchase: hasPurchased,
      };
    });

    return NextResponse.json(reviewsWithVerifiedStatus, { status: 200 });
  } catch (error) {
    console.error("Error getting product reviews:", error);
    return NextResponse.json(
      { error: "Failed to get product reviews" },
      { status: 500 }
    );
  }
};

// POST: Create or update a review for a product
export const POST = async (
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id: productIdParam } = await params;

  try {
    const session = await getServerSession(authOptions);
    const sessionUser = session?.user as any;

    if (!session || !sessionUser) {
      return NextResponse.json(
        { error: "Please log in to submit a review." },
        { status: 401 }
      );
    }

    const userRole = String(sessionUser.role || sessionUser.type || "").toLowerCase();
    if (userRole === "admin" || userRole === "manager" || userRole === "stuff") {
      return NextResponse.json(
        { error: "Admins are not permitted to write product reviews." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { rating, comment, images } = body;

    if (typeof rating !== "number" || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Please select a rating between 1 and 5 stars." },
        { status: 400 }
      );
    }

    if (!comment || comment.trim().length < 3) {
      return NextResponse.json(
        { error: "Comment must be at least 3 characters long." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // 1. Resolve Customer Record
    const lookupId = sessionUser.id || sessionUser.customerId;
    const lookupPhone = sessionUser.phone;
    const lookupEmail = sessionUser.email;
    const isObjectId = typeof lookupId === "string" && /^[0-9a-fA-F]{24}$/.test(lookupId);

    let customer = await prisma.customer.findFirst({
      where: {
        OR: [
          ...(isObjectId ? [{ id: lookupId }] : []),
          ...(lookupId ? [{ customerId: lookupId }, { id: lookupId }] : []),
          ...(lookupPhone ? [{ phone: lookupPhone }] : []),
          ...(lookupEmail ? [{ email: lookupEmail }] : []),
        ],
      },
      select: { id: true, name: true, photo: true },
    });

    if (!customer) {
      try {
        const uniqueCusId = sessionUser.customerId || Math.floor(100000 + Math.random() * 900000).toString();
        customer = await prisma.customer.create({
          data: {
            customerId: uniqueCusId,
            type: "customer",
            password: "N/A",
            name: sessionUser.name || "Customer",
            email: lookupEmail || undefined,
            phone: lookupPhone || undefined,
            photo: sessionUser.photo || sessionUser.image || null,
            status: "Active",
          },
          select: { id: true, name: true, photo: true },
        });
      } catch (e) {
        console.error("Failed to auto-create customer record:", e);
      }
    }

    if (!customer) {
      return NextResponse.json(
        { error: "Customer record not found. Please log in again." },
        { status: 404 }
      );
    }

    // 2. Resolve Product Record
    const isHexObjectId = /^[0-9a-fA-F]{24}$/.test(productIdParam);
    let product = null;

    if (isHexObjectId) {
      product = await prisma.product.findUnique({
        where: { id: productIdParam },
        select: { id: true, sellerId: true, name: true, slug: true },
      });
    }

    if (!product) {
      product = await prisma.product.findFirst({
        where: { slug: productIdParam },
        select: { id: true, sellerId: true, name: true, slug: true },
      });
    }

    if (!product) {
      return NextResponse.json(
        { error: "Product not found." },
        { status: 404 }
      );
    }

    const actualProductId = product.id;

    // 3. Check for existing review by this customer on this product
    const existingReview = await prisma.review.findFirst({
      where: {
        productId: actualProductId,
        customerId: customer.id,
      },
    });

    let savedReview;
    if (existingReview) {
      savedReview = await prisma.review.update({
        where: { id: existingReview.id },
        data: {
          rating: Math.round(rating),
          comment: comment.trim(),
          images: images || [],
          sellerId: product.sellerId || null,
          status: "Approved",
        },
        include: {
          customer: {
            select: { name: true, photo: true },
          },
          product: {
            select: { id: true, name: true, photo: true, price: true },
          },
        },
      });
    } else {
      savedReview = await prisma.review.create({
        data: {
          productId: actualProductId,
          customerId: customer.id,
          sellerId: product.sellerId || null,
          rating: Math.round(rating),
          comment: comment.trim(),
          images: images || [],
          status: "Approved",
        },
        include: {
          customer: {
            select: { name: true, photo: true },
          },
          product: {
            select: { id: true, name: true, photo: true, price: true },
          },
        },
      });
    }

    // 4. Update averageRating and reviewCount on Product
    try {
      const allReviews = await prisma.review.findMany({
        where: { productId: actualProductId, status: "Approved" },
        select: { rating: true },
      });

      if (allReviews.length > 0) {
        const avg = allReviews.reduce((acc, curr) => acc + curr.rating, 0) / allReviews.length;
        await prisma.product.update({
          where: { id: actualProductId },
          data: {
            averageRating: parseFloat(avg.toFixed(1)),
            reviewCount: allReviews.length,
          },
        });
      }
    } catch (err) {
      console.error("Error updating product rating stats:", err);
    }

    return NextResponse.json(
      {
        success: true,
        message: existingReview
          ? "Your review has been updated successfully!"
          : "Thank you! Your review has been submitted successfully.",
        review: savedReview,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { error: error.message || "Failed to submit review." },
      { status: 500 }
    );
  }
};
