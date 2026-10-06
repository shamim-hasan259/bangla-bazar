export const dynamic = "force-dynamic";
import prisma from "@/index";
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../../helpers/server-helpers";

export const GET = async (
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  try {
    await connectToDatabase();
    const res = await prisma.product.findUnique({
      where: {
        id: id,
      },
    });

    return NextResponse.json(res, { status: 200 });
  } catch (error) {
    console.error("Error getting product:", error);
    return NextResponse.json(
      { error: "Failed to get product" },
      { status: 500 }
    );
  }
};
