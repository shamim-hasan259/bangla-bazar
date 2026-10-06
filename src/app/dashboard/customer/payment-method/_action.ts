"use server";

import prisma from "@/index";
import { revalidatePath } from "next/cache";

export type PaymentMethodData = {
    type: string;
    provider: string;
    lastFour?: string;
    expiry?: string;
    isDefault?: boolean;
};

export const getPaymentMethods = async (customerId: string) => {
    try {
        const methods = await prisma.paymentMethod.findMany({
            where: { customerId },
            orderBy: { createdAt: "desc" },
        });
        return { success: true, data: methods };
    } catch (error: any) {
        console.error("Error fetching payment methods:", error);
        return { success: false, error: error.message };
    }
};

export const addPaymentMethod = async (customerId: string, data: PaymentMethodData) => {
    try {
        // If setting as default, unset others first
        if (data.isDefault) {
            await prisma.paymentMethod.updateMany({
                where: { customerId },
                data: { isDefault: false },
            });
        }

        const newMethod = await prisma.paymentMethod.create({
            data: {
                ...data,
                customerId,
            },
        });

        revalidatePath("/dashboard/customer/payment-method");
        return { success: true, data: newMethod };
    } catch (error: any) {
        console.error("Error adding payment method:", error);
        return { success: false, error: error.message };
    }
};

export const deletePaymentMethod = async (id: string) => {
    try {
        await prisma.paymentMethod.delete({
            where: { id },
        });
        revalidatePath("/dashboard/customer/payment-method");
        return { success: true };
    } catch (error: any) {
        console.error("Error deleting payment method:", error);
        return { success: false, error: error.message };
    }
};

export const setDefaultPaymentMethod = async (customerId: string, id: string) => {
    try {
        await prisma.paymentMethod.updateMany({
            where: { customerId },
            data: { isDefault: false },
        });

        await prisma.paymentMethod.update({
            where: { id },
            data: { isDefault: true },
        });

        revalidatePath("/dashboard/customer/payment-method");
        return { success: true };
    } catch (error: any) {
        console.error("Error setting default payment method:", error);
        return { success: false, error: error.message };
    }
};
