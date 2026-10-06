import prisma from "@/index";

export type NotificationCategory =
  | "Order"
  | "Delivery"
  | "ReturnRefund"
  | "Wallet"
  | "VoucherOffer"
  | "Wishlist"
  | "StoreSeller"
  | "System"
  | "Security";

export interface CreateNotificationParams {
  userId: string;
  userType?: "Customer" | "Seller" | "Admin";
  title: string;
  message: string;
  category: NotificationCategory;
  link?: string;
  type?: string;
  metadata?: any;
}

/**
 * Generic customer/user notification creator
 */
export async function createNotification(params: CreateNotificationParams) {
  try {
    return await prisma.notification.create({
      data: {
        userId: params.userId,
        userType: params.userType || "Customer",
        title: params.title,
        message: params.message,
        category: params.category,
        link: params.link || null,
        type: params.type || params.category,
        metadata: params.metadata || null,
        isRead: false,
      },
    });
  } catch (error) {
    console.error(`Error creating ${params.category} notification:`, error);
    return null;
  }
}

/**
 * 1. Order Notifications
 */
export async function createOrderNotification(
  userId: string,
  params: { orderId?: string; invoiceId?: string; title?: string; message: string; link?: string }
) {
  return createNotification({
    userId,
    category: "Order",
    title: params.title || "Order Update",
    message: params.message,
    link: params.link || (params.orderId ? `/dashboard/customer/order-history/${params.orderId}` : "/dashboard/customer/order-history"),
    type: "Order",
  });
}

/**
 * 2. Delivery Notifications
 */
export async function createDeliveryNotification(
  userId: string,
  params: { trackingCode?: string; courierName?: string; title?: string; message: string; link?: string }
) {
  return createNotification({
    userId,
    category: "Delivery",
    title: params.title || "Delivery Update",
    message: params.message,
    link: params.link || "/dashboard/customer/order-history",
    type: "Delivery",
  });
}

/**
 * 3. Return & Refund Notifications
 */
export async function createReturnRefundNotification(
  userId: string,
  params: { refundId?: string; title?: string; message: string; link?: string }
) {
  return createNotification({
    userId,
    category: "ReturnRefund",
    title: params.title || "Return & Refund Update",
    message: params.message,
    link: params.link || "/dashboard/customer/order-history",
    type: "ReturnRefund",
  });
}

/**
 * 4. Wallet Notifications
 */
export async function createWalletNotification(
  userId: string,
  params: { amount?: number; title?: string; message: string; link?: string }
) {
  return createNotification({
    userId,
    category: "Wallet",
    title: params.title || "Wallet Transaction",
    message: params.message,
    link: params.link || "/dashboard/customer/wallet",
    type: "Wallet",
  });
}

/**
 * 5. Voucher & Offers Notifications
 */
export async function createVoucherOfferNotification(
  userId: string,
  params: { code?: string; title?: string; message: string; link?: string }
) {
  return createNotification({
    userId,
    category: "VoucherOffer",
    title: params.title || "Special Offer & Voucher",
    message: params.message,
    link: params.link || "/vouchers",
    type: "VoucherOffer",
  });
}

/**
 * 6. Wishlist Notifications
 */
export async function createWishlistNotification(
  userId: string,
  params: { productName?: string; title?: string; message: string; link?: string }
) {
  return createNotification({
    userId,
    category: "Wishlist",
    title: params.title || "Wishlist Item Update",
    message: params.message,
    link: params.link || "/dashboard/customer/wishlist",
    type: "Wishlist",
  });
}

/**
 * 7. Store/Seller Notifications
 */
export async function createStoreSellerNotification(
  userId: string,
  params: { storeName?: string; title?: string; message: string; link?: string }
) {
  return createNotification({
    userId,
    category: "StoreSeller",
    title: params.title || (params.storeName ? `Update from ${params.storeName}` : "Store & Seller Update"),
    message: params.message,
    link: params.link || "/stores",
    type: "StoreSeller",
  });
}

/**
 * 8. System Notifications
 */
export async function createSystemNotification(
  userId: string,
  params: { title?: string; message: string; link?: string }
) {
  return createNotification({
    userId,
    category: "System",
    title: params.title || "System Notification",
    message: params.message,
    link: params.link || "/dashboard/customer",
    type: "System",
  });
}

