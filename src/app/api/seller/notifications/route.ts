import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/index";
import { getSellerNotifications } from "@/app/dashboard/seller/notifications/_action";

// GET /api/seller/notifications
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    const sellerIdParam = searchParams.get("sellerId");

    let sellerId = sellerIdParam || session?.user?.id;

    if (!sellerId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized or missing seller ID" },
        { status: 401 }
      );
    }

    const notifications = await getSellerNotifications(sellerId);

    return NextResponse.json({
      success: true,
      data: notifications,
    });
  } catch (error: any) {
    console.error("Error in GET /api/seller/notifications:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

// POST /api/seller/notifications
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, title, message, category, type, link, metadata } = body;

    if (!userId || !title || !message) {
      return NextResponse.json(
        { success: false, error: "userId, title, and message are required" },
        { status: 400 }
      );
    }

    const notification = await prisma.notification.create({
      data: {
        userId,
        userType: "Seller",
        title,
        message,
        category: category || "System",
        type: type || category || "System",
        link: link || null,
        metadata: metadata || null,
        isRead: false,
      },
    });

    return NextResponse.json({
      success: true,
      data: notification,
    });
  } catch (error: any) {
    console.error("Error in POST /api/seller/notifications:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create notification" },
      { status: 500 }
    );
  }
}
