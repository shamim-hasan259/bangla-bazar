"use server";

import prisma from "@/index";
import { revalidatePath } from "next/cache";

export async function approveStore(id: string) {
  try {
    const updated = await prisma.store.update({
      where: { id },
      data: {
        status: "Approved",
        rejectionReason: null,
      },
    });

    revalidatePath("/dashboard/admin/stores");
    revalidatePath("/dashboard/seller/store");
    return { success: true, data: updated };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to approve store" };
  }
}

export async function rejectStore(id: string, reason: string) {
  try {
    const updated = await prisma.store.update({
      where: { id },
      data: {
        status: "Rejected",
        rejectionReason: reason,
      },
    });

    revalidatePath("/dashboard/admin/stores");
    revalidatePath("/dashboard/seller/store");
    return { success: true, data: updated };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to reject store" };
  }
}

export async function suspendStore(id: string) {
  try {
    const updated = await prisma.store.update({
      where: { id },
      data: {
        status: "Suspended",
      },
    });

    revalidatePath("/dashboard/admin/stores");
    revalidatePath("/dashboard/seller/store");
    return { success: true, data: updated };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to suspend store" };
  }
}
