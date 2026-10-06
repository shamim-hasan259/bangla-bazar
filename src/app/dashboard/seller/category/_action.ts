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

export const saveCategory = async (data: Category) => {
  try {
    "saveCategor", data;
    let { id, name, code, photo, parentId, description, status } = data;

    //  ("categoryData", id);

    // if (!name || !parentId) return false;
    if (id === undefined) {
      const createCategory = await prisma.category.create({
        data: {
          name,
          code,
          photo,
          parentId,
          description,
          status,
        },
      });

      if (createCategory) {
        `${createCategory.name} Create successful!`;

        revalidatePath("/dashboard/category");
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
          photo,
          parentId,
          description,
          status,
        },
      });

      if (updateCategory) {
        `${updateCategory.name} Update successful!`;

        revalidatePath("/dashboard/category");
        return updateCategory;
      }
    }
  } catch (err) {
    "errror", err;
    return false;
  }
};

export const parentCategory = async () => {
  try {
    const categories = await prisma.category.findMany({
      where: {
        parent: null,
      },
      select: {
        id: true,
        name: true,
      },
    });

    let dw = [
      {
        value: "",
        label: "Select Category",
      },
    ];

    //  ("Parent Category", categories);

    //  (categories);
    categories.map(
      (category) =>
        (dw = [
          ...dw,
          {
            value: category.id,
            label: category.name,
          },
        ])
    );
    return dw;
  } catch (error) {
    console.error("Error fetching parent categories:", error);
    throw new Error("Failed to fetch categories");
  }
};

// Sub Category List
export const categoryDw = async (id?: string) => {
  //  (id)
  try {
    let categories;

    if (id !== "") {
      categories = await prisma.category.findMany({
        where: {
          parentId: id,
        },
        select: {
          id: true,
          name: true,
        },
      });
    } else {
      categories = await prisma.category.findMany({
        where: {
          parentId: { not: null },
        },
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

    //  (categories);
    categories.map(
      (category) =>
        (dw = [
          ...dw,
          {
            value: category.id,
            label: category.name,
          },
        ])
    );
    return dw;
  } catch (error) {
    console.error("Error fetching parent categories:", error);
    throw new Error("Failed to fetch categories");
  }
};

//Master Category List
export const categoryMCDw = async () => {
  try {
    let categories;

    categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
      },
    });

    let dw = [
      {
        value: "",
        label: "Select Category",
      },
    ];

    //  (categories);
    categories.map(
      (category) =>
        (dw = [
          ...dw,
          {
            value: category.id,
            label: category.name,
          },
        ])
    );
    return dw;
  } catch (error) {
    console.error("Error fetching parent categories:", error);
    throw new Error("Failed to fetch categories");
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

export const getCategoryById = async (id: string): Promise<string | null> => {
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
