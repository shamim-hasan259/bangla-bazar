"use server";
import prisma from "@/index";
import { revalidatePath } from "next/cache";
import { createOrderStatusNotification } from "@/lib/notifications";
import { returnInvetoryIn } from "../inventory/_action";

export const updateOrderTracking = async (orderId: string, trackingCode: string, courierName: string, status: any) => {
  try {
    const updated = await prisma.sales.update({
      where: { id: orderId },
      data: {
        trackingCode,
        courierName,
        status,
      }
    });
    
    if (updated) {
      // Send dynamic order update notification
      await createOrderStatusNotification(orderId, status);

      // Handle 7-Day Escrow Split Release Pipeline when Delivered or Complete
      if ((status === "Delivered" || status === "Complete") && updated.sellerIds && updated.sellerIds.length > 0) {
        const sellerId = updated.sellerIds[0];
        const existingEscrow = await prisma.escrowHolding.findFirst({
          where: { orderId: updated.id }
        });

        if (!existingEscrow) {
          const seller = await prisma.seller.findUnique({ where: { id: sellerId } });
          const commRate = seller?.commissionRate || 10;
          const grossAmount = updated.grossTotal || updated.total || 0;
          const netEarnings = grossAmount * ((100 - commRate) / 100);

          const release40Amount = netEarnings * 0.40;
          const hold60Amount = netEarnings * 0.60;

          const releaseDate = new Date();
          releaseDate.setDate(releaseDate.getDate() + 7);

          // 1. Immediately disburse 40% to Seller's payout wallet
          await prisma.seller.update({
            where: { id: sellerId },
            data: {
              walletBalance: { increment: release40Amount }
            }
          });

          // 2. Schedule remaining 60% in EscrowHolding pipeline for 7 days
          await prisma.escrowHolding.create({
            data: {
              orderId: updated.id,
              sellerId: sellerId,
              totalAmount: netEarnings,
              heldAmount: hold60Amount,
              released40: true,
              released60: false,
              deliveryDate: new Date(),
              releaseDate: releaseDate,
              status: "PartiallyReleased"
            }
          });
        }
      }
      
      revalidatePath("/dashboard/seller/orders");
      return true;
    }
    return false;
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const approveReturnOrder = async (orderId: string) => {
  try {
    // 1. Fetch order
    const order = await prisma.sales.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      return { success: false, message: "Order not found" };
    }

    if (order.status !== "Return") {
      return { success: false, message: "Order is not in Return status" };
    }

    // 2. Process refund to customer's wallet
    if (order.customerId) {
      await prisma.customer.update({
        where: { id: order.customerId },
        data: {
          walletBalance: {
            increment: order.grossTotal || order.total || 0
          }
        }
      });
    }

    // 3. Adjust Seller settlement & Escrow
    const existingEscrow = await prisma.escrowHolding.findFirst({
      where: { orderId: order.id }
    });

    if (existingEscrow) {
      // Mark escrow as Refunded
      await prisma.escrowHolding.update({
        where: { id: existingEscrow.id },
        data: {
          status: "Refunded",
          released60: false,
        }
      });

      // Deduct the 40% pre-released earnings from the seller's wallet
      if (order.sellerIds && order.sellerIds.length > 0) {
        const sellerId = order.sellerIds[0];
        const seller = await prisma.seller.findUnique({ where: { id: sellerId } });
        const commRate = seller?.commissionRate || 10;
        const grossAmount = order.grossTotal || order.total || 0;
        const netEarnings = grossAmount * ((100 - commRate) / 100);
        const release40Amount = netEarnings * 0.40;

        await prisma.seller.update({
          where: { id: sellerId },
          data: {
            walletBalance: {
              decrement: release40Amount
            }
          }
        });
      }
    }

    // 4. Restore Inventory Stock
    const mappedProducts = order.soldProducts.map((p: any) => ({
      id: p.productId || p.id,
      qty: p.qty || p.quantity || 1
    }));
    await returnInvetoryIn(mappedProducts);

    // 5. Update order status and trigger notification
    const updated = await prisma.sales.update({
      where: { id: orderId },
      data: {
        status: "Canceled"
      }
    });

    if (updated) {
      await createOrderStatusNotification(orderId, "Canceled");
      revalidatePath("/dashboard/seller/orders");
      revalidatePath("/dashboard/seller/orders/returns");
      return { success: true };
    }

    return { success: false, message: "Failed to update order status" };
  } catch (error) {
    console.error("Error approving return order:", error);
    return { success: false, message: "Server error" };
  }
};

export const disputeReturnOrder = async (orderId: string) => {
  try {
    // 1. Fetch order
    const order = await prisma.sales.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      return { success: false, message: "Order not found" };
    }

    if (order.status !== "Return") {
      return { success: false, message: "Order is not in Return status" };
    }

    // 2. Revert status back to Delivered
    const updated = await prisma.sales.update({
      where: { id: orderId },
      data: {
        status: "Delivered"
      }
    });

    if (updated) {
      await createOrderStatusNotification(orderId, "Delivered");
      revalidatePath("/dashboard/seller/orders");
      revalidatePath("/dashboard/seller/orders/returns");
      return { success: true };
    }

    return { success: false, message: "Failed to update order status" };
  } catch (error) {
    console.error("Error disputing return order:", error);
    return { success: false, message: "Server error" };
  }
};
