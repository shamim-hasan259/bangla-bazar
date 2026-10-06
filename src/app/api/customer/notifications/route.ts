export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/index";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createNotification, seedDemoNotificationsForCustomer } from "@/lib/notifications";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const sessionUser = session?.user as any;

    if (!sessionUser) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const lookupId = sessionUser.id || sessionUser.customerId;
    const lookupPhone = sessionUser.phone;
    const isObjectId = typeof lookupId === "string" && /^[0-9a-fA-F]{24}$/.test(lookupId);

    const customer = await prisma.customer.findFirst({
      where: {
        OR: [
          ...(isObjectId ? [{ id: lookupId }] : []),
          ...(lookupId ? [{ customerId: lookupId }] : []),
          ...(lookupPhone ? [{ phone: lookupPhone }] : []),
        ],
      },
      select: { id: true, customerId: true },
    });

    const validIds = [
      customer?.id,
      customer?.customerId,
      sessionUser.id,
      sessionUser.customerId,
    ].filter(Boolean) as string[];

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const isReadFilter = searchParams.get("isRead");
    const searchQuery = searchParams.get("search");

    // Build Prisma query condition
    const whereCondition: any = {
      userId: { in: validIds },
      userType: "Customer",
    };

    if (category && category !== "all") {
      whereCondition.OR = [
        { category: category },
        { type: category },
      ];
    }

    if (isReadFilter === "true") {
      whereCondition.isRead = true;
    } else if (isReadFilter === "false") {
      whereCondition.isRead = false;
    }

    const allCustomerNotifications = await prisma.notification.findMany({
      where: {
        userId: { in: validIds },
        userType: "Customer",
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Compute category counts
    const categoryCounts: Record<string, { total: number; unread: number }> = {
      all: { total: allCustomerNotifications.length, unread: allCustomerNotifications.filter((n) => !n.isRead).length },
      Order: { total: 0, unread: 0 },
      Delivery: { total: 0, unread: 0 },
      ReturnRefund: { total: 0, unread: 0 },
      Wallet: { total: 0, unread: 0 },
      VoucherOffer: { total: 0, unread: 0 },
      Wishlist: { total: 0, unread: 0 },
      StoreSeller: { total: 0, unread: 0 },
      System: { total: 0, unread: 0 },
      Security: { total: 0, unread: 0 },
    };

    allCustomerNotifications.forEach((n) => {
      const cat = (n as any).category || (n as any).type || "System";
      if (categoryCounts[cat]) {
        categoryCounts[cat].total += 1;
        if (!n.isRead) categoryCounts[cat].unread += 1;
      }
    });

    let filtered = allCustomerNotifications;

    if (category && category !== "all") {
      filtered = filtered.filter(
        (n) => (n as any).category === category || (n as any).type === category
      );
    }

    if (isReadFilter === "false") {
      filtered = filtered.filter((n) => !n.isRead);
    } else if (isReadFilter === "true") {
      filtered = filtered.filter((n) => n.isRead);
    }

    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (n) =>
          n.title?.toLowerCase().includes(q) ||
          n.message?.toLowerCase().includes(q)
      );
    }

    return NextResponse.json({
      success: true,
      notifications: filtered,
      totalCount: allCustomerNotifications.length,
      unreadCount: categoryCounts.all.unread,
      categoryCounts,
    });
  } catch (error: any) {
    console.error("Error in GET /api/customer/notifications:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const sessionUser = session?.user as any;

    if (!sessionUser) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const lookupId = sessionUser.id || sessionUser.customerId;
    const lookupPhone = sessionUser.phone;
    const isObjectId = typeof lookupId === "string" && /^[0-9a-fA-F]{24}$/.test(lookupId);

    const customer = await prisma.customer.findFirst({
      where: {
        OR: [
          ...(isObjectId ? [{ id: lookupId }] : []),
          ...(lookupId ? [{ customerId: lookupId }] : []),
          ...(lookupPhone ? [{ phone: lookupPhone }] : []),
        ],
      },
      select: { id: true, customerId: true },
    });

    const targetUserId = customer?.id || sessionUser.id || sessionUser.customerId;

    if (body.action === "seed_demo") {
      const generated = await seedDemoNotificationsForCustomer(targetUserId);
      return NextResponse.json({
        success: true,
        message: "Demo notifications created across all categories successfully!",
        data: generated,
      });
    }

    const { category, title, message, link, type, metadata } = body;

    if (!title || !message) {
      return NextResponse.json(
        { success: false, message: "Title and message are required" },
        { status: 400 }
      );
    }

    const newNotification = await createNotification({
      userId: targetUserId,
      userType: "Customer",
      category: category || "System",
      title,
      message,
      link,
      type: type || category || "System",
      metadata,
    });

    return NextResponse.json({
      success: true,
      message: "Notification created successfully",
      notification: newNotification,
    });
  } catch (error: any) {
    console.error("Error in POST /api/customer/notifications:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const sessionUser = session?.user as any;

    if (!sessionUser) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { notificationId, markAll, category } = body;

    const lookupId = sessionUser.id || sessionUser.customerId;
    const lookupPhone = sessionUser.phone;
    const isObjectId = typeof lookupId === "string" && /^[0-9a-fA-F]{24}$/.test(lookupId);

    const customer = await prisma.customer.findFirst({
      where: {
        OR: [
          ...(isObjectId ? [{ id: lookupId }] : []),
          ...(lookupId ? [{ customerId: lookupId }] : []),
          ...(lookupPhone ? [{ phone: lookupPhone }] : []),
        ],
      },
      select: { id: true, customerId: true },
    });

    const validIds = [
      customer?.id,
      customer?.customerId,
      sessionUser.id,
      sessionUser.customerId,
    ].filter(Boolean) as string[];

    if (markAll) {
      const whereClause: any = {
        userId: { in: validIds },
        userType: "Customer",
        isRead: false,
      };

      if (category && category !== "all") {
        whereClause.OR = [
          { category: category },
          { type: category },
        ];
      }

      await prisma.notification.updateMany({
        where: whereClause,
        data: {
          isRead: true,
        },
      });

      return NextResponse.json({ success: true, message: "Notifications marked as read" });
    }

    if (notificationId) {
      await prisma.notification.update({
        where: { id: notificationId },
        data: { isRead: true },
      });

      return NextResponse.json({ success: true, message: "Notification marked as read" });
    }

    return NextResponse.json({ success: false, message: "Invalid request parameters" }, { status: 400 });
  } catch (error: any) {
    console.error("Error in PATCH /api/customer/notifications:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const sessionUser = session?.user as any;

    if (!sessionUser) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const notificationId = searchParams.get("id");
    const clearAll = searchParams.get("clearAll") === "true";

    const lookupId = sessionUser.id || sessionUser.customerId;
    const lookupPhone = sessionUser.phone;
    const isObjectId = typeof lookupId === "string" && /^[0-9a-fA-F]{24}$/.test(lookupId);

    const customer = await prisma.customer.findFirst({
      where: {
        OR: [
          ...(isObjectId ? [{ id: lookupId }] : []),
          ...(lookupId ? [{ customerId: lookupId }] : []),
          ...(lookupPhone ? [{ phone: lookupPhone }] : []),
        ],
      },
      select: { id: true, customerId: true },
    });

    const validIds = [
      customer?.id,
      customer?.customerId,
      sessionUser.id,
      sessionUser.customerId,
    ].filter(Boolean) as string[];

    if (clearAll) {
      await prisma.notification.deleteMany({
        where: {
          userId: { in: validIds },
          userType: "Customer",
        },
      });
      return NextResponse.json({ success: true, message: "All notifications cleared" });
    }

    if (!notificationId) {
      return NextResponse.json({ success: false, message: "Notification ID required" }, { status: 400 });
    }

    await prisma.notification.delete({
      where: { id: notificationId },
    });

    return NextResponse.json({ success: true, message: "Notification deleted successfully" });
  } catch (error: any) {
    console.error("Error in DELETE /api/customer/notifications:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}
