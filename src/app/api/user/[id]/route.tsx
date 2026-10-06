import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../../helpers/server-helpers";
import prisma from "@/index";
import bcrypt from "bcrypt";
import { verifyAdminRequest } from "@/lib/adminAuth";

export const GET = async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const auth = await verifyAdminRequest();
  if (!auth.authorized) {
    return auth.response;
  }
  const { id } = await params;
  return NextResponse.json({ id });
};

// Update User
export const PUT = async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const auth = await verifyAdminRequest();
  if (!auth.authorized) {
    return auth.response;
  }
  const { id } = await params;
  //  (id)
  try {
    const { name, phone, email, username, password, type, status } =
      await req.json();

    if (!name || !phone || !username) {
      return NextResponse.json({ message: "Invalid data" }, { status: 422 });
    }

    let data = {};
    if (password !== "") {
      const hashedPassword = await bcrypt.hash(password, 10);
      data = { ...data, password: hashedPassword };
    }

    data = { ...data, name, phone, email, username, type, status };
    await connectToDatabase();

    const updatedUser = await prisma.user.update({
      where: { id },
      data: data,
    });

    return NextResponse.json(
      { user: updatedUser, message: "User Update Successful" },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Server side error", error },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
};

// Delete User
export const DELETE = async (
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const auth = await verifyAdminRequest();
  if (!auth.authorized) {
    return auth.response;
  }
  const { id } = await params;
  try {
    if (!id) {
      return NextResponse.json({ message: "Invalid data" }, { status: 422 });
    }

    await connectToDatabase();

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "User deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Server side error", error },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
};
