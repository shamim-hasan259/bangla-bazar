"use server";
import prisma from "@/index";

export const searchOrder = async (query: string) => {
  try {
    const order = await prisma.sales.findFirst({
      where: {
        OR: [
          { id: query },
          { trackingCode: query }
        ]
      },
      select: {
        id: true,
        status: true,
        trackingCode: true,
        courierName: true,
        total: true,
        grossTotal: true,
        createdAt: true,
      }
    });

    if (order) {
      return { 
        success: true, 
        order: {
          ...order,
          totalPrice: order.grossTotal || order.total || 0
        } 
      };
    }
    return { success: false, message: "No order found with this tracking code or ID." };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Invalid search query or server error." };
  }
};
