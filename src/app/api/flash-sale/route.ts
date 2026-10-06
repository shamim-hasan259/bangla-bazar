export const dynamic = "force-dynamic";
import prisma from "@/index";
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../helpers/server-helpers";

export const GET = async (req: Request) => {
  try {
    await connectToDatabase();

    const flashSale = await prisma.flashSale.findFirst({
      where: {
        endDate: { gte: new Date() },
      },
      include: {
        products: {
          where: { status: "Approved" },
          include: {
            product: {
              include: {
                category: true,
                store: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!flashSale) {
      // Return latest flash sale regardless of date or empty
      const latest = await prisma.flashSale.findFirst({
        include: {
          products: {
            include: {
              product: {
                include: {
                  category: true,
                  store: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json(latest || null);
    }

    return NextResponse.json(flashSale);
  } catch (error: any) {
    console.error("Error fetching flash sale:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch flash sale" },
      { status: 500 }
    );
  }
};
