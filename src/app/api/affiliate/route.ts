import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../helpers/server-helpers";
import prisma from "@/index";
import bcrypt from "bcrypt";
import sendMessage from "@/lib/smsSystem";
import sendEmail from "@/lib/emailSystem";

// Helper function to generate unique affiliate code (e.g., AFF-839201)
const generateAffiliateCode = async () => {
  const MAX_RETRIES = 5;
  for (let i = 0; i < MAX_RETRIES; i++) {
    const randomCode = "AFF-" + Math.floor(100000 + Math.random() * 900000).toString();
    const existing = await (prisma as any).affiliate.findUnique({
      where: { affiliateCode: randomCode },
    });
    if (!existing) {
      return randomCode;
    }
  }
  return "AFF-" + Date.now().toString().slice(-6);
};

export const POST = async (req: Request) => {
  try {
    const body = await req.json();
    const { name, phone, email, password, paymentMethod, paymentNumber } = body;

    if (!name || !phone || !password) {
      return NextResponse.json(
        { message: "Please fill in all required fields (Name, Phone, Password)." },
        { status: 422 }
      );
    }

    const trimmedPhone = String(phone).trim();
    const trimmedName = String(name).trim();
    const trimmedEmail = email ? String(email).trim().toLowerCase() : null;

    await connectToDatabase();

    // Check if affiliate exists
    const existingAffiliate = await (prisma as any).affiliate.findFirst({
      where: {
        OR: [
          { phone: trimmedPhone },
          ...(trimmedEmail ? [{ email: trimmedEmail }] : []),
        ],
      },
    });

    if (existingAffiliate) {
      return NextResponse.json(
        {
          message: "An affiliate with this phone number or email already exists. Please login.",
          error: { code: "P2002" },
        },
        { status: 409 }
      );
    }

    const affiliateCode = await generateAffiliateCode();
    const hashedPassword = await bcrypt.hash(password, 10);

    const affiliate = await (prisma as any).affiliate.create({
      data: {
        name: trimmedName,
        phone: trimmedPhone,
        email: trimmedEmail,
        password: hashedPassword,
        affiliateCode,
        type: "affiliate",
        status: "Active",
        walletBalance: 0,
        totalEarnings: 0,
        commissionRate: 5, // 5% base commission
        paymentMethod: paymentMethod || "Bkash",
        paymentNumber: paymentNumber || trimmedPhone,
        clicks: 0,
        conversions: 0,
      },
    });

    // Send SMS notification if configured
    try {
      await sendMessage({
        to: trimmedPhone,
        message: `Welcome ${trimmedName} to Bangla Bazar Affiliate Program! Your Affiliate Code is: ${affiliateCode}. Login at banglabazar.com/auth/affiliate/login`,
      });
    } catch (smsError) {
      console.warn("Affiliate SMS notification failed:", smsError);
    }

    // Send Email notification if email provided
    if (trimmedEmail) {
      try {
        await sendEmail({
          to: trimmedEmail,
          subject: "Welcome to Bangla Bazar Affiliate Program",
          message: `Dear ${trimmedName},\n\nWelcome to Bangla Bazar Affiliate Program! Your account is active.\nYour Affiliate Code is: ${affiliateCode}\nBase Commission Rate: 5%\n\nLogin to your dashboard to start earning: /dashboard/affiliate`,
        });
      } catch (emailError) {
        console.warn("Affiliate email notification failed:", emailError);
      }
    }

    return NextResponse.json(
      {
        message: "Affiliate registered successfully",
        affiliate: {
          id: affiliate.id,
          name: affiliate.name,
          phone: affiliate.phone,
          email: affiliate.email,
          affiliateCode: affiliate.affiliateCode,
          type: affiliate.type,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Affiliate registration error:", error);
    if (error?.code === "P2002") {
      return NextResponse.json(
        { message: "This phone number or email is already registered.", error },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { message: "Server error during affiliate registration", error: String(error?.message || error) },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
};

export const GET = async () => {
  try {
    await connectToDatabase();
    const affiliates = await (prisma as any).affiliate.findMany({
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        affiliateCode: true,
        status: true,
        walletBalance: true,
        totalEarnings: true,
        commissionRate: true,
        clicks: true,
        conversions: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ affiliates }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Failed to fetch affiliates", error: String(error?.message || error) },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
};
