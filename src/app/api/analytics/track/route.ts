import { NextRequest, NextResponse } from "next/server";
import prisma from "@/index";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { eventType, productId, sellerId } = body;

    if (!eventType) {
      return NextResponse.json(
        { error: "eventType is required" },
        { status: 400 }
      );
    }

    // Determine device from user-agent
    const userAgent = req.headers.get("user-agent") || "";
    let device = "Desktop";
    if (/mobile/i.test(userAgent) || /android/i.test(userAgent) || /iphone/i.test(userAgent) || /ipad/i.test(userAgent)) {
      device = "Mobile";
    }

    let finalSellerId = sellerId;
    if (!finalSellerId && productId) {
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { sellerId: true, supplierId: true }
      });
      if (product) {
        finalSellerId = product.sellerId || product.supplierId || undefined;
      }
    }

    const event = await prisma.analyticsEvent.create({
      data: {
        eventType,
        productId,
        sellerId: finalSellerId,
        device,
      },
    });

    return NextResponse.json({ success: true, event }, { status: 201 });
  } catch (error) {
    console.error("Error tracking analytics event:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
