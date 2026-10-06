"use server";

import prisma from "@/index";
import { revalidatePath } from "next/cache";

export async function getSellerNotifications(sellerId: string) {
  try {
    if (!sellerId) return [];

    const isObjectId = typeof sellerId === "string" && /^[0-9a-fA-F]{24}$/.test(sellerId);

    const seller = await prisma.seller.findFirst({
      where: {
        OR: [
          ...(isObjectId ? [{ id: sellerId }] : []),
          { sellerId: sellerId },
        ],
      },
      select: { id: true, sellerId: true },
    });

    const validIds = [
      seller?.id,
      seller?.sellerId,
      sellerId,
    ].filter(Boolean) as string[];

    let notifications = await prisma.notification.findMany({
      where: {
        userId: { in: validIds },
        userType: "Seller",
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // If no notifications exist for this seller, initialize with standard seller notifications
    if (notifications.length === 0 && validIds.length > 0) {
      const targetUserId = seller?.id || sellerId;
      const initialSeedData = [
        // 1. Orders (অর্ডার সংক্রান্ত নোটিফিকেশন)
        {
          userId: targetUserId,
          userType: "Seller" as const,
          title: "New Order Received",
          message: "You received a new order (#ORD-98231) for 2 items.",
          category: "Order",
          type: "Order",
          link: "/dashboard/seller/orders",
          isRead: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 15), // 15 mins ago
        },
        {
          userId: targetUserId,
          userType: "Seller" as const,
          title: "Order Cancellation Request",
          message: "Customer requested cancellation for order #ORD-98100.",
          category: "Order",
          type: "Cancellation",
          link: "/dashboard/seller/orders",
          isRead: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        },
        {
          userId: targetUserId,
          userType: "Seller" as const,
          title: "Return & Refund Request",
          message: "A return request has been submitted for order #ORD-97554.",
          category: "Order",
          type: "ReturnRefund",
          link: "/dashboard/seller/orders",
          isRead: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
        },
        {
          userId: targetUserId,
          userType: "Seller" as const,
          title: "Delivery Update",
          message: "Order #ORD-96541 has been marked as delivered.",
          category: "Order",
          type: "Delivery",
          link: "/dashboard/seller/orders",
          isRead: true,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        },
        // 2. Inventory (স্টক ও প্রোডাক্ট সংক্রান্ত)
        {
          userId: targetUserId,
          userType: "Seller" as const,
          title: "Low Stock Alert",
          message: "Only 3 units left in stock for 'Wireless Earbuds'.",
          category: "Inventory",
          type: "LowStock",
          link: "/dashboard/seller/inventory/stock",
          isRead: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
        },
        {
          userId: targetUserId,
          userType: "Seller" as const,
          title: "Out of Stock Alert",
          message: "'Men's Cotton T-Shirt (Black, L)' is completely out of stock.",
          category: "Inventory",
          type: "OutOfStock",
          link: "/dashboard/seller/inventory/stock",
          isRead: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
        },
        {
          userId: targetUserId,
          userType: "Seller" as const,
          title: "Product Listing Approved",
          message: "Your new product listing 'Bluetooth Speaker' has been approved by admin.",
          category: "Inventory",
          type: "Approval",
          link: "/dashboard/seller/products",
          isRead: true,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36), // 1.5 days ago
        },
        {
          userId: targetUserId,
          userType: "Seller" as const,
          title: "Product Listing Rejected",
          message: "Product 'Smart Watch' was rejected. Reason: Incomplete specifications.",
          category: "Inventory",
          type: "Rejection",
          link: "/dashboard/seller/products",
          isRead: true,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
        },
        // 3. Payouts & Wallet (পেমেন্ট ও ফাইন্যান্স সংক্রান্ত)
        {
          userId: targetUserId,
          userType: "Seller" as const,
          title: "Payout Processed",
          message: "Payout of ৳15,400 has been transferred to your bank account.",
          category: "Wallet",
          type: "Payout",
          link: "/dashboard/seller/wallet",
          isRead: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
        },
        {
          userId: targetUserId,
          userType: "Seller" as const,
          title: "Withdrawal Request Approved",
          message: "Your withdrawal request for ৳5,000 has been approved.",
          category: "Wallet",
          type: "Withdrawal",
          link: "/dashboard/seller/wallet",
          isRead: true,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 30), // 30 hours ago
        },
        {
          userId: targetUserId,
          userType: "Seller" as const,
          title: "Commission Invoice Ready",
          message: "Platform monthly commission invoice #INV-4412 is ready to view.",
          category: "Wallet",
          type: "Commission",
          link: "/dashboard/seller/wallet",
          isRead: true,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72), // 3 days ago
        },
        // 4. System (প্ল্যাটফর্ম ও সিস্টেম অ্যালার্ট)
        {
          userId: targetUserId,
          userType: "Seller" as const,
          title: "Policy Update",
          message: "Bangla Bazar updated Seller Return & Refund policies.",
          category: "System",
          type: "Policy",
          link: "/dashboard/seller",
          isRead: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18), // 18 hours ago
        },
        {
          userId: targetUserId,
          userType: "Seller" as const,
          title: "Campaign Invitation",
          message: "Registration is now open for the upcoming 'Pohela Boishakh Mega Sale'.",
          category: "System",
          type: "Campaign",
          link: "/dashboard/seller",
          isRead: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20), // 20 hours ago
        },
        {
          userId: targetUserId,
          userType: "Seller" as const,
          title: "NID Verification Pending",
          message: "Your National ID (NID) verification is pending. Please complete it to avoid payout delays.",
          category: "System",
          type: "Verification",
          link: "/dashboard/seller/profile",
          isRead: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 40), // 40 hours ago
        },
        {
          userId: targetUserId,
          userType: "Seller" as const,
          title: "Scheduled Maintenance Alert",
          message: "Scheduled system maintenance will occur tonight from 2:00 AM to 4:00 AM.",
          category: "System",
          type: "Maintenance",
          link: "/dashboard/seller",
          isRead: true,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 50), // 50 hours ago
        },
      ];

      await Promise.all(
        initialSeedData.map((data) =>
          prisma.notification.create({
            data,
          })
        )
      );

      notifications = await prisma.notification.findMany({
        where: {
          userId: { in: validIds },
          userType: "Seller",
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }

    return notifications;
  } catch (error) {
    console.error("Error fetching seller notifications in server action:", error);
    return [];
  }
}

