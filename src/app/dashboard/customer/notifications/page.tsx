import React from "react";
import prisma from "@/index";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import NotificationsClient from "./NotificationsClient";

export const dynamic = "force-dynamic";

export default async function CustomerNotificationsPage() {
  const session = await getServerSession(authOptions);
  const sessionUser = session?.user as any;

  if (!sessionUser) {
    redirect("/auth/customer/login");
  }

  const lookupId = sessionUser.id || sessionUser.customerId;
  const lookupPhone = sessionUser.phone;
  const isObjectId = typeof lookupId === "string" && /^[0-9a-fA-F]{24}$/.test(lookupId);

  let serializedNotifications: any[] = [];
  let customerDbId = lookupId;

  try {
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

    if (customer?.id) {
      customerDbId = customer.id;
    }

    const rawIds = [
      customer?.id,
      customer?.customerId,
      sessionUser.id,
      sessionUser.customerId,
    ].filter(Boolean) as string[];

    const uniqueIds = Array.from(new Set(rawIds));

    // Retrieve all notifications matching customerId
    const notifications = await prisma.notification.findMany({
      where: {
        userId: { in: uniqueIds },
        userType: "Customer",
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // If customer has 0 notifications, seed demo notifications across categories
    if (notifications.length === 0 && customerDbId) {
      const { seedDemoNotificationsForCustomer } = await import("@/lib/notifications");
      await seedDemoNotificationsForCustomer(customerDbId);
      const seeded = await prisma.notification.findMany({
        where: { userId: customerDbId },
        orderBy: { createdAt: "desc" },
      });
      serializedNotifications = seeded.map((n) => ({
        ...n,
        createdAt: n.createdAt.toISOString(),
      }));
    } else {
      serializedNotifications = notifications.map((n) => ({
        ...n,
        createdAt: n.createdAt.toISOString(),
      }));
    }
  } catch (error) {
    console.error("Error retrieving customer notifications:", error);
    serializedNotifications = [];
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <NotificationsClient
        initialNotifications={serializedNotifications}
        customerId={customerDbId}
      />
    </div>
  );
}
