export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { bKash } from "@/lib/bkash";
import prisma from "@/index";
import { saleInvetoryOut } from "../../../../dashboard/seller/inventory/_action";

/**
 * Handle bKash Callback and Execute payment
 * This is the GET endpoint where bKash redirects the user
 */
export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const paymentID = searchParams.get('paymentID');
    const status = searchParams.get('status');

    try {
        if (!paymentID || status !== "success") {
            return NextResponse.redirect(new URL(`/error?message=bKash Payment ${status || 'Failed'}`, req.url));
        }

        // 1. Get Token
        const idToken = await bKash.getToken();

        // 2. Execute Payment
        const executeResult = await bKash.executePayment(paymentID, idToken);

        // statusCode "0000" means success
        if (executeResult.statusCode === "0000") {
            const invoiceId = executeResult.merchantInvoiceNumber;

            // 3. Update Order and create Transaction
            const order = await prisma.sales.findUnique({
                where: { invoiceId: invoiceId },
            });

            if (order) {
                await prisma.sales.update({
                    where: { id: order.id },
                    data: {
                        status: "OrderPlaced",
                        duePaid: true,
                        totalRecieved: Number(executeResult.amount),
                        paidAmount: {
                            ...((order.paidAmount as object) || {}),
                            mfs: {
                                name: "bKash",
                                amount: Number(executeResult.amount),
                                senderNo: executeResult.customerMsisdn,
                                trxId: executeResult.trxID
                            }
                        }
                    },
                });

                // Decrement inventory stock on successful bKash payment
                if (order.status === "Pending") {
                    const productsList = (order.soldProducts as any[]) || [];
                    const mappedProducts = productsList.map((p: any) => ({
                        id: p.productId || p.id,
                        variantId: p.variantId || null,
                        qty: p.qty
                    }));
                    await saleInvetoryOut(mappedProducts);
                }

                // Create Transaction record for history and tracking
                await prisma.transactions.create({
                    data: {
                        transactionId: executeResult.trxID,
                        paymentId: paymentID,
                        userId: order.userId,
                        customerId: order.customerId,
                        amount: Number(executeResult.amount),
                        paymentType: "Payment",
                        type: "Collection",
                        paymentMethodType: "bKash",
                        invoiceNo: invoiceId,
                        date: new Date().toISOString(),
                        note: "bKash Payment Successful",
                        status: "Active"
                    }
                });

                return NextResponse.redirect(new URL(`/dashboard/customer/order-history/${order.id}?payment=success&clear_cart=true`, req.url));
            }
        }

        console.error("bKash Execution Failed:", executeResult);
        return NextResponse.redirect(new URL(`/error?message=bKash Execution Failed: ${executeResult.statusMessage}`, req.url));

    } catch (error: any) {
        console.error("bKash Callback Error:", error);
        return NextResponse.redirect(new URL(`/error?message=Payment Processing Error`, req.url));
    }
}
