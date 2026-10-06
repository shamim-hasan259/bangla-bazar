import { NextRequest, NextResponse } from "next/server";
import prisma from "@/index";

// POST /api/questions/[questionId]/answers
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ questionId: string }> }
) {
  try {
    const { questionId } = await params;
    const { sellerId, userId, answer } = await req.json();

    if (!answer || (!sellerId && !userId)) {
      return NextResponse.json(
        { success: false, error: "Answer text and author ID are required" },
        { status: 400 }
      );
    }

    const newAnswer = await prisma.productAnswer.create({
      data: {
        questionId,
        sellerId: sellerId || null,
        userId: userId || null,
        answer,
      },
      include: {
        seller: { select: { id: true, name: true, photo: true } },
        user: { select: { id: true, name: true, photo: true } },
      },
    });

    return NextResponse.json({ success: true, answer: newAnswer });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to post answer" },
      { status: 500 }
    );
  }
}
