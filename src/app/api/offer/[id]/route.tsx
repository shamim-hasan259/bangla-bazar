import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../../helpers/server-helpers";
import prisma from "@/index";
import bcrypt from "bcrypt";

export const GET = async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  return NextResponse.json({ id });
};

// Update User
export const PUT = async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  //  ("id", id)
  try {
    const { name, price, offerId, description, photo, status } =
      await req.json();

    if (!name || !price || !offerId) {
      return NextResponse.json({ message: "Invalid data" }, { status: 422 });
    }

    await connectToDatabase();

    const updatedUser = await prisma.offer.update({
      where: { id: id },
      data: { name, price, offerId, description, photo, status },
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
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ message: "Invalid data" }, { status: 422 });
    }

    await connectToDatabase();

    await prisma.offer.delete({
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
