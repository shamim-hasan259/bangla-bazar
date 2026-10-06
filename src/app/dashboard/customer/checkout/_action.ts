"use server";

import prisma from "@/index";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateId } from "@/lib/idGenerator";
import bcrypt from "bcrypt";
import sendMessage from "@/lib/smsSystem";
import { SSLCommerz } from "@/lib/sslcommerz";
import { bKash } from "@/lib/bkash";
import { saleInvetoryOut } from "../../seller/inventory/_action";
import { createOrderNotification, createDeliveryNotification, createNotification } from "@/lib/notifications";

// Helper function to generate a random 6-digit unique ID
const generateCustomerId = async () => {
    const MAX_RETRIES = 3;
    for (let i = 0; i < MAX_RETRIES; i++) {
        const newCustomerId = Math.floor(100000 + Math.random() * 900000).toString();
        const existingCustomer = await prisma.customer.findUnique({
            where: { customerId: newCustomerId },
        });
        if (!existingCustomer) return newCustomerId;
    }
    throw new Error("Failed to generate a unique customer ID");
};

export const createCustomerOrder = async (orderData: any) => {
    try {
        const session = await getServerSession(authOptions);
        const userType = String((session?.user as any)?.type || (session?.user as any)?.role || "").toLowerCase();

        if (userType === "admin") {
            return {
                success: false,
                error: "Admin accounts are not allowed to place product orders. Please use a customer account.",
            };
        }

        let {
            customerId,
            userId,
            items,
            totalAmount,
            totalQuantity,
            deliveryAddress,
            paymentMethod = "Cash on Delivery",
        } = orderData;

        // Auto-Register Guest if customerId is missing
        if (!customerId && deliveryAddress?.phone) {
            const phone = deliveryAddress.phone;
            const name = deliveryAddress.name;

            // Check if customer already exists with this phone
            const existingCustomer = await prisma.customer.findFirst({
                where: { phone: phone }
            });

            if (existingCustomer) {
                customerId = existingCustomer.id;
            } else {
                // Register new customer
                const hashedPassword = await bcrypt.hash(phone, 10);
                const uniqueCusId = await generateCustomerId();

                const newCustomer = await prisma.customer.create({
                    data: {
                        name: name,
                        phone: phone,
                        password: hashedPassword,
                        customerId: uniqueCusId,
                        status: "Active",
                        type: "customer",
                    }
                });

                customerId = newCustomer.id;

                // Send SMS with login details
                const to = phone;
                const message = `Welcome to Bangla Bazar! Your account has been created. Login with Phone: ${phone} and Password: ${phone}. Shop more at banglamart.com`;
                await sendMessage({ message, to });
            }
        }

        const invoiceId = await generateId("sale");

        // Map checkout items to the Sales model's product structure
        const soldProducts = items.map((item: any) => {
            const rawId = item.productId || item.id || "";
            const cleanId = typeof rawId === "string" ? rawId.split("_")[0] : String(rawId);
            return {
                productId: cleanId,
                variantId: item.variantId || null,
                name: item.name || "Product",
                price: Number(item.price) || 0,
                qty: Number(item.quantity) || 1,
                total: (Number(item.price) || 0) * (Number(item.quantity) || 1),
                photo: typeof item.photo === "string" ? item.photo : (Array.isArray(item.photo) ? item.photo[0] : ""),
                articleCode: "",
            };
        });

        // Fetch products safely to extract sellerIds and storeIds
        const productIds = items.map((item: any) => {
            const rawId = item.productId || item.id || "";
            return typeof rawId === "string" ? rawId.split("_")[0] : String(rawId);
        });
        const validProductHexIds = productIds.filter((id: string) => /^[0-9a-fA-F]{24}$/.test(id));
        
        let dbProducts: any[] = [];
        if (validProductHexIds.length > 0) {
            try {
                dbProducts = await prisma.product.findMany({
                    where: { id: { in: validProductHexIds } },
                    select: { sellerId: true, storeId: true, store: { select: { sellerId: true } } }
                });
            } catch (e) {
                console.error("Error fetching dbProducts:", e);
            }
        }
        
        const sellerIds = Array.from(new Set(dbProducts.map(p => p.sellerId || p.store?.sellerId).filter(Boolean))) as string[];
        const storeIds = Array.from(new Set(dbProducts.map(p => p.storeId).filter(Boolean))) as string[];

        // Check if current user is a seller attempting to order their own product
        try {
            const session = await getServerSession(authOptions);
            let checkSellerId: string | null = null;

            if (session?.user) {
                const sellerBySession = await prisma.seller.findFirst({
                    where: {
                        OR: [
                            { id: session.user.id },
                            { phone: (session.user as any).phone || undefined },
                            { email: session.user.email || undefined },
                        ],
                    },
                    select: { id: true },
                });
                if (sellerBySession) checkSellerId = sellerBySession.id;
            }

            if (!checkSellerId && customerId) {
                const customer = await prisma.customer.findFirst({
                    where: {
                        OR: [{ id: customerId }, { customerId: customerId }],
                    },
                    select: { phone: true, email: true },
                });
                if (customer) {
                    const sellerByCustomer = await prisma.seller.findFirst({
                        where: {
                            OR: [
                                { phone: customer.phone || undefined },
                                { email: customer.email || undefined },
                            ],
                        },
                        select: { id: true },
                    });
                    if (sellerByCustomer) checkSellerId = sellerByCustomer.id;
                }
            }

            if (checkSellerId) {
                const ownsProduct = dbProducts.some(
                    (p) => p.sellerId === checkSellerId || p.store?.sellerId === checkSellerId
                );
                if (ownsProduct) {
                    return {
                        success: false,
                        error: "You cannot order your own product. Sellers are not allowed to purchase products from their own store.",
                    };
                }
            }
        } catch (authErr) {
            console.error("Seller ownership check error:", authErr);
        }

        const isCustomerValidHex = customerId && /^[0-9a-fA-F]{24}$/.test(customerId);
        const isUserValidHex = userId && /^[0-9a-fA-F]{24}$/.test(userId);

        const trackingCode = `BB-TRK-${invoiceId ? invoiceId.replace(/[^0-9]/g, '') : Math.floor(10000000 + Math.random() * 90000000)}`;
        const courierName = "Bangla Bazar Express";

        // @ts-ignore
        const order = await prisma.sales.create({
            data: {
                invoiceId,
                source: "Online",
                status: "Pending",
                customer: isCustomerValidHex ? { connect: { id: customerId } } : undefined,
                user: isUserValidHex ? { connect: { id: userId } } : undefined,
                totalItem: totalQuantity,
                total: Math.round(totalAmount),
                discount: 0,
                vat: 0,
                grossTotal: Math.round(totalAmount),
                grossTotalRound: Math.round(totalAmount),
                totalRecievable: Math.round(totalAmount),
                totalRecieved: 0,
                changeAmount: 0,
                prevDueAmount: 0,
                soldProducts,
                deliveryAddress: deliveryAddress,
                deliveryDate: new Date(),
                sellerIds: sellerIds,
                storeIds: storeIds,
                courierName: courierName,
                trackingCode: trackingCode,
                paidAmount: {
                    cash: orderData?.paymentDetails?.cash || 0,
                    card: orderData?.paymentDetails?.card || { name: "", amount: 0 },
                    mfs: orderData?.paymentDetails?.mfs || { name: "", amount: 0 },
                },
                orderCalculation: {
                    totalItem: totalQuantity,
                    total: Math.round(totalAmount),
                    vat: 0,
                    discount: 0,
                    grossTotal: Math.round(totalAmount),
                },
                soldCalculation: {
                    totalItem: totalQuantity,
                    total: Math.round(totalAmount),
                    vat: 0,
                    discount: 0,
                    grossTotal: Math.round(totalAmount),
                }
            },
        });

        if (order) {
            // Mark the voucher as used if one was applied
            if (orderData.voucherId && customerId) {
                try {
                    await prisma.customerVoucher.update({
                        where: {
                            customerId_voucherId: {
                                customerId,
                                voucherId: orderData.voucherId
                            }
                        },
                        data: {
                            status: "Used",
                            usedAt: new Date()
                        }
                    });
                    await prisma.storeVoucher.update({
                        where: { id: orderData.voucherId },
                        data: {
                            usedCount: { increment: 1 }
                        }
                    });
                } catch (err) {
                    console.error("Error updating voucher status on order confirmation:", err);
                }
            }

            // Handle SSLCommerz Payment
            if (paymentMethod === "SSLCommerz") {
                const paymentInit = await SSLCommerz.init({
                    total_amount: totalAmount,
                    currency: "BDT",
                    tran_id: invoiceId, // Use Invoice ID as Transaction ID
                    success_url: `${process.env.NEXTAUTH_URL}/api/payment/success`,
                    fail_url: `${process.env.NEXTAUTH_URL}/api/payment/fail`,
                    cancel_url: `${process.env.NEXTAUTH_URL}/api/payment/cancel`,
                    cus_name: deliveryAddress.name || "Customer",
                    cus_email: deliveryAddress.email || "customer@example.com",
                    cus_add1: deliveryAddress.streetAddress || "Dhaka",
                    cus_city: deliveryAddress.city || "Dhaka",
                    cus_postcode: deliveryAddress.zipCode || "1000",
                    cus_country: deliveryAddress.country || "Bangladesh",
                    cus_phone: deliveryAddress.phone,
                    shipping_method: "NO",
                    product_name: "Ecommerce Products",
                    product_category: "Ecommerce",
                    product_profile: "general"
                });

                if (paymentInit.status === 'SUCCESS') {
                    return { success: true, url: paymentInit.GatewayPageURL, orderId: order.id };
                } else {
                    return { success: false, error: "Payment Initialization Failed" };
                }
            }

            // Handle bKash Payment
            if (paymentMethod === "bKash") {
                try {
                    const idToken = await bKash.getToken();
                    const paymentResult = await bKash.createPayment(totalAmount, invoiceId, idToken);

                    if (paymentResult.statusCode === "0000") {
                        return { success: true, url: paymentResult.bkashURL, orderId: order.id };
                    } else {
                        return { success: false, error: paymentResult.statusMessage || "bKash Initialization Failed" };
                    }
                } catch (error: any) {
                    return { success: false, error: error.message };
                }
            }

            // Decrement inventory stock for COD orders
            if (paymentMethod !== "SSLCommerz" && paymentMethod !== "bKash") {
                const mappedProducts = soldProducts
                    .map((p: any) => ({
                        id: p.productId || p.id,
                        variantId: p.variantId || null,
                        qty: p.qty,
                    }))
                    .filter((p: any) => p.id && /^[0-9a-fA-F]{24}$/.test(p.id));

                if (mappedProducts.length > 0) {
                    try {
                        await saleInvetoryOut(mappedProducts);
                    } catch (e) {
                        console.error("Inventory deduction error:", e);
                    }
                }
            }

            // Create customer notifications for Order & Delivery tracking
            if (customerId) {
                try {
                    await createOrderNotification(customerId, {
                        orderId: order.id,
                        invoiceId: order.invoiceId,
                        title: "Order Placed Successfully! 🎉",
                        message: `Your order #${order.invoiceId} for ${totalQuantity} item(s) totaling ৳ ${Math.round(totalAmount)} has been placed.`,
                        link: `/dashboard/customer/order-history/${order.id}`,
                    });

                    await createDeliveryNotification(customerId, {
                        trackingCode: trackingCode,
                        courierName: courierName,
                        title: "Delivery Initiated 🚚",
                        message: `Tracking code #${trackingCode} assigned via ${courierName}. We will notify you once package is out for delivery.`,
                        link: `/dashboard/customer/order-history/${order.id}`,
                    });
                } catch (notifErr) {
                    console.error("Customer notification creation error on checkout:", notifErr);
                }
            }

            // Create notification for Seller(s)
            if (sellerIds && sellerIds.length > 0) {
                try {
                    for (const sId of sellerIds) {
                        await createNotification({
                            userId: sId,
                            userType: "Seller",
                            category: "Order",
                            title: "New Customer Order Received! 🛒",
                            message: `You received a new order #${order.invoiceId} for ${totalQuantity} item(s) totaling ৳ ${Math.round(totalAmount)}. Check order details to process shipment.`,
                            link: `/dashboard/seller/orders`,
                            type: "Order",
                        });
                    }
                } catch (sellerNotifErr) {
                    console.error("Seller notification creation error on checkout:", sellerNotifErr);
                }
            }

            revalidatePath("/dashboard/customer/order-history");
            revalidatePath("/dashboard/customer/notifications");
            revalidatePath("/dashboard/seller/notifications");
            revalidatePath("/dashboard/seller/orders");
            return { success: true, orderId: order.id, invoiceId: order.invoiceId };
        }

        return { success: false, error: "Failed to create order" };
    } catch (error: any) {
        console.error("Order creation error:", error);
        return { success: false, error: error.message };
    }
};

export const saveCustomerShippingAddress = async (customerId: string, data: any) => {
    try {
        const customer = await prisma.customer.findFirst({
            where: {
                OR: [{ id: customerId }, { customerId: customerId }],
            },
            select: { id: true, address: true }
        });

        if (!customer) return { success: false, error: "Customer not found" };

        let addresses = Array.isArray(customer?.address) ? (customer.address as any[]) : [];

        const newAddress = {
            id: data.id || `addr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: data.name,
            country: data.country || "Bangladesh",
            district: data.district,
            city: data.city,
            streetAddress: data.streetAddress,
            zipCode: data.zipCode,
            phone: data.phone,
            email: data.email || "",
            type: "shipping",
            status: "active"
        };

        // Find if there is already an active shipping address
        const shippingIndex = addresses.findIndex(a => a.type === "shipping");
        if (shippingIndex > -1) {
            addresses[shippingIndex] = newAddress;
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
            revalidatePath("/dashboard/customer/checkout");
            return { success: true, address: newAddress };
        }
        return { success: false, error: "Failed to update shipping address" };
    } catch (error: any) {
        console.error("Shipping address update error:", error);
        return { success: false, error: error.message };
    }
};

