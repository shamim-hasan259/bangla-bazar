import prisma from "@/index";
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../../../helpers/server-helpers";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export const GET = async (req: Request, { params }: Props) => {
  const { id } = await params;

  try {
    await connectToDatabase();
    const order = await prisma.sales.findFirst({
      where: {
        id: id,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    const items = (order.soldProducts || order.products || []) as any[];
    const productIds = items
      .map((item: any) => item.productId)
      .filter((id): id is string => typeof id === "string");

    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
      },
      select: {
        id: true,
        photo: true,
      },
    });

    const productPhotoMap: Record<string, any> = {};
    products.forEach((p) => {
      productPhotoMap[p.id] = p.photo;
    });

    const updatedItems = items.map((item: any) => ({
      ...item,
      photo: item.photo || productPhotoMap[item.productId] || null,
    }));

    const orderWithPhotos = {
      ...order,
      soldProducts: updatedItems,
    };

    return NextResponse.json(orderWithPhotos);
  } catch (error) {
    console.error("Error to get orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
};
