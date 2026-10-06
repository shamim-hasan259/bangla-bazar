import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "../../../../../helpers/server-helpers";
import prisma from "@/index";
import bcrypt from "bcrypt";

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
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        photo: true,
        affiliateCode: true,
        walletBalance: true,
        totalEarnings: true,
        commissionRate: true,
        paymentMethod: true,
        paymentNumber: true,
        paymentDetails: true,
        clicks: true,
        conversions: true,
        status: true,
        createdAt: true,
      },
    });

    if (!affiliate) {
      return NextResponse.json({ message: "Affiliate not found" }, { status: 404 });
    }

    return NextResponse.json({ affiliate }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Failed to fetch affiliate profile", error: String(error?.message || error) },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
};

export const PATCH = async (req: Request) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await req.json();
    const { name, email, paymentMethod, paymentNumber, currentPassword, newPassword } = body;

    await connectToDatabase();

    const affiliate = await (prisma as any).affiliate.findUnique({
      where: { id: userId },
    });

    if (!affiliate) {
      return NextResponse.json({ message: "Affiliate not found" }, { status: 404 });
    }

    const updateData: any = {};
    if (name) updateData.name = String(name).trim();
    if (email !== undefined) updateData.email = email ? String(email).trim().toLowerCase() : null;
    if (paymentMethod) updateData.paymentMethod = String(paymentMethod).trim();
    if (paymentNumber) updateData.paymentNumber = String(paymentNumber).trim();

    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { message: "Current password is required to set a new password." },
          { status: 422 }
        );
      }
      const isMatch = await bcrypt.compare(currentPassword, affiliate.password);
      if (!isMatch) {
        return NextResponse.json(
          { message: "Current password is incorrect." },
          { status: 400 }
        );
      }
      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    const updated = await (prisma as any).affiliate.update({
      where: { id: userId },
      data: updateData,
    });

    return NextResponse.json(
      { message: "Profile updated successfully", affiliate: updated },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Affiliate profile update error:", error);
    return NextResponse.json(
      { message: "Failed to update profile", error: String(error?.message || error) },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
};
