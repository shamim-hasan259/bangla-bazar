import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../helpers/server-helpers";
import prisma from "@/index";

// create User
export const POST = async (req: Request) => {
  try {
    const { name, price, offerId, description, photo, status } =
      await req.json();

    if (!name || !price || !description || !offerId)
      return NextResponse.json({ message: "invalide data" }, { status: 422 });

    await connectToDatabase();

    const user = await prisma.offer.create({
      data: { name, price, offerId, description, photo, status },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "server side error", error },
      { status: 201 }
    );
  } finally {
    await prisma.$disconnect();
  }
};

// Find All Offers
export const GET = async () => {
  try {
    await connectToDatabase();

    const offer = await prisma.offer.findMany();

    return NextResponse.json(offer, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "server side error", error },
      { status: 201 }
    );
  } finally {
    await prisma.$disconnect();
  }
};
