export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../helpers/server-helpers";
import prisma from "@/index";
import bcrypt from "bcrypt";
import { verifyAdminRequest } from "@/lib/adminAuth";

// create User / Staff
export const POST = async (req: Request) => {
  try {
    const auth = await verifyAdminRequest();
    if (!auth.authorized) {
      return auth.response;
    }

    let { name, phone, email, username, password, type = "Manager", status = "Active" } =
      await req.json();

    if (!name || !phone || !username || !password) {
      return NextResponse.json({ message: "Please fill in all required fields (Name, Phone, Username, Password)" }, { status: 422 });
    }

    await connectToDatabase();

    // Check existing user
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: username.trim() },
          { phone: phone.trim() },
          ...(email?.trim() ? [{ email: email.trim() }] : []),
        ],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "A user with this username, phone number, or email already exists." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        phone: phone.trim(),
        email: email?.trim() || null,
        username: username.trim(),
        password: hashedPassword,
        type: (type as any) || "Admin",
        status: (status as any) || "Active",
      },
    });

    return NextResponse.json({ user, message: "Admin account created successfully" }, { status: 201 });
  } catch (error: any) {
    console.error("User creation error:", error);
    return NextResponse.json(
      { message: error?.message || "Server side error during registration", error },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
};

// Find All Users
export const GET = async () => {
  try {
    const auth = await verifyAdminRequest();
    if (!auth.authorized) {
      return auth.response;
    }

    await connectToDatabase();

    const user = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        phone: true,
        type: true,
        status: true,
      },
    });

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "server side error", error },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
};
