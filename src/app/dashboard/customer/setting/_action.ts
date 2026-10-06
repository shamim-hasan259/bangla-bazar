"use server";

import prisma from "@/index";
import { revalidatePath } from "next/cache";
import bcrypt from "bcrypt";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createSecurityNotification, createSystemNotification } from "@/lib/notifications";

export const updateCustomerProfile = async (customerId: string, data: any) => {
    try {
        const session = await getServerSession(authOptions);
        const sessionUser = session?.user as any;

        const lookupId = customerId || sessionUser?.id || sessionUser?.customerId;
        if (!lookupId) {
            return { success: false, error: "Unauthorized: customer ID required" };
        }

        const isObjectId = typeof lookupId === "string" && /^[0-9a-fA-F]{24}$/.test(lookupId);

        const customer = await prisma.customer.findFirst({
            where: isObjectId
                ? { OR: [{ id: lookupId }, { customerId: lookupId }] }
                : { customerId: lookupId },
        });

        if (!customer) return { success: false, error: "Customer not found" };

        const trimmedName = [data.firstName?.trim(), data.lastName?.trim()].filter(Boolean).join(" ");
        const updateData: any = {
            name: trimmedName || customer.name,
            email: data.email?.trim() || null,
            phone: data.phone?.trim() || customer.phone,
        };

        if (data.photo) {
            updateData.photo = data.photo;
        }

        const updatedCustomer = await prisma.customer.update({
            where: { id: customer.id },
            data: updateData,
        });

        if (updatedCustomer) {
            try {
                await createSystemNotification(customer.id, {
                    title: "Profile Updated Successfully",
                    message: "Your account profile information has been updated.",
                    link: "/dashboard/customer/setting",
                });
            } catch (e) {}

            revalidatePath("/dashboard/customer/setting");
            revalidatePath("/dashboard/customer");
            return { success: true };
        }
        return { success: false, error: "Failed to update profile" };
    } catch (error: any) {
        console.error("Profile update error:", error);
        return { success: false, error: error.message || "Failed to update profile" };
    }
};

export const updateCustomerPhoto = async (customerId: string, photo: string) => {
    try {
        const session = await getServerSession(authOptions);
        const sessionUser = session?.user as any;

        const lookupId = customerId || sessionUser?.id || sessionUser?.customerId;
        if (!lookupId) return { success: false, error: "Unauthorized" };

        const isObjectId = typeof lookupId === "string" && /^[0-9a-fA-F]{24}$/.test(lookupId);

        const customer = await prisma.customer.findFirst({
            where: isObjectId
                ? { OR: [{ id: lookupId }, { customerId: lookupId }] }
                : { customerId: lookupId },
        });

        if (!customer) return { success: false, error: "Customer not found" };

        const updatedCustomer = await prisma.customer.update({
            where: { id: customer.id },
            data: { photo },
        });

        if (updatedCustomer) {
            revalidatePath("/dashboard/customer/setting");
            revalidatePath("/dashboard/customer");
            return { success: true, photo };
        }
        return { success: false, error: "Failed to update photo" };
    } catch (error: any) {
        console.error("Photo update error:", error);
        return { success: false, error: error.message || "Failed to update photo" };
    }
};

export const updateCustomerBillingAddress = async (customerId: string, data: any) => {
    try {
        const session = await getServerSession(authOptions);
        const sessionUser = session?.user as any;

        const lookupId = customerId || sessionUser?.id || sessionUser?.customerId;
        const lookupPhone = sessionUser?.phone;
        if (!lookupId && !lookupPhone) return { success: false, error: "Unauthorized" };

        const isObjectId = typeof lookupId === "string" && /^[0-9a-fA-F]{24}$/.test(lookupId);

        const customer = await prisma.customer.findFirst({
            where: {
                OR: [
                    ...(isObjectId ? [{ id: lookupId }] : []),
                    ...(lookupId ? [{ customerId: lookupId }, { id: lookupId }] : []),
                    ...(lookupPhone ? [{ phone: lookupPhone }] : []),
                ],
            },
            select: { id: true, address: true },
        });

        if (!customer) return { success: false, error: "Customer not found" };

        let addresses = Array.isArray(customer?.address)
            ? (customer.address as any[])
            : customer?.address && typeof customer.address === "object"
            ? [customer.address]
            : [];

        const fullName = [data.firstName?.trim(), data.lastName?.trim()].filter(Boolean).join(" ");

        const newAddress = {
            id: `addr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: fullName || "Billing Address",
            country: data.country || "Bangladesh",
            streetAddress: data.streetAddress || "",
            city: data.city || "",
            state: data.state || "",
            zipCode: data.zipCode || "",
            phone: data.phone || "",
            email: data.email || "",
            type: "billing",
            status: "active",
        };

        const billingIndex = addresses.findIndex((a: any) => a.type === "billing");
        if (billingIndex > -1) {
            addresses[billingIndex] = { ...addresses[billingIndex], ...newAddress, id: addresses[billingIndex].id || newAddress.id };
        } else {
            addresses.push(newAddress);
        }

        const updatedCustomer = await prisma.customer.update({
            where: { id: customer.id },
            data: {
                address: addresses,
            },
        });

        if (updatedCustomer) {
            revalidatePath("/dashboard/customer/setting");
            revalidatePath("/dashboard/customer/addresses");
            revalidatePath("/dashboard/customer/checkout");
            revalidatePath("/dashboard/customer");
            return { success: true };
        }
        return { success: false, error: "Failed to update billing address" };
    } catch (error: any) {
        console.error("Billing address update error:", error);
        return { success: false, error: error.message || "Failed to update billing address" };
    }
};

export const changeCustomerPassword = async (customerId: string, data: { currentPassword: string; newPassword: string }) => {
    try {
        const session = await getServerSession(authOptions);
        const sessionUser = session?.user as any;

        const lookupId = customerId || sessionUser?.id || sessionUser?.customerId;
        if (!lookupId) return { success: false, error: "Unauthorized" };

        const isObjectId = typeof lookupId === "string" && /^[0-9a-fA-F]{24}$/.test(lookupId);

        const customer = await prisma.customer.findFirst({
            where: isObjectId
                ? { OR: [{ id: lookupId }, { customerId: lookupId }] }
                : { customerId: lookupId },
        });

        if (!customer) return { success: false, error: "Customer not found" };

        if (!customer.password) {
            // OAuth/Social login customer setting password for first time
            const hashedPassword = await bcrypt.hash(data.newPassword, 10);
            await prisma.customer.update({
                where: { id: customer.id },
                data: { password: hashedPassword },
            });
            return { success: true, message: "Password created successfully" };
        }

        const isMatch = await bcrypt.compare(data.currentPassword, customer.password);
        if (!isMatch) {
            return { success: false, error: "Current password is incorrect" };
        }

        const hashedPassword = await bcrypt.hash(data.newPassword, 10);
        await prisma.customer.update({
            where: { id: customer.id },
            data: { password: hashedPassword },
        });

        try {
            await createSecurityNotification(customer.id, {
                title: "Security Alert: Password Changed 🔒",
                message: "Your account password was recently updated. If you did not make this change, please contact support immediately.",
                link: "/dashboard/customer/setting",
            });
        } catch (e) {}

        return { success: true, message: "Password changed successfully" };
    } catch (error: any) {
        console.error("Password update error:", error);
        return { success: false, error: error.message || "Failed to change password" };
    }
};
