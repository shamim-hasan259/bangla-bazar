
export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/index";

export async function POST(req: NextRequest) {
    const formData = await req.formData();
    const tran_id = formData.get("tran_id") as string;

    if (tran_id) {
        await prisma.sales.update({
            where: { invoiceId: tran_id },
            data: {
                status: "Canceled",
                note: "Payment Failed"
            }
        });
    }

    return NextResponse.redirect(new URL(`/error?message=Payment Failed. Please try again.`, req.url));
}
