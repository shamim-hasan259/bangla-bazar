import { NextResponse } from "next/server";
import prisma from "@/index";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // 1. Overall delivery stats
    const [
      totalOrders,
      deliveredOrders,
      processingOrders,
      shippedOrders,
      pendingOrders,
      cancelledOrders,
    ] = await Promise.all([
      prisma.sales.count(),
      prisma.sales.count({ where: { status: "Delivered" } }),
      prisma.sales.count({ where: { status: "Processing" } }),
      prisma.sales.count({ where: { status: "Shipped" } }),
      prisma.sales.count({ where: { status: "OrderPlaced" } }),
      prisma.sales.count({ where: { status: "Canceled" } }),
    ]);

    // 2. Courier usage breakdown
    const allOrders = await prisma.sales.findMany({
      select: { courierName: true, status: true, deliveryDate: true },
      where: { courierName: { not: null } },
      take: 500,
      orderBy: { createdAt: "desc" },
    });

    // Courier frequency
    const courierMap: Record<string, number> = {};
    allOrders.forEach((o) => {
      if (o.courierName) {
        courierMap[o.courierName] = (courierMap[o.courierName] || 0) + 1;
      }
    });
    const topCouriers = Object.entries(courierMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    // 3. Avg delivery time (orders with deliveryDate)
    const ordersWithDelivery = await prisma.sales.findMany({
      select: { createdAt: true, deliveryDate: true },
      where: {
        deliveryDate: { not: null },
        status: "Delivered",
      },
      take: 200,
      orderBy: { createdAt: "desc" },
    });

    let avgDeliveryDays = 0;
    if (ordersWithDelivery.length > 0) {
      const totalDays = ordersWithDelivery.reduce((acc, o) => {
        if (!o.deliveryDate) return acc;
        const diff =
          (new Date(o.deliveryDate).getTime() -
            new Date(o.createdAt).getTime()) /
          (1000 * 60 * 60 * 24);
        return acc + Math.max(0, diff);
      }, 0);
      avgDeliveryDays = Math.round((totalDays / ordersWithDelivery.length) * 10) / 10;
    }

    // 4. Active store/seller count for delivery coverage
    const [activeStores, activeSellers] = await Promise.all([
      prisma.store.count({ where: { status: "Approved" } }),
      prisma.seller.count({ where: { status: "Active" } }),
    ]);

    const successRate =
      totalOrders > 0
        ? Math.round((deliveredOrders / totalOrders) * 100 * 10) / 10
        : 0;

    return NextResponse.json({
      success: true,
      stats: {
        totalOrders,
        deliveredOrders,
        processingOrders,
        shippedOrders,
        pendingOrders,
        cancelledOrders,
        successRate,
        avgDeliveryDays: avgDeliveryDays || 3.5, // fallback if no data
        activeStores,
        activeSellers,
        citiesCovered: 64,
      },
      topCouriers: topCouriers.length
        ? topCouriers
        : [
            { name: "Pathao", count: 0 },
            { name: "Paperfly", count: 0 },
            { name: "RedX", count: 0 },
          ],
    });
  } catch (error: any) {
    console.error("Delivery info API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch delivery information" },
      { status: 500 }
    );
  }
}
