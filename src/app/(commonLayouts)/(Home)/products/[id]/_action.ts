"use server";
import prisma from "@/index";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const submitReview = async (
  productId: string,
  rating: number,
  comment: string,
  images?: string[]
) => {
  try {
    const session = await getServerSession(authOptions);
    const sessionUser = session?.user as any;

    if (!session || !sessionUser) {
      return { success: false, message: "Please login to write a review." };
    }

    const userRole = String(sessionUser.role || sessionUser.type || "").toLowerCase();
    if (userRole === "admin" || userRole === "manager" || userRole === "stuff") {
      return { success: false, message: "Admins are not permitted to submit product reviews." };
    }

    if (!productId) {
      return { success: false, message: "Product ID is required." };
    }

    if (!rating || rating < 1 || rating > 5) {
      return { success: false, message: "Please select a rating between 1 and 5 stars." };
    }

    if (!comment || comment.trim().length < 3) {
      return { success: false, message: "Please write a comment (minimum 3 characters)." };
    }

    // Look up customer in DB
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
      select: { id: true, name: true },
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
          select: { id: true, name: true },
        });
      } catch (e) {
        console.error("Auto customer create error:", e);
      }
    }

    if (!customer) {
      return { success: false, message: "Customer account not found." };
    }

    // Fetch product to verify and get sellerId (check by ID or slug)
    const isHexObjectId = /^[0-9a-fA-F]{24}$/.test(productId);
    let product = null;

    if (isHexObjectId) {
      product = await prisma.product.findUnique({
        where: { id: productId },
        select: { id: true, sellerId: true, name: true, slug: true },
      });
    }

    if (!product) {
      product = await prisma.product.findFirst({
        where: { slug: productId },
        select: { id: true, sellerId: true, name: true, slug: true },
      });
    }

    if (!product) {
      return { success: false, message: "Product not found." };
    }

    const actualProductId = product.id;

    // Check if customer already submitted review for this product
    const existingReview = await prisma.review.findFirst({
      where: {
        productId: actualProductId,
        customerId: customer.id,
      },
    });

    let review;
    if (existingReview) {
      // Update existing review
      review = await prisma.review.update({
        where: { id: existingReview.id },
        data: {
          rating: Math.round(rating),
          comment: comment.trim(),
          images: images || [],
          sellerId: product.sellerId || null,
          status: "Approved",
        },
      });
    } else {
      // Create new review
      review = await prisma.review.create({
        data: {
          productId: actualProductId,
          customerId: customer.id,
          sellerId: product.sellerId || null,
          rating: Math.round(rating),
          comment: comment.trim(),
          images: images || [],
          status: "Approved",
        },
      });
    }

    // Update product average rating
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
      console.error("Failed to update product rating stats:", err);
    }

    revalidatePath(`/products/${productId}`);
    if (product.slug && product.slug !== productId) {
      revalidatePath(`/products/${product.slug}`);
    }
    revalidatePath(`/dashboard/customer/reviews`);
    if (product.sellerId) {
      revalidatePath(`/dashboard/seller/reviews`);
    }

    return {
      success: true,
      message: existingReview
        ? "Your review has been updated successfully!"
        : "Thank you! Your review has been submitted successfully.",
      review,
    };
  } catch (error: any) {
    console.error("Submit review error:", error);
    return { success: false, message: error.message || "Failed to submit review." };
  }
};

export const deleteCustomerReview = async (reviewId: string) => {
  try {
    const session = await getServerSession(authOptions);
    const sessionUser = session?.user as any;
    if (!sessionUser) return { success: false, message: "Unauthorized" };

    const lookupId = sessionUser.id || sessionUser.customerId;
    const lookupPhone = sessionUser.phone;
    const isObjectId = typeof lookupId === "string" && /^[0-9a-fA-F]{24}$/.test(lookupId);

    const customer = await prisma.customer.findFirst({
      where: {
        OR: [
          ...(isObjectId ? [{ id: lookupId }] : []),
          ...(lookupId ? [{ customerId: lookupId }, { id: lookupId }] : []),
          ...(lookupPhone ? [{ phone: lookupPhone }] : []),
        ],
      },
      select: { id: true },
    });

    if (!customer) return { success: false, message: "Customer not found" };

    const review = await prisma.review.findFirst({
      where: { id: reviewId, customerId: customer.id },
    });

    if (!review) return { success: false, message: "Review not found" };

    await prisma.review.delete({ where: { id: reviewId } });

    // Recalculate product rating
    const allReviews = await prisma.review.findMany({
      where: { productId: review.productId, status: "Approved" },
      select: { rating: true },
    });

    const avg = allReviews.length > 0
      ? allReviews.reduce((acc, curr) => acc + curr.rating, 0) / allReviews.length
      : 0;

    await prisma.product.update({
      where: { id: review.productId },
      data: {
        averageRating: parseFloat(avg.toFixed(1)),
        reviewCount: allReviews.length,
      },
    });

    revalidatePath(`/products/${review.productId}`);
    revalidatePath(`/dashboard/customer/reviews`);
    return { success: true, message: "Review deleted successfully" };
  } catch (err: any) {
    return { success: false, message: err.message || "Failed to delete review" };
  }
};

export const submitReviewFeedback = async (reviewId: string) => {
  try {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        product: { select: { name: true } },
      },
    });

    if (!review) {
      return { success: false, message: "Review not found" };
    }

    // Create a notification for the customer who wrote the review
    await prisma.notification.create({
      data: {
        userId: review.customerId,
        userType: "Customer",
        title: "Feedback on your review",
        message: `Someone found your review on "${review.product.name}" helpful!`,
        link: `/products/${review.productId}`,
        type: "ReviewFeedback",
        isRead: false,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error submitting review feedback:", error);
    return { success: false, message: "Server error" };
  }
};
