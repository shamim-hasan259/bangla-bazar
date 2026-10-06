
export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/index";
import { SSLCommerz } from "@/lib/sslcommerz";
import { saleInvetoryOut } from "../../../dashboard/seller/inventory/_action";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const data: any = {};
        formData.forEach((value, key) => {
            data[key] = value;
        });

        const { val_id, tran_id } = data;

        if (!val_id || !tran_id) {
            return NextResponse.redirect(new URL(`/error?message=Invalid Payment Data`, req.url));
        }

        // Validate payment with SSLCommerz
        const validation = await SSLCommerz.validate(val_id);
        console.log("PAYMENT VALIDATION RESPONSE:", JSON.stringify(validation, null, 2));

        if (validation.status === "VALID" || validation.status === "VALIDATED") {
            // Update Order Status
            const order = await prisma.sales.findUnique({
                where: { invoiceId: tran_id },
            });

            if (order) {
                // Update Sales/Order
                await prisma.sales.update({
                    where: { id: order.id },
                    data: {
                        status: "OrderPlaced", // Or Processing
                        duePaid: true,
                        totalRecieved: Number(validation.amount),
                        paidAmount: {
                            // Merge existing or overwrite
                            ...((order.paidAmount as object) || {}),
                            card: {
                                name: validation.card_type || "Online Payment",
                                amount: Number(validation.amount),
                                method: 'SSLCommerz',
                                trxId: val_id
                            }
                        }
                    },
                });

                // Decrement inventory stock on successful online payment
                if (order.status === "Pending") {
                    const productsList = (order.soldProducts as any[]) || [];
                    const mappedProducts = productsList.map((p: any) => ({
                        id: p.productId || p.id,
                        variantId: p.variantId || null,
                        qty: p.qty
                    }));
                    await saleInvetoryOut(mappedProducts);
                }

                // Create Transaction Record only if userId is present (as updatedUserId is required)
                if (order.userId) {
                    await prisma.transactions.create({
                        data: {
                            transactionId: val_id,
                            userId: order.userId,
                            customerId: order.customerId,
                            amount: Number(validation.amount),
                            paymentType: "Payment",
                            type: "Collection",
                            paymentMethodType: "Card", // Or detect from validation.card_type
                            invoiceNo: tran_id,
                            updatedUserId: order.userId,
                            date: new Date().toISOString(),
                            note: "SSLCommerz Payment Success",
                            status: "Active"
                        }
                    });
                }

                return NextResponse.redirect(new URL(`/dashboard/customer/order-history/${order.id}?payment=success&clear_cart=true`, req.url));
            }
        }

        return NextResponse.redirect(new URL(`/error?message=Payment Validation Failed`, req.url));

    } catch (error) {
        console.error("Payment Success Error:", error);
        return NextResponse.redirect(new URL(`/error?message=Payment Processing Error`, req.url));
    }
}
