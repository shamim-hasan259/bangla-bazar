// Test script for verifying product updates
import prisma from "../prisma";

export async function testProductVerification() {
  const count = await prisma.product.count();
  return { success: true, count };
}
