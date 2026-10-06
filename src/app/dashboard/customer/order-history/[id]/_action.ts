"use server";
import prisma from "@/index";
import { revalidatePath } from "next/cache";

export const requestOrderReturn = async (orderId: string, reason: string) => {
  try {
    const updated = await prisma.sales.update({
      where: { id: orderId },
      data: {
        status: "Return",
      }
    });
    
    if (updated) {
      revalidatePath(`/dashboard/customer/order-history/${orderId}`);
      return { success: true };
    }
    return { success: false, message: "Update failed" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Server error" };
  }
};
