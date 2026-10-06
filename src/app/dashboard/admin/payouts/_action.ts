"use server";
import prisma from "@/index";
import { revalidatePath } from "next/cache";

export const UpdatePayoutStatus = async (id: string, status: string, sellerId: string, amount: number) => {
  try {
    const currentPayout = await prisma.withdrawal.findUnique({ where: { id } });
    if (!currentPayout) return false;

    const update = await prisma.withdrawal.update({
      where: { id: id },
      data: { status: status as any },
    });

    // If marked as complete and it wasn't before, we should theoretically deduct from wallet balance.
    // Assuming pending means money is still in wallet, we deduct on 'Completed'.
    if (status === "Completed" && currentPayout.status !== "Completed") {
      await prisma.seller.update({
        where: { id: sellerId },
        data: {
          walletBalance: { decrement: amount }
        }
      });
    }

    // If rejected, money stays in wallet.

    if (update) {
      revalidatePath("/dashboard/admin/payouts");
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("payout update error", error);
    return false;
  }
};
