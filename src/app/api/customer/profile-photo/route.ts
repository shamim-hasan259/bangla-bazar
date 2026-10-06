import { NextRequest, NextResponse } from "next/server";
import prisma from "@/index";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();
    const { photo, customerId: providedCustomerId } = body;

    if (!photo) {
      return NextResponse.json(
        { success: false, error: "Photo URL is required" },
        { status: 400 }
      );
    }

    // Determine target customerId
    const customerId =
      providedCustomerId ||
      // @ts-ignore
      session?.user?.customerId ||
      // @ts-ignore
      session?.user?.id;

    if (!customerId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized or missing customer ID" },
        { status: 401 }
      );
    }

    const isObjectId = typeof customerId === "string" && /^[0-9a-fA-F]{24}$/.test(customerId);

    // Try finding by customerId or ObjectId
    let customer = await prisma.customer.findFirst({
      where: isObjectId
        ? { OR: [{ id: customerId }, { customerId: customerId }] }
        : { customerId: customerId },
    });

    if (!customer) {
      return NextResponse.json(
        { success: false, error: "Customer not found" },
        { status: 404 }
      );
    }

    const updated = await prisma.customer.update({
      where: { id: customer.id },
      data: { photo },
    });

    return NextResponse.json({
      success: true,
      message: "Profile image updated successfully",
      photo: updated.photo,
    });
  } catch (error: any) {
    console.error("Customer photo update API error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update profile image" },
      { status: 500 }
    );
  }
}
