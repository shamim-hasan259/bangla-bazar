export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prisma from "@/index";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug")?.toLowerCase().trim();

    if (!slug) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    // Reserved words list
    const reservedWords = [
      "admin",
      "api",
      "dashboard",
      "store",
      "seller",
      "customer",
      "auth",
      "login",
      "register",
      "checkout",
      "cart",
      "payment",
      "support",
    ];

    if (reservedWords.includes(slug)) {
      return NextResponse.json({ available: false });
    }

    const existingStore = await prisma.store.findUnique({
      where: {
        slug: slug,
      },
    });

    return NextResponse.json({ available: !existingStore });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
