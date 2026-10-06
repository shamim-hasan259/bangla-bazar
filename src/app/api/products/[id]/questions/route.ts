import { NextRequest, NextResponse } from "next/server";
import prisma from "@/index";

// GET /api/products/[id]/questions
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const questions = await prisma.productQuestion.findMany({
      where: { productId: id },
      include: {
        customer: {
          select: { id: true, name: true, photo: true },
        },
        answers: {
          include: {
            seller: { select: { id: true, name: true, photo: true } },
            user: { select: { id: true, name: true, photo: true } },
          },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, questions });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch questions" },
      { status: 500 }
    );
  }
}

// POST /api/products/[id]/questions
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { customerId, question } = await req.json();

    if (!customerId || !question) {
      return NextResponse.json(
        { success: false, error: "Customer ID and question are required" },
        { status: 400 }
      );
    }

    const newQuestion = await prisma.productQuestion.create({
      data: {
        productId: id,
        customerId,
        question,
      },
      include: {
        customer: { select: { id: true, name: true, photo: true } },
        answers: [],
      },
    });

    return NextResponse.json({ success: true, question: newQuestion });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to post question" },
      { status: 500 }
    );
  }
}
