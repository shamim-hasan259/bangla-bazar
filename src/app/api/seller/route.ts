export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../helpers/server-helpers";
import prisma from "@/index";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

// Helper function to generate a random 6-digit unique ID
const generateSellerId = async (prisma: PrismaClient) => {
  const MAX_RETRIES = 3; // Maximum number of attempts to generate a unique ID

  for (let i = 0; i < MAX_RETRIES; i++) {
    const newSellerId = Math.floor(100000 + Math.random() * 900000).toString();

    // Check if the generated ID already exists in the database
    const existingSeller = await prisma.seller.findUnique({
      where: {
        sellerId: newSellerId,
      },
    });

    if (!existingSeller) {
      return newSellerId;
    }
  }

  throw new Error("Failed to generate a unique seller ID");
};

export const POST = async (req: Request) => {
  try {
    const { name, phone, email, password, photo, nidFront, nidBack } = await req.json();

    // Check if required fields are present
    if (!name || !phone || !email || !password) {
      return NextResponse.json({ message: "Invalid data" }, { status: 422 });
    }

    await connectToDatabase();

    // Check if phone already exists
    const existingSellerPhone = await prisma.seller.findUnique({
      where: { phone },
    });
    if (existingSellerPhone) {
      return NextResponse.json({ message: "This Phone number is already registered for an account" }, { status: 400 });
    }

    // Check if email already exists
    const existingSellerEmail = await prisma.seller.findFirst({
      where: { email },
    });
    if (existingSellerEmail) {
      return NextResponse.json({ message: "This Email address is already registered for an account" }, { status: 400 });
    }

    // Generate a random 6-digit unique seller ID
    const sellerId = await generateSellerId(prisma);
    const hashedPassword = await bcrypt.hash(password, 10);

    const seller = await (prisma.seller as any).create({
      data: {
        name,
        phone,
        email,
        type: "seller",
        sellerId,
        password: hashedPassword,
        photo,
        nidFront,
        nidBack,
      },
    });

    return NextResponse.json({ seller }, { status: 201 });
  } catch (error) {
    console.error("POST /api/seller error:", error);
    return NextResponse.json(
      { message: "Server side error", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
};

// Find All seller
export const GET = async () => {
  try {
    await connectToDatabase();

    const seller = await prisma.seller.findMany();

    return NextResponse.json({ seller }, { status: 200 });
  } catch (error) {
    console.error("GET /api/seller error:", error);
    return NextResponse.json(
      { message: "server side error", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
};
