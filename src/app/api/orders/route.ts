export const dynamic = "force-dynamic";
import prisma from "@/index";
import { NextResponse } from "next/server";

export const POST = async (req: Request) => {
  try {
    const {
      userId,
      name,
      country,
      streetAddress,
      city,
      state,
      zipCode,
      phone,
      email,
      products,
      totalPrice,
    } = await req.json();

    const productIds = products.map((item: any) => item.id || item.productId);
    const dbProducts = await prisma.product.findMany({
        where: { id: { in: productIds.filter(Boolean) } },
        select: { sellerId: true }
    });
    const sellerIds = Array.from(new Set(dbProducts.map(p => p.sellerId).filter(Boolean))) as string[];

    const order = await prisma.order.create({
      data: {
        userId,
        name,
        country,
        streetAddress,
        city,
        state,
        zipCode,
        phone,
        email,
        products,
        totalPrice,
        sellerIds,
        status: "OrderPlaced",
      },
    });
    return NextResponse.json(order, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create order." },
      { status: 500 }
    );
  }
};
