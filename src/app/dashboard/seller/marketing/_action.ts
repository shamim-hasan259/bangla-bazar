"use server";

import prisma from "@/index";
import { revalidatePath } from "next/cache";

// ============================================
// Campaign Actions
// ============================================

export async function getAvailableCampaigns() {
  try {
    return await prisma.campaign.findMany({
      where: {
        endDate: { gte: new Date() }
      },
      orderBy: { startDate: "asc" }
    });
  } catch (error) {
    console.error("Error getting campaigns:", error);
    return [];
  }
}

export async function getSellerStores(sellerId: string) {
  try {
    const isObjectId = (val?: string | null) => typeof val === "string" && /^[0-9a-fA-F]{24}$/.test(val);

    let validSellerId = sellerId;
    if (!isObjectId(validSellerId)) {
      const seller = await prisma.seller.findFirst({
        where: {
          OR: [
            { sellerId: sellerId },
            ...(isObjectId(sellerId) ? [{ id: sellerId }] : []),
          ],
        },
        select: { id: true },
      });
      if (seller?.id) {
        validSellerId = seller.id;
      }
    }

    const validIds = [validSellerId, sellerId].filter((id) => isObjectId(id));

    return await prisma.store.findMany({
      where: {
        ...(validIds.length > 0 ? { sellerId: { in: validIds } } : { sellerId }),
        deletedAt: null
      }
    });
  } catch (error) {
    console.error("Error getting seller stores:", error);
    return [];
  }
}

export async function getSellerProducts(sellerId: string, storeId?: string) {
  try {
    return await prisma.product.findMany({
      where: {
        sellerId: storeId ? undefined : sellerId,
        storeId: storeId || undefined,
        status: "Active"
      },
      select: {
        id: true,
        name: true,
        price: true,
        categoryId: true,
        masterCategoryId: true
      }
    });
  } catch (error) {
    console.error("Error getting products:", error);
    return [];
  }
}

export async function submitCampaignProduct(data: {
  campaignId: string;
  productId: string;
  storeId?: string;
  sellerId: string;
  discountPercentage: number;
}) {
  try {
    // 1. Fetch campaign
    const campaign = await prisma.campaign.findUnique({
      where: { id: data.campaignId }
    });

    if (!campaign) {
      return { success: false, error: "Campaign not found" };
    }

    // 2. Date check
    if (new Date(campaign.endDate) < new Date()) {
      return { success: false, error: "Campaign has already ended" };
    }

    // 3. Minimum discount validation (Mandatory rule check)
    if (Number(data.discountPercentage) < campaign.minDiscountPercentage) {
      return {
        success: false,
        error: `Discount must be at least ${campaign.minDiscountPercentage}%`
      };
    }

    // 4. Product details and category check
    const product = await prisma.product.findUnique({
      where: { id: data.productId }
    });

    if (!product) {
      return { success: false, error: "Product not found" };
    }

    // Verify category eligibility if campaign restricts categories
    if (campaign.eligibleCategoryIds && campaign.eligibleCategoryIds.length > 0) {
      const isEligible =
        (product.categoryId && campaign.eligibleCategoryIds.includes(product.categoryId)) ||
        (product.masterCategoryId && campaign.eligibleCategoryIds.includes(product.masterCategoryId));

      if (!isEligible) {
        return { success: false, error: "Product category is not eligible for this campaign" };
      }
    }

    // 5. Campaign product limit check
    const enrolledProductsCount = await prisma.campaignProduct.count({
      where: { campaignId: data.campaignId }
    });

    if (enrolledProductsCount >= campaign.maxProductLimit) {
      return { success: false, error: "This campaign has reached its product enrollment limit" };
    }

    // 6. Conflicting campaign check (cannot join overlap timelines)
    const existingEnrollments = await prisma.campaignProduct.findMany({
      where: {
        productId: data.productId,
        status: "Approved",
        campaignId: { not: data.campaignId }
      },
      include: { campaign: true }
    });

    for (const enrollment of existingEnrollments) {
      const isOverlapping =
        new Date(campaign.startDate) <= new Date(enrollment.campaign.endDate) &&
        new Date(campaign.endDate) >= new Date(enrollment.campaign.startDate);

      if (isOverlapping) {
        return {
          success: false,
          error: `Product is already enrolled in overlapping campaign: ${enrollment.campaign.name}`
        };
      }
    }

    // 7. Enrolling product
    const campaignProduct = await prisma.campaignProduct.create({
      data: {
        campaignId: data.campaignId,
        productId: data.productId,
        storeId: data.storeId || null,
        sellerId: data.sellerId,
        discountPercentage: Number(data.discountPercentage),
        status: "Pending" // Awaiting Admin approval
      }
    });

    revalidatePath("/dashboard/seller/marketing/campaigns");
    return { success: true, campaignProduct };
  } catch (error: any) {
    console.error("Enrollment error:", error);
    if (error.code === "P2002") {
      return { success: false, error: "Product is already submitted for this campaign" };
    }
    return { success: false, error: error.message };
  }
}

