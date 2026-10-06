import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../../helpers/server-helpers";
import prisma from "@/index";

export const GET = async (
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  try {
    await connectToDatabase();
    const customer = await prisma.customer.findFirst({
      where: {
        OR: [{ customerId: id }, { id: id }],
      },
    });

    return NextResponse.json(customer, { status: 200 });
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

// Update User
export const PUT = async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  try {
    const {
      type,
      name,
      country,
      district,
      city,
      streetAddress,
      zipCode,
      phone,
      email,
      customerId,
    } = await req.json();
    
    await connectToDatabase();
    
    const customer = await prisma.customer.findFirst({
      where: {
        OR: [{ customerId: customerId || id }, { id: id }],
      },
    });
    if (!customer) {
      return NextResponse.json(
        { message: "Customer not found" },
        { status: 404 }
      );
    }

    const address = [
      ...((customer.address as any[]) || []),
      {
        id: `addr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type,
        name,
        country,
        district,
        city,
        streetAddress,
        zipCode,
        phone,
        email,
      },
    ];

    const updatedUser = await prisma.customer.update({
      where: { id: customer.id },
      data: {
        address,
      },
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

    await prisma.customer.delete({
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
