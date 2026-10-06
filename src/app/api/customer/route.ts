export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../helpers/server-helpers";
import prisma from "@/index";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

// Helper function to generate a random 6-digit unique ID
const generateCustomerId = async (prisma: PrismaClient) => {
  const MAX_RETRIES = 3; // Maximum number of attempts to generate a unique ID

  for (let i = 0; i < MAX_RETRIES; i++) {
    const newCustomerId = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    // Check if the generated ID already exists in the database
    const existingCustomer = await prisma.customer.findUnique({
      where: {
        customerId: newCustomerId,
      },
    });

    if (!existingCustomer) {
      return newCustomerId;
    }
  }

  throw new Error("Failed to generate a unique customer ID");
};

export const POST = async (req: Request) => {
  try {
    const { name, phone, password } = await req.json();

    // Check if required fields are present
    if (!name || !phone || !password) {
      return NextResponse.json({ message: "Please fill in all required fields (Name, Phone, Password)." }, { status: 422 });
    }

    const trimmedPhone = String(phone).trim();
    const trimmedName = String(name).trim();

    await connectToDatabase();

    // Check if customer with same phone already exists
    const existingCustomer = await prisma.customer.findUnique({
      where: { phone: trimmedPhone },
    });

    if (existingCustomer) {
      return NextResponse.json(
        { message: "This phone number is already registered. Please login.", error: { code: "P2002" } },
        { status: 409 }
      );
    }

    // Generate a random 6-digit unique customer ID
    const customerId = await generateCustomerId(prisma);

    const hashedPassword = await bcrypt.hash(password, 10);

    const customer = await prisma.customer.create({
      data: {
        name: trimmedName,
        phone: trimmedPhone,
        type: "customer",
        customerId,
        password: hashedPassword,
      },
    });

    return NextResponse.json({ customer }, { status: 201 });
  } catch (error: any) {
    console.error("Customer registration error:", error);
    if (error?.code === "P2002") {
      return NextResponse.json(
        { message: "This phone number is already registered.", error },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { message: "Server side error during registration", error: String(error?.message || error) },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
};

// Find All Customer
export const GET = async () => {
  try {
    await connectToDatabase();

    const customer = await prisma.customer.findMany();

    return NextResponse.json({ customer }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "server side error", error },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
};
