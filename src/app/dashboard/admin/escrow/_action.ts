"use server";

import prisma from "@/index";
import { revalidatePath } from "next/cache";

/**
 * Release 60% held escrow funds for a single escrow record to seller's wallet balance
 */
export async function releaseSingleEscrow(escrowId: string) {
  try {
    const escrow = await prisma.escrowHolding.findUnique({
      where: { id: escrowId },
      include: { seller: true },
    });

    if (!escrow) {
      return { success: false, message: "Escrow record not found." };
    }

    if (escrow.released60 || escrow.status === "Released") {
      return { success: false, message: "Escrow funds have already been fully released." };
    }

    if (escrow.status === "Refunded") {
      return { success: false, message: "Cannot release funds for a refunded escrow." };
    }

    const amountToRelease = escrow.heldAmount;

    // 1. Credit seller's payout wallet
    await prisma.seller.update({
      where: { id: escrow.sellerId },
      data: {
        walletBalance: { increment: amountToRelease },
      },
    });

    // 2. Update Escrow Holding status
    await prisma.escrowHolding.update({
      where: { id: escrowId },
      data: {
        released60: true,
        status: "Released",
      },
    });

    // 3. Create Escrow Ledger Audit Entry
    await prisma.escrowLedger.create({
      data: {
        escrowId: escrow.id,
        orderId: escrow.orderId,
        sellerId: escrow.sellerId,
        type: "ManualAdminRelease",
        amount: amountToRelease,
        note: `Admin manually released 60% remaining escrow funds of ৳${amountToRelease.toLocaleString()} to seller ${escrow.seller.name}`,
        adminUser: "Admin",
      },
    });

    revalidatePath("/dashboard/admin/escrow");
    revalidatePath("/dashboard/admin/escrow/ledger");
    return { success: true, message: `Successfully released ৳${amountToRelease.toLocaleString()} to ${escrow.seller.name}'s wallet.` };
  } catch (error: any) {
    console.error("Error in releaseSingleEscrow:", error);
    return { success: false, message: error.message || "Failed to release escrow." };
  }
}

/**
 * Bulk release 60% held escrow funds for multiple selected escrow IDs
 */
export async function releaseBulkEscrow(escrowIds: string[]) {
  try {
    if (!escrowIds || escrowIds.length === 0) {
      return { success: false, message: "No escrow records selected." };
    }

    const escrows = await prisma.escrowHolding.findMany({
      where: {
        id: { in: escrowIds },
        status: { notIn: ["Released", "Refunded"] },
        released60: false,
      },
      include: { seller: true },
    });

    if (escrows.length === 0) {
      return { success: false, message: "No eligible unreleased escrow records found." };
    }

    let successCount = 0;
    let totalReleasedAmount = 0;

    for (const escrow of escrows) {
      const amountToRelease = escrow.heldAmount;

      // 1. Credit Seller wallet
      await prisma.seller.update({
        where: { id: escrow.sellerId },
        data: {
          walletBalance: { increment: amountToRelease },
        },
      });

      // 2. Update Escrow status
      await prisma.escrowHolding.update({
        where: { id: escrow.id },
        data: {
          released60: true,
          status: "Released",
        },
      });

      // 3. Create Ledger entry
      await prisma.escrowLedger.create({
        data: {
          escrowId: escrow.id,
          orderId: escrow.orderId,
          sellerId: escrow.sellerId,
          type: "ManualAdminRelease",
          amount: amountToRelease,
          note: `Bulk Admin Release: Disbursed 60% funds of ৳${amountToRelease.toLocaleString()} to seller ${escrow.seller.name}`,
          adminUser: "Admin",
        },
      });

      successCount++;
      totalReleasedAmount += amountToRelease;
    }

    revalidatePath("/dashboard/admin/escrow");
    revalidatePath("/dashboard/admin/escrow/ledger");

    return {
      success: true,
      count: successCount,
      message: `Successfully bulk-released ${successCount} escrow accounts totaling ৳${totalReleasedAmount.toLocaleString()}.`,
    };
  } catch (error: any) {
    console.error("Error in releaseBulkEscrow:", error);
    return { success: false, message: error.message || "Failed to process bulk release." };
  }
}

/**
 * Fetch all Escrow Ledger records for audit history
 */
export async function getEscrowLedgerData() {
  try {
    const ledger = await prisma.escrowLedger.findMany({
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            stores: { select: { id: true, storeName: true, slug: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return ledger;
  } catch (error) {
    console.error("Error fetching Escrow Ledger:", error);
    return [];
  }
}
