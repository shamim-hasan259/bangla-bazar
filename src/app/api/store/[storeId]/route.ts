import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../../helpers/server-helpers";
import prisma from "@/index";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const { storeId } = await params;

    if (!storeId) {
      return NextResponse.json({ error: "Store ID is required" }, { status: 400 });
    }

    await connectToDatabase();

    const store = await prisma.store.findUnique({
      where: {
        id: storeId,
        deletedAt: null,
      },
      include: {
        masterCategory: {
          select: {
            name: true,
          },
        },
        settings: true,
        paymentSettings: true,
      },
    });

    if (!store) {
      return NextResponse.json(
        { success: false, error: "Store not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: store }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch store details" },
      { status: 500 }
    );
  }
}
