"use server";
import prisma from "@/index";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getMyNotifications() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return [];

  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    });
    return notifications;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }
}

export async function markNotificationsAsRead() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return false;

  try {
    await prisma.notification.updateMany({
      where: { userId: session.user.id, isRead: false },
      data: { isRead: true }
    });
    return true;
  } catch (error) {
    console.error("Error updating notifications:", error);
    return false;
  }
}