export async function markSellerNotificationAsRead(id: string) {
  try {
    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
    revalidatePath("/dashboard/seller/notifications");
    return { success: true, updated };
  } catch (error: any) {
    console.error("Error marking notification as read:", error);
    return { success: false, error: error.message };
  }
}

export async function markAllSellerNotificationsAsRead(sellerId: string) {
  try {
    if (!sellerId) return { success: false };

    const isObjectId = typeof sellerId === "string" && /^[0-9a-fA-F]{24}$/.test(sellerId);

    const seller = await prisma.seller.findFirst({
      where: {
        OR: [
          ...(isObjectId ? [{ id: sellerId }] : []),
          { sellerId: sellerId },
        ],
      },
      select: { id: true, sellerId: true },
    });

    const validIds = [
      seller?.id,
      seller?.sellerId,
      sellerId,
    ].filter(Boolean) as string[];

    await prisma.notification.updateMany({
      where: {
        userId: { in: validIds },
        userType: "Seller",
        isRead: false,
      },
      data: { isRead: true },
    });
    revalidatePath("/dashboard/seller/notifications");
    return { success: true };
  } catch (error: any) {
    console.error("Error marking all seller notifications as read:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteSellerNotification(id: string) {
  try {
    await prisma.notification.delete({
      where: { id },
    });
    revalidatePath("/dashboard/seller/notifications");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting seller notification:", error);
    return { success: false, error: error.message };
  }
}
