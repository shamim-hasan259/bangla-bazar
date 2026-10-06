import { NextResponse } from "next/server";
import prisma from "@/index";

export const dynamic = "force-dynamic";
export const revalidate = 3600; // Revalidate every hour

export async function GET() {
  try {
    const [totalCustomers, totalProducts, totalSellers, totalOrders] =
      await Promise.all([
        prisma.customer.count(),
        prisma.product.count(),
        prisma.seller.count({ where: { status: "Active" } }),
        prisma.sales.count(),
      ]);

    return NextResponse.json({
      success: true,
      stats: {
        totalCustomers,
        totalProducts,
        totalSellers,
        totalOrders,
        citiesCovered: 64, // Fixed — all Bangladesh districts
      },
    });
  } catch (error: any) {
    console.error("About stats error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
