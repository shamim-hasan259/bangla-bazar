export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../helpers/server-helpers";
import prisma from "@/index";

// create User
export const POST = async (req: Request) => {
   try {
      let { userId, customerId, offerId, amount, paymentMethod, status } = await req.json();

      if (!customerId || !offerId)
         return NextResponse.json({ message: "invalide data" }, { status: 422 })


      await connectToDatabase()

      const user = await prisma.order.create({
         data: { userId, customerId, offerId, amount, paymentMethod, status },
      })

      return NextResponse.json({ user }, { status: 201 })

   } catch (error) {
      console.error(error)
      return NextResponse.json({ message: "server side error", error }, { status: 201 })

   } finally {
      await prisma.$disconnect()
   }
};


// Find All Order
export const GET = async () => {
   try {

      await connectToDatabase()
      const order = await prisma.order.findMany()
      return NextResponse.json(order, { status: 200 })

   } catch (error) {
      console.error(error)
      return NextResponse.json({ message: "server side error", error }, { status: 201 })

   } finally {
      await prisma.$disconnect()
   }
};
