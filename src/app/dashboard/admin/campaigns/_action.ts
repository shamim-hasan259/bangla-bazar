"use server";

import prisma from "@/index";
import { revalidatePath } from "next/cache";

// ============================================
// Campaign Actions
// ============================================

export async function createCampaign(data: {
  name: string;
  banner: string;
  description: string;
  startDate: string;
  endDate: string;
  eligibleCategoryIds: string[];
  maxProductLimit: number;
  minDiscountPercentage: number;
}) {
  try {
    const campaign = await prisma.campaign.create({
      data: {
        name: data.name,
        banner: data.banner,
        description: data.description,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        eligibleCategoryIds: data.eligibleCategoryIds,
        maxProductLimit: Number(data.maxProductLimit),
        minDiscountPercentage: Number(data.minDiscountPercentage),
        status: "Upcoming",
      },
    });

    revalidatePath("/dashboard/admin/campaigns");
    return { success: true, campaign };
  } catch (error: any) {
    console.error("Error creating campaign:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteCampaign(id: string) {
  try {
    await prisma.campaign.delete({ where: { id } });
    revalidatePath("/dashboard/admin/campaigns");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getCampaigns() {
  try {
    return await prisma.campaign.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        products: {
          include: {
            product: {
              select: { name: true, price: true },
            },
          },
        },
      },
    });
  } catch (error) {
    console.error("Error getting campaigns:", error);
    return [];
  }
}

export async function updateCampaignProductStatus(id: string, status: string) {
  try {
    await prisma.campaignProduct.update({
      where: { id },
      data: { status },
    });
    revalidatePath("/dashboard/admin/campaigns");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ============================================
// Flash Sale Actions
// ============================================

export async function createFlashSale(data: {
  name: string;
  banner: string;
  startDate: string;
  endDate: string;
  productLimit: number;
  minDiscountPercentage: number;
}) {
  try {
    const flashSale = await prisma.flashSale.create({
      data: {
        name: data.name,
        banner: data.banner,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        productLimit: Number(data.productLimit),
        minDiscountPercentage: Number(data.minDiscountPercentage),
      },
    });

    revalidatePath("/dashboard/admin/flash-sales");
    return { success: true, flashSale };
  } catch (error: any) {
    console.error("Error creating flash sale:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteFlashSale(id: string) {
  try {
    await prisma.flashSale.delete({ where: { id } });
    revalidatePath("/dashboard/admin/flash-sales");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getFlashSales() {
  try {
    return await prisma.flashSale.findMany({
      orderBy: { startDate: "desc" },
      include: {
        products: {
          include: {
            product: {
              select: { name: true, price: true },
            },
          },
        },
      },
    });
  } catch (error) {
    console.error("Error getting flash sales:", error);
    return [];
  }
}

export async function updateFlashSaleProductStatus(id: string, status: string) {
  try {
    await prisma.flashSaleProduct.update({
      where: { id },
      data: { status },
    });
    revalidatePath("/dashboard/admin/flash-sales");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
