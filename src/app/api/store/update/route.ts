export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prisma from "@/index";

export const PATCH = async (req: Request) => {
  try {
    const updateStoreData = await req.json();

    // console.log(updateStoreData);

    const response = await prisma.store.update({
      where: {
        id: updateStoreData.id,
      },
      data: {
        storeName: updateStoreData.storeName,
        address: updateStoreData.address,
        description: updateStoreData.description,
        phone: updateStoreData.phone,
        email: updateStoreData.email,
        storeLogo: updateStoreData.uploadedStoreLogo,
        storeBanner: updateStoreData.uploadedStoreBanner,
        facebook: updateStoreData.facebook,
        instagram: updateStoreData.instagram,
        x: updateStoreData.x,
        // updatedAt: Date()
      },
    });

    return NextResponse.json({ response }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "An error occurred" },
      { status: 500 }
    );
  }
};
