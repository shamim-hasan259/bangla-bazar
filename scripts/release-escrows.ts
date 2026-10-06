import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function releaseEscrowPipeline() {
  console.log("🔒 Running 7-day Escrow Release Pipeline Worker...");

  const now = new Date();
  
  // 1. Find all escrows where 40% has been released, 60% is pending, and releaseDate <= now
  const pending60 = await prisma.escrowHolding.findMany({
    where: {
      released40: true,
      released60: false,
      releaseDate: { lte: now },
      status: "PartiallyReleased",
    },
  });

  console.log(`Found ${pending60.length} escrow holds ready for 60% final disbursement.`);

  for (const escrow of pending60) {
    const final60Amount = escrow.heldAmount; // Remaining 60%

    // Credit remaining 60% to Seller's wallet
    await prisma.seller.update({
      where: { id: escrow.sellerId },
      data: {
        walletBalance: { increment: final60Amount },
      },
    });

    // Mark Escrow as Released
    await prisma.escrowHolding.update({
      where: { id: escrow.id },
      data: {
        heldAmount: 0,
        released60: true,
        status: "Released",
      },
    });

    console.log(`✅ Released ৳${final60Amount} for Escrow ID: ${escrow.id} to Seller ID: ${escrow.sellerId}`);
  }

  console.log("✨ Escrow Release Pipeline completed!");
}

releaseEscrowPipeline()
  .catch((e) => console.error("Escrow worker error:", e))
  .finally(async () => await prisma.$disconnect());