// ============================================
// Flash Sale Actions
// ============================================

export async function getAvailableFlashSales() {
  try {
    return await prisma.flashSale.findMany({
      where: {
        endDate: { gte: new Date() }
      },
      orderBy: { startDate: "asc" }
    });
  } catch (error) {
    console.error("Error getting flash sales:", error);
    return [];
  }
}

export async function submitFlashSaleProduct(data: {
  flashSaleId: string;
  productId: string;
  storeId?: string;
  sellerId: string;
  discountPercentage: number;
  flashSaleStock: number;
  purchaseLimit: number;
}) {
  try {
    // 1. Fetch Flash Sale
    const fs = await prisma.flashSale.findUnique({
      where: { id: data.flashSaleId }
    });

    if (!fs) {
      return { success: false, error: "Flash sale slot not found" };
    }

    // 2. Minimum discount validation
    if (Number(data.discountPercentage) < fs.minDiscountPercentage) {
      return {
        success: false,
        error: `Discount must be at least ${fs.minDiscountPercentage}%`
      };
    }

    // 3. Product stock check
    const product = await prisma.product.findUnique({
      where: { id: data.productId }
    });

    if (!product) {
      return { success: false, error: "Product not found" };
    }

    if (product.stock < Number(data.flashSaleStock)) {
      return {
        success: false,
        error: `Insufficient product inventory. Available stock: ${product.stock}`
      };
    }

    // 4. Overlapping active flash sales check
    const activeFlashEnrollments = await prisma.flashSaleProduct.findMany({
      where: {
        productId: data.productId,
        flashSaleId: { not: data.flashSaleId }
      },
      include: { flashSale: true }
    });

    for (const enrollment of activeFlashEnrollments) {
      const isOverlapping =
        new Date(fs.startDate) <= new Date(enrollment.flashSale.endDate) &&
        new Date(fs.endDate) >= new Date(enrollment.flashSale.startDate);

      if (isOverlapping) {
        return {
          success: false,
          error: `Product is already enrolled in overlapping flash sale: ${enrollment.flashSale.name}`
        };
      }
    }

    // 5. Enroll in flash sale
    const isObjectId = (val?: string | null) => typeof val === "string" && /^[0-9a-fA-F]{24}$/.test(val);

    const validStoreId = data.storeId && isObjectId(data.storeId) ? data.storeId : null;

    let validSellerId: string | null = data.sellerId;
    if (!isObjectId(validSellerId)) {
      const seller = await prisma.seller.findFirst({
        where: {
          OR: [
            { sellerId: data.sellerId },
            ...(isObjectId(data.sellerId) ? [{ id: data.sellerId }] : []),
          ],
        },
        select: { id: true },
      });
      validSellerId = seller?.id || null;
    }

    const flashProduct = await prisma.flashSaleProduct.create({
      data: {
        flashSaleId: data.flashSaleId,
        productId: data.productId,
        storeId: validStoreId,
        sellerId: validSellerId,
        discountPercentage: Number(data.discountPercentage),
        flashSaleStock: Number(data.flashSaleStock),
        purchaseLimit: Number(data.purchaseLimit),
        status: "Approved", // Flash sale submissions are auto-approved by default
      },
    });

    revalidatePath("/dashboard/seller/marketing/flash-sales");
    return { success: true, flashProduct };
  } catch (error: any) {
    console.error("Flash sale enrollment error:", error);
    if (error.code === "P2002") {
      return { success: false, error: "Product is already submitted for this flash sale" };
    }
    return { success: false, error: error.message };
  }
}

// ============================================
// Voucher Actions
// ============================================

export async function createVoucher(data: {
  name: string;
  code: string;
  discountType: string;
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount?: number;
  startDate: string;
  endDate: string;
  usageLimit: number;
  perCustomerLimit: number;
  applicableProductIds: string[];
  applicableCategoryIds: string[];
  storeId?: string;
  sellerId: string;
}) {
  try {
    const isObjectId = (val?: string | null) => typeof val === "string" && /^[0-9a-fA-F]{24}$/.test(val);

    // Sanitize storeId: if it's "all-stores", empty string, or not a valid 24-char ObjectId, pass null
    const validStoreId = data.storeId && isObjectId(data.storeId) ? data.storeId : null;

    // Sanitize sellerId
    let validSellerId: string | null = data.sellerId;
    if (!isObjectId(validSellerId)) {
      const seller = await prisma.seller.findFirst({
        where: {
          OR: [
            { sellerId: data.sellerId },
            ...(isObjectId(data.sellerId) ? [{ id: data.sellerId }] : []),
          ],
        },
        select: { id: true },
      });
      validSellerId = seller?.id || null;
    }

    // Sanitize ObjectId arrays
    const validProductIds = (data.applicableProductIds || []).filter((id) => isObjectId(id));
    const validCategoryIds = (data.applicableCategoryIds || []).filter((id) => isObjectId(id));

    const voucher = await prisma.storeVoucher.create({
      data: {
        name: data.name,
        code: data.code.toUpperCase().trim(),
        discountType: data.discountType,
        discountValue: Number(data.discountValue),
        minOrderAmount: Number(data.minOrderAmount),
        maxDiscountAmount: data.maxDiscountAmount ? Number(data.maxDiscountAmount) : null,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        usageLimit: Number(data.usageLimit),
        perCustomerLimit: Number(data.perCustomerLimit),
        applicableProductIds: validProductIds,
        applicableCategoryIds: validCategoryIds,
        storeId: validStoreId,
        sellerId: validSellerId,
      },
    });

    revalidatePath("/dashboard/seller/marketing/vouchers");
    return { success: true, voucher };
  } catch (error: any) {
    console.error("Voucher creation error:", error);
    if (error.code === "P2002") {
      return { success: false, error: "Voucher code already exists" };
    }
    return { success: false, error: error.message };
  }
}

