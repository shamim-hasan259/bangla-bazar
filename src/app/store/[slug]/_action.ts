"use server";

import prisma from "@/index";
import { revalidatePath } from "next/cache";

export async function toggleFollow(storeId: string, customerId: string) {
  try {
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      select: { followerIds: true },
    });

    if (!store) {
      return { success: false, error: "Store not found" };
    }

    const followerIds = store.followerIds || [];
    const isFollowing = followerIds.includes(customerId);
    let updatedFollowers = [...followerIds];

    if (isFollowing) {
      updatedFollowers = updatedFollowers.filter((id) => id !== customerId);
    } else {
      updatedFollowers.push(customerId);
    }

    const updatedStore = await prisma.store.update({
      where: { id: storeId },
      data: {
        followerIds: updatedFollowers,
      },
    });

    revalidatePath(`/store/${storeId}`);
    return {
      success: true,
      isFollowing: !isFollowing,
      count: updatedFollowers.length,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to update followers",
    };
  }
}
