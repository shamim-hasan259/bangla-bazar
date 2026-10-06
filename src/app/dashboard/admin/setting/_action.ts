"use server";
import prisma from "@/index";
import { revalidatePath } from "next/cache";
import { SiteSettigSchema } from "./SettingSchema";
import { z } from "zod";

export type SiteSetting = z.infer<typeof SiteSettigSchema>;

export const getSetting = async () => {
  try {
    const siteSetting = await prisma.setting.findFirst({
      orderBy: { createdAt: "desc" },
    });
    return siteSetting || null;
  } catch (err: any) {
    console.error("Error fetching site settings:", err);
    return null;
  }
};

export const saveSiteSetting = async (id: string | undefined, data: SiteSetting) => {
  try {
    const { site_title, event_title, logo, banner, add1, add2, add3 } = data;

    // Check if an existing record exists if id is not supplied
    let targetId = id && id.trim() !== "" ? id : undefined;
    if (!targetId) {
      const existing = await prisma.setting.findFirst({
        orderBy: { createdAt: "desc" },
      });
      if (existing) {
        targetId = existing.id;
      }
    }

    let savedSetting;
    if (targetId) {
      savedSetting = await prisma.setting.update({
        where: { id: targetId },
        data: {
          site_title: site_title ?? "",
          event_title: event_title ?? "",
          logo: logo ?? "",
          banner: banner ?? "",
          add1: add1 ?? "",
          add2: add2 ?? "",
          add3: add3 ?? "",
        },
      });
    } else {
      savedSetting = await prisma.setting.create({
        data: {
          site_title: site_title ?? "",
          event_title: event_title ?? "",
          logo: logo ?? "",
          banner: banner ?? "",
          add1: add1 ?? "",
          add2: add2 ?? "",
          add3: add3 ?? "",
        },
      });
    }

    revalidatePath("/dashboard/admin/setting");
    return { success: true, setting: savedSetting };
  } catch (err: any) {
    console.error("Error saving site settings:", err);
    return { success: false, error: err.message || "Failed to save settings" };
  }
};

// ============================================
// PROGRAM CRUD SERVER ACTIONS
// ============================================

export const getPrograms = async () => {
  try {
    const programs = await prisma.program.findMany({
      orderBy: { createdAt: "desc" },
    });
    return programs;
  } catch (err: any) {
    console.error("Error fetching programs:", err);
    return [];
  }
};

export const saveProgram = async (data: { id?: string; title: string; description?: string }) => {
  try {
    const { id, title, description } = data;
    if (!title || title.trim() === "") {
      return { success: false, error: "Program title is required" };
    }

    let savedProgram;
    if (id && id.trim() !== "") {
      savedProgram = await prisma.program.update({
        where: { id },
        data: {
          title: title.trim(),
          description: description?.trim() || null,
        },
      });
    } else {
      savedProgram = await prisma.program.create({
        data: {
          title: title.trim(),
          description: description?.trim() || null,
        },
      });
    }

    revalidatePath("/dashboard/admin/setting");
    return { success: true, program: savedProgram };
  } catch (err: any) {
    console.error("Error saving program:", err);
    return { success: false, error: err.message || "Failed to save program" };
  }
};

export const deleteProgram = async (id: string) => {
  try {
    if (!id) {
      return { success: false, error: "Program ID is required" };
    }
    await prisma.program.delete({
      where: { id },
    });
    revalidatePath("/dashboard/admin/setting");
    return { success: true };
  } catch (err: any) {
    console.error("Error deleting program:", err);
    return { success: false, error: err.message || "Failed to delete program" };
  }
};