export async function getVouchers(sellerId: string) {
  try {
    const isObjectId = (val?: string | null) => typeof val === "string" && /^[0-9a-fA-F]{24}$/.test(val);

    let validSellerId = sellerId;
    if (!isObjectId(validSellerId)) {
      const seller = await prisma.seller.findFirst({
        where: {
          OR: [
            { sellerId: sellerId },
            ...(isObjectId(sellerId) ? [{ id: sellerId }] : []),
          ],
        },
        select: { id: true },
      });
      if (seller?.id) {
        validSellerId = seller.id;
      }
    }

    const validIds = [validSellerId, sellerId].filter((id) => isObjectId(id));

    return await prisma.storeVoucher.findMany({
      where: {
        ...(validIds.length > 0 ? { sellerId: { in: validIds } } : { sellerId }),
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Error getting vouchers:", error);
    return [];
  }
}

export async function deleteVoucher(id: string) {
  try {
    await prisma.storeVoucher.delete({ where: { id } });
    revalidatePath("/dashboard/seller/marketing/vouchers");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ============================================
// Product Bundle Actions
// ============================================

export async function createProductBundle(data: {
  name: string;
  description?: string;
  discountValue: number;
  productIds: string[];
  storeId?: string;
  sellerId: string;
}) {
  try {
    if (data.productIds.length < 2) {
      return { success: false, error: "A bundle must contain at least 2 products" };
    }

    const isObjectId = (val?: string | null) => typeof val === "string" && /^[0-9a-fA-F]{24}$/.test(val);

    let validSellerId = data.sellerId;
    if (!isObjectId(validSellerId)) {
      const seller = await prisma.seller.findFirst({
        where: {
          OR: [
            { sellerId: data.sellerId },
            ...(isObjectId(data.sellerId) ? [{ id: data.sellerId }] : []),
          ],
        },
        select: { id: true },
      });
      if (seller?.id) {
        validSellerId = seller.id;
      }
    }

    const validStoreId = data.storeId && isObjectId(data.storeId) ? data.storeId : null;

    const bundle = await prisma.productBundle.create({
      data: {
        name: data.name,
        description: data.description || null,
        discountValue: Number(data.discountValue),
        productIds: data.productIds,
        storeId: validStoreId,
        sellerId: validSellerId,
        status: "Active"
      }
    });

    revalidatePath("/dashboard/seller/marketing/bundles");
    return { success: true, bundle };
  } catch (error: any) {
    console.error("Bundle creation error:", error);
    return { success: false, error: error.message };
  }
}

export async function getBundles(sellerId: string) {
  try {
    return await prisma.productBundle.findMany({
      where: { sellerId },
      orderBy: { createdAt: "desc" }
    });
  } catch (error) {
    console.error("Error getting bundles:", error);
    return [];
  }
}

export async function deleteBundle(id: string) {
  try {
    await prisma.productBundle.delete({ where: { id } });
    revalidatePath("/dashboard/seller/marketing/bundles");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function collectVoucher(voucherId: string, customerId: string) {
  try {
    // 1. Fetch voucher
    const voucher = await prisma.storeVoucher.findUnique({
      where: { id: voucherId }
    });

    if (!voucher) {
      return { success: false, error: "Voucher not found" };
    }

    // 2. Expiry check
    if (new Date(voucher.endDate) < new Date()) {
      return { success: false, error: "Voucher has expired" };
    }

    // 3. Usage limit check
    if (voucher.collectedCount >= voucher.usageLimit) {
      return { success: false, error: "Voucher has reached its collection limit" };
    }

    // 4. Per customer limit check
    const existingCollect = await prisma.customerVoucher.findUnique({
      where: {
        customerId_voucherId: {
          customerId,
          voucherId
        }
      }
    });

    if (existingCollect) {
      return { success: false, error: "You have already collected this voucher" };
    }

    // 5. Create customer voucher link and increment counts
    await prisma.customerVoucher.create({
      data: {
        customerId,
        voucherId,
        status: "Collected"
      }
    });

    await prisma.storeVoucher.update({
      where: { id: voucherId },
      data: {
        collectedCount: { increment: 1 }
      }
    });

    return { success: true };
  } catch (error: any) {
    console.error("Voucher collect error:", error);
    return { success: false, error: error.message };
  }
}
