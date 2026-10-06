/**
 * Client-side helper to safely trigger customer notifications in the background
 */
export function sendClientNotification({
  category,
  title,
  message,
  link,
}: {
  category:
    | "Order"
    | "Delivery"
    | "ReturnRefund"
    | "Wallet"
    | "VoucherOffer"
    | "Wishlist"
    | "StoreSeller"
    | "System"
    | "Security";
  title: string;
  message: string;
  link?: string;
}) {
  if (typeof window === "undefined") return;

  try {
    fetch("/api/customer/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category,
        title,
        message,
        link,
      }),
    }).catch(() => {});
  } catch (e) {
    // Ignore error
  }
}
