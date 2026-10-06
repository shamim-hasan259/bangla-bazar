import prisma from "@/index";
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../../helpers/server-helpers";
import { OrderStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

const mapFilterToStatusArray = (filter: string): OrderStatus[] => {
  const f = filter.toLowerCase().trim();
  switch (f) {
    case "pending":
      return [OrderStatus.Pending, OrderStatus.OrderPlaced, OrderStatus.Ordered];
    case "processing":
      return [OrderStatus.Processing];
    case "shipped":
      return [OrderStatus.Shipped];
    case "delivered":
      return [OrderStatus.Delivered, OrderStatus.Complete];
    case "canceled":
    case "cancelled":
      return [OrderStatus.Canceled];
    case "return":
    case "returned":
      return [OrderStatus.Return];
    default:
      return [];
  }
};

export const GET = async (
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) => {
  const { userId } = await params;
  const url = new URL(req.url);
  const statusParam = url.searchParams.get("status");
  const searchParam = url.searchParams.get("search");

  try {
    await connectToDatabase();

    const whereClause: any = {
      OR: [
        { customerId: userId },
        { userId: userId },
      ],
    };

    if (statusParam && statusParam !== "all") {
      const allowedStatuses = mapFilterToStatusArray(statusParam);
      if (allowedStatuses.length > 0) {
        whereClause.status = { in: allowedStatuses };
      }
    }

    if (searchParam && searchParam.trim()) {
      const q = searchParam.trim();
      whereClause.AND = [
        {
          OR: [
            { invoiceId: { contains: q, mode: "insensitive" } },
            { id: { contains: q, mode: "insensitive" } },
          ],
        },
      ];
    }

    const orders = await prisma.sales.findMany({
      where: whereClause,
      orderBy: {
        createdAt: "desc",
      },
    });

    // Extract all unique product IDs
    const productIds: string[] = [];
    orders.forEach((order: any) => {
      const items = (order.soldProducts || order.products || []) as any[];
      items.forEach((item: any) => {
        if (item.productId && !productIds.includes(item.productId)) {
          productIds.push(item.productId);
        }
      });
    });

    // Query product photos
    let productPhotoMap: Record<string, any> = {};
    if (productIds.length > 0) {
      const products = await prisma.product.findMany({
        where: {
          id: { in: productIds },
        },
        select: {
          id: true,
          photo: true,
        },
      });

      products.forEach((p) => {
        productPhotoMap[p.id] = p.photo;
      });
    }

    // Map photo back to soldProducts / products
    const ordersWithPhotos = orders.map((order: any) => {
      const items = (order.soldProducts || order.products || []) as any[];
      const updatedItems = items.map((item: any) => ({
        ...item,
        photo: item.photo || productPhotoMap[item.productId] || null,
      }));
      return {
        ...order,
        soldProducts: updatedItems,
      };
    });

    return NextResponse.json(ordersWithPhotos);
  } catch (error) {
    console.error("Error to get orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
};
