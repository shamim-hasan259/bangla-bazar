import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "../../../../../helpers/server-helpers";
import prisma from "@/index";

export const dynamic = "force-dynamic";

export const GET = async () => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    await connectToDatabase();

    const withdrawals = await (prisma as any).affiliateWithdrawal.findMany({
      where: { affiliateId: userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ withdrawals }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Failed to fetch withdrawals", error: String(error?.message || error) },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
};

export const POST = async (req: Request) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { amount, paymentMethod, accountNumber, note } = await req.json();

    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount < 500) {
      return NextResponse.json(
        { message: "Minimum withdrawal amount is ৳500." },
        { status: 422 }
      );
    }

    if (!paymentMethod || !accountNumber) {
      return NextResponse.json(
        { message: "Payment method and account number are required." },
        { status: 422 }
      );
    }

    await connectToDatabase();

    const affiliate = await (prisma as any).affiliate.findUnique({
      where: { id: userId },
    });

    if (!affiliate) {
      return NextResponse.json({ message: "Affiliate not found" }, { status: 404 });
    }

    if ((affiliate.walletBalance || 0) < numericAmount) {
      return NextResponse.json(
        {
          message: `Insufficient balance. Your available wallet balance is ৳${(
            affiliate.walletBalance || 0
          ).toFixed(2)}.`,
        },
        { status: 400 }
      );
    }

    // Deduct balance and create withdrawal request in transaction
    const [withdrawal, updatedAffiliate] = await prisma.$transaction([
      (prisma as any).affiliateWithdrawal.create({
        data: {
          affiliateId: userId,
          amount: numericAmount,
          paymentMethod: String(paymentMethod).trim(),
          accountNumber: String(accountNumber).trim(),
          note: note ? String(note).trim() : null,
          status: "Pending",
        },
      }),
      (prisma as any).affiliate.update({
        where: { id: userId },
        data: {
          walletBalance: {
            decrement: numericAmount,
          },
        },
      }),
    ]);

    return NextResponse.json(
      {
        message: "Withdrawal request submitted successfully.",
        withdrawal,
        newBalance: updatedAffiliate.walletBalance,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Affiliate withdrawal error:", error);
    return NextResponse.json(
      { message: "Failed to submit withdrawal request", error: String(error?.message || error) },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
};
