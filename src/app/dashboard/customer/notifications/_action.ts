"use server";

import prisma from "@/index";
import { revalidatePath } from "next/cache";

export async function getNotifications(customerId: string) {
  try {
    if (!customerId) return [];

    const isObjectId = typeof customerId === "string" && /^[0-9a-fA-F]{24}$/.test(customerId);

    const customer = await prisma.customer.findFirst({
      where: {
        OR: [
          ...(isObjectId ? [{ id: customerId }] : []),
          { customerId: customerId },
        ],
      },
      select: { id: true, customerId: true },
    });

    const validIds = [
      customer?.id,
      customer?.customerId,
      customerId,
    ].filter(Boolean) as string[];

    return await prisma.notification.findMany({
      where: {
        userId: { in: validIds },
        userType: "Customer",
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  } catch (error) {
    console.error("Error fetching notifications in server action:", error);
    return [];
  }
}

export async function markNotificationAsRead(id: string) {
  try {
    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
    revalidatePath("/dashboard/customer/notifications");
    return { success: true, updated };
  } catch (error: any) {
    console.error("Error marking notification as read:", error);
    return { success: false, error: error.message };
  }
}

export async function markAllNotificationsAsRead(customerId: string) {
  try {
    if (!customerId) return { success: false };

    const isObjectId = typeof customerId === "string" && /^[0-9a-fA-F]{24}$/.test(customerId);

    const customer = await prisma.customer.findFirst({
      where: {
        OR: [
          ...(isObjectId ? [{ id: customerId }] : []),
          { customerId: customerId },
        ],
      },
      select: { id: true, customerId: true },
    });

    const validIds = [
      customer?.id,
      customer?.customerId,
      customerId,
    ].filter(Boolean) as string[];

    await prisma.notification.updateMany({
      where: {
        userId: { in: validIds },
        userType: "Customer",
        isRead: false,
      },
      data: { isRead: true },
    });
    revalidatePath("/dashboard/customer/notifications");
    return { success: true };
  } catch (error: any) {
    console.error("Error marking all notifications as read:", error);
    return { success: false, error: error.message };
  }
}
