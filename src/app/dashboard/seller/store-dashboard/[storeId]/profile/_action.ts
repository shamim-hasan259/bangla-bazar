"use server";

import prisma from "@/index";
import { revalidatePath } from "next/cache";

export async function updateStoreProfile(storeId: string, data: any) {
  try {
    // 1. Update Store main table
    await prisma.store.update({
      where: { id: storeId },
      data: {
        storeNameBn: data.storeNameBn,
        storeNameEn: data.storeNameEn,
        storeName: data.storeNameEn, // compatibility fallback
        description: data.description,
        phone: data.phone,
        email: data.email,
        address: data.address,
        storeLogo: data.storeLogo || undefined,
        storeBanner: data.storeBanner || undefined,
        facebook: data.facebook,
        instagram: data.instagram,
        x: data.x,
      },
    });

    // 2. Update/Upsert StoreSettings
    await prisma.storeSettings.upsert({
      where: { storeId },
      update: {
        returnPolicy: data.returnPolicy,
        shippingPolicy: data.shippingPolicy,
        warrantyPolicy: data.warrantyPolicy,
        businessHours: data.businessHours,
        vacationMode: data.vacationMode,
        vacationStart: data.vacationStart ? new Date(data.vacationStart) : null,
        vacationEnd: data.vacationEnd ? new Date(data.vacationEnd) : null,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        seoKeywords: data.seoKeywords,
      },
      create: {
        storeId,
        returnPolicy: data.returnPolicy,
        shippingPolicy: data.shippingPolicy,
        warrantyPolicy: data.warrantyPolicy,
        businessHours: data.businessHours,
        vacationMode: data.vacationMode,
        vacationStart: data.vacationStart ? new Date(data.vacationStart) : null,
        vacationEnd: data.vacationEnd ? new Date(data.vacationEnd) : null,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        seoKeywords: data.seoKeywords,
      },
    });

    // 3. Update/Upsert StorePaymentSettings
    await prisma.storePaymentSettings.upsert({
      where: { storeId },
      update: {
        bankName: data.bankName,
        bankAccountName: data.bankAccountName,
        bankAccountNumber: data.bankAccountNumber,
        routingNo: data.routingNo,
        bkashNumber: data.bkashNumber,
        nagadNumber: data.nagadNumber,
      },
      create: {
        storeId,
        bankName: data.bankName,
        bankAccountName: data.bankAccountName,
        bankAccountNumber: data.bankAccountNumber,
        routingNo: data.routingNo,
        bkashNumber: data.bkashNumber,
        nagadNumber: data.nagadNumber,
      },
    });

    revalidatePath(`/dashboard/seller/store-dashboard/${storeId}/profile`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update store settings" };
  }
}
