import { NextRequest, NextResponse } from "next/server";
import prisma from "@/index";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();
    const { photo, userId: providedUserId } = body;

    if (!photo) {
      return NextResponse.json(
        { success: false, error: "Photo URL is required" },
        { status: 400 }
      );
    }

    const userId =
      providedUserId ||
      // @ts-ignore
      session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized or missing user ID" },
        { status: 401 }
      );
    }

    const isObjectId = typeof userId === "string" && /^[0-9a-fA-F]{24}$/.test(userId);

    let user = await prisma.user.findFirst({
      where: isObjectId
        ? { OR: [{ id: userId }, { username: userId }] }
        : { username: userId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { photo },
    });

    return NextResponse.json({
      success: true,
      message: "User photo updated successfully",
      photo: updated.photo,
    });
  } catch (error: any) {
    console.error("User photo update API error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update photo" },
      { status: 500 }
    );
  }
}
