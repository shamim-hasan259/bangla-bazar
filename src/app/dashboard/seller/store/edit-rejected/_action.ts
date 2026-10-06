"use server";

import prisma from "@/index";
import { revalidatePath } from "next/cache";

export async function resubmitStore(id: string, data: any) {
  try {
    const updated = await prisma.store.update({
      where: { id },
      data: {
        storeNameBn: data.storeNameBn,
        storeNameEn: data.storeNameEn,
        storeName: data.storeNameEn, // compatibility fallback
        slug: data.slug,
        description: data.description,
        phone: data.phone,
        email: data.email,
        address: data.address,
        storeLogo: data.uploadedStoreLogo || undefined,
        storeBanner: data.uploadedStoreBanner || undefined,
        facebook: data.facebook,
        instagram: data.instagram,
        x: data.x,
        masterCategoryId: data.masterCategoryId,
        status: "Pending", // Reset status back to Pending
        rejectionReason: null, // Clear rejection reason
      },
    });

    revalidatePath("/dashboard/seller/store");
    revalidatePath("/dashboard/admin/stores");
    return { success: true, data: updated };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to resubmit store" };
  }
}
