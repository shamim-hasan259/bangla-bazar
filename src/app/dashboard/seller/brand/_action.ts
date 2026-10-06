"use server";
import prisma from "@/index";
import { revalidatePath } from "next/cache";
import bcrypt from "bcrypt";
import { z } from "zod";
import { BrandFormSchema } from "./BrandFormSchema";

export type Brand = z.infer<typeof BrandFormSchema>;

export const handleDelete = async (id: string) => {
  try {
    const user = await prisma.brand.delete({
      where: {
        id: id,
      },
    });
    if (user) {
      `Deleted successful!`;
      revalidatePath("/dashboard/brnad");
      return user;
    }
  } catch (err) {
    err;
    return false;
  }
};

export const createBrand = async (data: Brand) => {
  try {
    //ts-ignore
    let { name, logo, description, status } = data;

    if (!name) return false;

    const createBrand = await prisma.brand.create({
      //@ts-ignore
      data: { name, description, logo, status },
    });

    //  ("createBrand", data);
    if (createBrand) {
      `${createBrand.name} Create successful!`;

      revalidatePath("/dashboard/brand");
      return createBrand;
    }
  } catch (err) {
    err;
    return false;
  }
};

export const updateBrand = async (id: string, data: Brand) => {
  try {
    const { name, logo, description, status } = data;

    if (!name) {
      return false;
    }

    //ts-ignore
    // const { id, ...data } = data;
    const updateUser = await prisma.brand.update({
      where: {
        id: id,
      },
      //@ts-ignore
      data: { name, logo, description, status },
    });
    updateUser;
    if (updateUser) {
      `${updateUser.name} Update successful!`;
      revalidatePath("/dashboard/users");
      return updateUser;
    }
  } catch (err) {
    err;
    return err;
  }
};

export const brandDw = async () => {
  try {
    const brands = await prisma.brand.findMany({
      where: {
        status: "Active",
      },
      select: {
        id: true,
        name: true,
      },
    });

    let dw = [
      {
        value: "",
        label: "Select Brand",
      },
    ];

    //  (brands);
    brands.map(
      (brand) =>
        (dw = [
          ...dw,
          {
            value: brand.id,
            label: brand.name,
          },
        ])
    );
    return dw;
  } catch (error) {
    console.error("Error fetching parent categories:", error);
    throw new Error("Failed to fetch categories");
  }
};

export const getBrandNameById = async (id: string): Promise<string | null> => {
  try {
    const brand = await prisma.brand.findUnique({
      where: {
        id: id,
      },
      select: {
        name: true,
      },
    });

    return brand ? brand.name : null;
  } catch (error) {
    console.error("Error fetching brand name by ID:", error);
    return null;
  }
};
