export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/index";

// POST /api/coupons/validate
export async function POST(req: NextRequest) {
  try {
    const { code, cartTotal } = await req.json();

    if (!code) {
      return NextResponse.json({ success: false, error: "Coupon code is required" }, { status: 400 });
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon || coupon.status !== "Active") {
      return NextResponse.json({ success: false, error: "Invalid or inactive coupon code" }, { status: 404 });
    }

    if (new Date(coupon.expiryDate) < new Date()) {
      return NextResponse.json({ success: false, error: "Coupon code has expired" }, { status: 400 });
    }

    if (coupon.minAmount && cartTotal < coupon.minAmount) {
      return NextResponse.json({
        success: false,
        error: `Minimum order amount of ৳${coupon.minAmount} is required for this coupon`,
      }, { status: 400 });
    }

    let discountAmount = 0;
    if (coupon.type === "Percentage") {
      discountAmount = cartTotal * (coupon.discount / 100);
      if (coupon.maxDiscount) {
        discountAmount = Math.min(discountAmount, coupon.maxDiscount);
      }
    } else {
      discountAmount = coupon.discount;
    }

    return NextResponse.json({
      success: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discount: coupon.discount,
        type: coupon.type,
        discountAmount,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to validate coupon" }, { status: 500 });
  }
}
