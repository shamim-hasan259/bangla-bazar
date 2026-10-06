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

    const affiliate = await (prisma as any).affiliate.findUnique({
      where: { id: userId },
      include: {
        referrals: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
        withdrawals: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        links: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!affiliate) {
      return NextResponse.json({ message: "Affiliate not found" }, { status: 404 });
    }

    // Compute monthly earnings chart data
    const now = new Date();
    const monthlyStats: { month: string; earnings: number; clicks: number }[] = [];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = months[d.getMonth()];
      
      const monthReferrals = (affiliate.referrals || []).filter((r: any) => {
        const rDate = new Date(r.createdAt);
        return rDate.getMonth() === d.getMonth() && rDate.getFullYear() === d.getFullYear();
      });

      const earnings = monthReferrals.reduce((sum: number, r: any) => sum + (r.commission || 0), 0);
      monthlyStats.push({
        month: monthName,
        earnings: earnings > 0 ? earnings : Math.floor(Math.random() * 0),
        clicks: Math.floor(affiliate.clicks / 6) || 0,
      });
    }

    return NextResponse.json({
      affiliate: {
        id: affiliate.id,
        name: affiliate.name,
        phone: affiliate.phone,
        email: affiliate.email,
        affiliateCode: affiliate.affiliateCode,
        walletBalance: affiliate.walletBalance || 0,
        totalEarnings: affiliate.totalEarnings || 0,
        commissionRate: affiliate.commissionRate || 5,
        paymentMethod: affiliate.paymentMethod || "Bkash",
        paymentNumber: affiliate.paymentNumber || affiliate.phone,
        clicks: affiliate.clicks || 0,
        conversions: affiliate.conversions || 0,
        status: affiliate.status,
        createdAt: affiliate.createdAt,
      },
      referrals: affiliate.referrals || [],
      withdrawals: affiliate.withdrawals || [],
      links: affiliate.links || [],
      monthlyStats,
    });
  } catch (error: any) {
    console.error("Failed to fetch affiliate stats:", error);
    return NextResponse.json(
      { message: "Server error", error: String(error?.message || error) },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
};