/**
 * 9. Security Notifications
 */
export async function createSecurityNotification(
  userId: string,
  params: { title?: string; message: string; link?: string }
) {
  return createNotification({
    userId,
    category: "Security",
    title: params.title || "Security Alert",
    message: params.message,
    link: params.link || "/dashboard/customer/security",
    type: "Security",
  });
}

/**
 * Order status notification backward compatibility
 */
export async function createOrderStatusNotification(orderId: string, newStatus: string) {
  try {
    const sale = await prisma.sales.findUnique({
      where: { id: orderId },
      select: {
        customerId: true,
        invoiceId: true,
      },
    });

    if (!sale || !sale.customerId) {
      return;
    }

    let category: NotificationCategory = "Order";
    let title = "Order Status Updated";
    if (newStatus.toLowerCase().includes("deliver")) {
      category = "Delivery";
      title = "Package Delivery Update";
    } else if (newStatus.toLowerCase().includes("return") || newStatus.toLowerCase().includes("refund")) {
      category = "ReturnRefund";
      title = "Return & Refund Update";
    }

    await createNotification({
      userId: sale.customerId,
      userType: "Customer",
      category,
      title,
      message: `Your order #${sale.invoiceId} status has changed to "${newStatus}".`,
      link: `/dashboard/customer/order-history/${orderId}`,
      type: category,
    });
  } catch (error) {
    console.error("Error creating order status notification:", error);
  }
}

/**
 * Seed realistic notifications across all 9 categories for testing
 */
export async function seedDemoNotificationsForCustomer(userId: string) {
  const demoList = [
    {
      category: "Order" as NotificationCategory,
      title: "Order Placed Successfully! 🎉",
      message: "Your order #BB-98421 for Premium Organic Groceries has been confirmed and is being prepared.",
      link: "/dashboard/customer/order-history",
    },
    {
      category: "Delivery" as NotificationCategory,
      title: "Out for Delivery 🚚",
      message: "Rider Karim (RedX Express) is on the way with your package. Expected delivery by 4:30 PM today.",
      link: "/dashboard/customer/order-history",
    },
    {
      category: "ReturnRefund" as NotificationCategory,
      title: "Refund Approved 💳",
      message: "Your refund request of ৳ 850 for returned item #ITM-402 has been processed to your BanglaBazar Wallet.",
      link: "/dashboard/customer/wallet",
    },
    {
      category: "Wallet" as NotificationCategory,
      title: "Cashback Credited 💰",
      message: "৳ 120 promotional cashback has been added to your BanglaBazar Wallet from your weekend purchase.",
      link: "/dashboard/customer/wallet",
    },
    {
      category: "VoucherOffer" as NotificationCategory,
      title: "Exclusive 15% OFF Voucher! 🎁",
      message: "Use code BANGLA15 at checkout to enjoy 15% discount on all fresh produce. Valid till midnight!",
      link: "/vouchers",
    },
    {
      category: "Wishlist" as NotificationCategory,
      title: "Price Drop Alert! 📉",
      message: "An item in your wishlist 'Artisan Mango Juice (1L)' is now 20% off. Grab it before stocks run out!",
      link: "/dashboard/customer/wishlist",
    },
    {
      category: "StoreSeller" as NotificationCategory,
      title: "New Collection from Organic Hub 🌿",
      message: "Your followed seller Organic Hub has just launched 12 new organic spices and condiments.",
      link: "/stores",
    },
    {
      category: "System" as NotificationCategory,
      title: "Platform Upgrade Notice ⚡",
      message: "BanglaBazar customer portal has received new performance updates and express checkout features.",
      link: "/dashboard/customer",
    },
    {
      category: "Security" as NotificationCategory,
      title: "New Sign-in Detected 🔒",
      message: "A new login was recorded from Chrome on Windows (IP: 103.205.71.x). If this wasn't you, review your security settings.",
      link: "/dashboard/customer/profile",
    },
  ];

  const results = [];
  for (const item of demoList) {
    const created = await createNotification({
      userId,
      userType: "Customer",
      category: item.category,
      title: item.title,
      message: item.message,
      link: item.link,
      type: item.category,
    });
    results.push(created);
  }
  return results;
}
