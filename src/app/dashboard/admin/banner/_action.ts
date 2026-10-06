"use server";

import prisma from "@/index";
import { revalidatePath } from "next/cache";
import { BannerFormValues } from "./BannerFormSchema";

export const getBanners = async (type?: "MainSlider" | "RightPromo" | "BottomPromo") => {
  try {
    const banners = await prisma.banner.findMany({
      where: type ? { type } : undefined,
      orderBy: [
        { order: "asc" },
        { createdAt: "desc" }
      ],
    });
    return banners;
  } catch (error) {
    console.error("Error fetching banners:", error);
    return [];
  }
};

export const createBanner = async (data: BannerFormValues) => {
  try {
    const { title, badge, discount, subtitle, imageUrl, link, type, status, order } = data;

    if (!imageUrl) return { success: false, error: "Image is required" };

    const newBanner = await prisma.banner.create({
      data: {
        title: title || null,
        badge: badge || null,
        discount: discount || null,
        subtitle: subtitle || null,
        imageUrl,
        link: link || null,
        type,
        status,
        order,
      },
    });

    revalidatePath("/dashboard/admin/banner/slider");
    revalidatePath("/dashboard/admin/banner/right");
    revalidatePath("/dashboard/admin/banner/bottom");
    revalidatePath("/");

    return { success: true, data: newBanner };
  } catch (error) {
    console.error("Error creating banner:", error);
    return { success: false, error: "Failed to create banner" };
  }
};

export const updateBanner = async (id: string, data: BannerFormValues) => {
  try {
    const { title, badge, discount, subtitle, imageUrl, link, type, status, order } = data;

    if (!imageUrl) return { success: false, error: "Image is required" };

    const updatedBanner = await prisma.banner.update({
      where: { id },
      data: {
        title: title || null,
        badge: badge || null,
        discount: discount || null,
        subtitle: subtitle || null,
        imageUrl,
        link: link || null,
        type,
        status,
        order,
      },
    });
    revalidatePath("/dashboard/admin/banner/slider");
    revalidatePath("/dashboard/admin/banner/right");
    revalidatePath("/dashboard/admin/banner/bottom");
    revalidatePath("/");
    return { success: true, data: updatedBanner };
  } catch (error) {
    console.error("Error updating banner:", error);
    return { success: false, error: "Failed to update banner" };
  }
};

export const handleDelete = async (id: string) => {
  try {
    const deletedBanner = await prisma.banner.delete({
      where: { id },
    });
    revalidatePath("/dashboard/admin/banner/slider");
    revalidatePath("/dashboard/admin/banner/right");
    revalidatePath("/dashboard/admin/banner/bottom");
    revalidatePath("/");
    return { success: true, data: deletedBanner };
  } catch (error) {
    console.error("Error deleting banner:", error);
    return { success: false, error: "Failed to delete banner" };
  }
};

export const upsertSinglePromoBanner = async (type: "RightPromo" | "BottomPromo", data: Omit<BannerFormValues, "type">) => {
  try {
    const { title, imageUrl, link, status, order } = data;

    if (!imageUrl) return { success: false, error: "Image is required" };

    // Check if one already exists
    const existing = await prisma.banner.findFirst({
      where: { type },
    });

    let result;
    if (existing) {
      result = await prisma.banner.update({
        where: { id: existing.id },
        data: {
          title: title || null,
          imageUrl,
          link: link || null,
          status,
          order,
        },
      });
    } else {
      result = await prisma.banner.create({
        data: {
          title: title || null,
          imageUrl,
          link: link || null,
          type,
          status,
          order,
        },
      });
    }

    revalidatePath("/dashboard/admin/banner/slider");
    revalidatePath("/dashboard/admin/banner/right");
    revalidatePath("/dashboard/admin/banner/bottom");
    revalidatePath("/");

    return { success: true, data: result };
  } catch (error) {
    console.error(`Error saving ${type} banner:`, error);
    return { success: false, error: `Failed to save ${type} banner` };
  }
};
