"use server";
import prisma from "@/index";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { CategoryFormSchema } from "./CategoryFormSchema";

export type Category = z.infer<typeof CategoryFormSchema>;

export const handleDelete = async (id: string) => {
  try {
    const user = await prisma.category.delete({
      where: {
        id: id,
      },
    });
    if (user) {
      `Deleted successful!`;
      revalidatePath("/dashboard/category");
      return true;
    }
  } catch (err) {
    err;
    return false;
  }
};

const safeRevalidate = (path: string) => {
  try {
    revalidatePath(path);
  } catch (e) {
    // Ignore when called outside Next.js request context
  }
};

export const saveCategory = async (data: Category) => {
  try {
    let { id, name, code, photo, parentId, description, status } = data;

    if (!code || code.trim() === "") {
      const slug = name.toString().toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-').replace(/^-+/, '').replace(/-+$/, '');
      code = `${slug || "cat"}_${Math.random().toString(36).substr(2, 5)}`;
    }

    let validParentId = parentId && typeof parentId === "string" && /^[0-9a-fA-F]{24}$/.test(parentId.trim()) ? parentId.trim() : null;

    // Prevent circular self-reference
    if (id && validParentId === id) {
      validParentId = null;
    }

    if (id === undefined || id === "") {
      const createCategory = await prisma.category.create({
        data: {
          name,
          code,
          photo: photo || "",
          parentId: validParentId,
          description: description || "",
          //@ts-ignore
          status: status || "Active",
        },
      });

      if (createCategory) {
        safeRevalidate("/dashboard/admin/category");
        safeRevalidate("/dashboard/category");
        safeRevalidate("/products");
        return createCategory;
      }
    } else {
      const updateCategory = await prisma.category.update({
        where: {
          id: id,
        },
        data: {
          name,
          code,
          photo: photo || "",
          parentId: validParentId,
          description: description || "",
          //@ts-ignore
          status: status || "Active",
        },
      });

      if (updateCategory) {
        safeRevalidate("/dashboard/admin/category");
        safeRevalidate("/dashboard/category");
        safeRevalidate("/products");
        return updateCategory;
      }
    }
  } catch (err) {
    console.error("saveCategory error:", err);
    return false;
  }
};

export const parentCategory = async (excludeId?: string) => {
  try {
    const categories = await prisma.category.findMany({
      where: {
        parentId: null,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      select: {
        id: true,
        name: true,
      },
    });

    let dw = [
      {
        value: "",
        label: "None (Main Category)",
      },
    ];

    categories.forEach((category) => {
      dw.push({
        value: category.id,
        label: category.name,
      });
    });
    return dw;
  } catch (error) {
    console.error("Error fetching parent categories:", error);
    return [{ value: "", label: "None (Main Category)" }];
  }
};

// Sub Category List
export const categoryDw = async (id?: string) => {
  try {
    let categories;

    if (id && id !== "" && /^[0-9a-fA-F]{24}$/.test(id.trim())) {
      categories = await prisma.category.findMany({
        where: {
          parentId: id.trim(),
        },
        select: {
          id: true,
          name: true,
        },
      });
    } else {
      categories = await prisma.category.findMany({
        select: {
          id: true,
          name: true,
        },
      });
    }

    let dw = [
      {
        value: "",
        label: "Select Category",
      },
    ];

    categories.forEach((category) => {
      dw.push({
        value: category.id,
        label: category.name,
      });
    });
    return dw;
  } catch (error) {
    console.error("Error fetching sub categories:", error);
    return [{ value: "", label: "Select Category" }];
  }
};

// Category List for Dropdown
export const categoryMCDw = async (excludeId?: string) => {
  try {
    const categories = await prisma.category.findMany({
      where: excludeId ? { id: { not: excludeId } } : undefined,
      select: {
        id: true,
        name: true,
      },
    });

    let dw = [
      {
        value: "",
        label: "None (Main Category)",
      },
    ];

    categories.forEach((category) => {
      dw.push({
        value: category.id,
        label: category.name,
      });
    });
    return dw;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [{ value: "", label: "None (Main Category)" }];
  }
};

//import product from csv function
export const importCategory = async (data: any, isParent: boolean) => {
  try {
    if (isParent) {
      const category = await prisma.category.createMany({
        //@ts-ignore
        data: data.map(({ name, code, description, status }) => ({
          name,
          code,
          description,
          status,
        })),
      });

      if (category.count > 0) {
        `${category.count} Categories created successfully!`;
        revalidatePath("/dashboard/category");
        return category;
      }
    } else {
      ("Importing subcategories");

      const promises = data.map(
        //@ts-ignore
        async ({ name, code, parentId, description, status }) => {
          await prisma.category.create({
            data: {
              name,
              code,
              description,
              parentId: parentId,
              status,
            },
          });
        }
      );

      await Promise.all(promises);
      revalidatePath("/dashboard/category");
    }
  } catch (error) {
    console.error("Error importing categories:", error);
  }
};

export const getCategoryById = async (id: string): Promise<any | null> => {
  if (!id || id === "undefined" || id === "null" || id === "") return null;
  try {
    const category = await prisma.category.findUnique({
      where: {
        id: id,
      },
      select: {
        id: true,
        name: true,
        parentId: true,
      },
    });

    return category;
  } catch (error) {
    console.error("Error fetching brand name by ID:", error);
    return null;
  }
};
