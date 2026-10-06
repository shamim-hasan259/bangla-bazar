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

    const links = await (prisma as any).affiliateLink.findMany({
      where: { affiliateId: userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ links }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Failed to fetch links", error: String(error?.message || error) },
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
    const body = await req.json();
    const { targetUrl, customSlug, productId } = body;

    if (!targetUrl) {
      return NextResponse.json({ message: "Target URL is required" }, { status: 422 });
    }

    await connectToDatabase();

    const newLink = await (prisma as any).affiliateLink.create({
      data: {
        affiliateId: userId,
        targetUrl: String(targetUrl).trim(),
        customSlug: customSlug ? String(customSlug).trim() : null,
        productId: productId || null,
        clicks: 0,
        conversions: 0,
        earnings: 0,
      },
    });

    return NextResponse.json({ link: newLink }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Failed to create affiliate link", error: String(error?.message || error) },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
};
