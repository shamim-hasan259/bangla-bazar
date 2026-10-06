import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../../../helpers/server-helpers";
import prisma from "@/index";

// Get Customers by district
export const GET = async (
  req: Request,
  { params }: { params: Promise<{ district: string }> }
) => {
  const { district } = await params;
  try {
    await connectToDatabase();

    const customer = await prisma.customer.findMany({
      where: {
        status: "Active",
      },
      select: {
        name: true,
        phone: true,
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

export const PUT = async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  try {
    const { attend } = await req.json();

    await connectToDatabase();

    const updatedUser = await prisma.customer.update({
      where: { id: id },
      //@ts-ignore
      data: { attend },
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
