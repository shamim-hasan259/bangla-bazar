
import { NextRequest, NextResponse } from "next/server";
import { bKash } from "@/lib/bkash";
import prisma from "@/index";

/**
 * Initiate bKash Payment
 * Returns the bkash checkout URL
 */
export async function POST(req: NextRequest) {
    try {
        const { amount, invoiceId } = await req.json();

        if (!amount || !invoiceId) {
            return NextResponse.json({ error: "Amount and Invoice ID are required" }, { status: 400 });
        }

        // 1. Get Authentication Token
        const idToken = await bKash.getToken();

        // 2. Create Payment Request
        const paymentResult = await bKash.createPayment(amount, invoiceId, idToken);

        if (paymentResult.statusCode === "0000") {
            return NextResponse.json({
                success: true,
                bkashURL: paymentResult.bkashURL,
                paymentID: paymentResult.paymentID
            });
        } else {
            return NextResponse.json({
                error: paymentResult.statusMessage || "Failed to create bKash payment"
            }, { status: 400 });
        }

    } catch (error: any) {
        console.error("bKash Initiate Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
