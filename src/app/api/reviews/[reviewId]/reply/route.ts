export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/index";

// POST /api/reviews/[reviewId]/reply
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  try {
    const { reviewId } = await params;
    const { sellerId, reply } = await req.json();

    if (!reply || !reply.trim()) {
      return NextResponse.json({ success: false, error: "Reply text is required" }, { status: 400 });
    }

    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        reply: reply.trim(),
        repliedAt: new Date(),
        sellerId: sellerId || undefined,
      },
    });

    return NextResponse.json({ success: true, review: updatedReview });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to post reply" }, { status: 500 });
  }
}
