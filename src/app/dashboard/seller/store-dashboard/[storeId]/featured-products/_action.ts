"use server";

import prisma from "@/index";
import { revalidatePath } from "next/cache";

export async function toggleFeaturedProduct(storeId: string, productId: string) {
  try {
    const existing = await prisma.storeFeaturedProduct.findUnique({
      where: {
        storeId_productId: {
          storeId,
          productId,
        },
      },
    });

    if (existing) {
      // Remove from featured
      await prisma.storeFeaturedProduct.delete({
        where: {
          id: existing.id,
        },
      });

      revalidatePath(`/dashboard/seller/store-dashboard/${storeId}/featured-products`);
      return { success: true, featured: false };
    } else {
      // Check 20-item maximum limit
      const count = await prisma.storeFeaturedProduct.count({
        where: {
          storeId,
        },
      });

      if (count >= 20) {
        return {
          success: false,
          error: "You can highlight a maximum of 20 featured products on your store landing tab.",
        };
      }

      // Add to featured
      await prisma.storeFeaturedProduct.create({
        data: {
          storeId,
          productId,
        },
      });

      revalidatePath(`/dashboard/seller/store-dashboard/${storeId}/featured-products`);
      return { success: true, featured: true };
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to update featured collection",
    };
  }
}
