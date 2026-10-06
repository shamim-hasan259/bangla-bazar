"use server";
import prisma from "@/index";
import { revalidatePath } from "next/cache";

export const requestWithdrawal = async (sellerId: string, amount: number, paymentMethod: string, accountDetails: string) => {
  try {
    const seller = await prisma.seller.findUnique({ where: { id: sellerId } });
    if (!seller || seller.walletBalance < amount) {
      return { success: false, message: "Insufficient balance." };
    }

    const withdrawal = await prisma.withdrawal.create({
      data: {
        sellerId,
        amount,
        paymentMethod,
        accountDetails,
        status: "Pending",
      }
    });

    if (withdrawal) {
      revalidatePath("/dashboard/seller/wallet");
      return { success: true, message: "Withdrawal requested successfully." };
    }
  } catch (error) {
    console.error(error);
    return { success: false, message: "Server error." };
  }
};
