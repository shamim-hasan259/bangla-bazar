"use server";
import prisma from "@/index";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { UnitFormSchema } from "./UnitFormSchema";

export type Unit = z.infer<typeof UnitFormSchema>;

export const handleDelete = async (id: string) => {
  try {
    const unit = await prisma.unit.delete({
      where: {
        id: id,
      },
    });
    if (unit) {
      revalidatePath("/dashboard/unit");
      return true;
    }
  } catch (err) {
    err;
    return false;
  }
};

export const saveUnit = async (id: string, data: Unit) => {
  try {
    //ts-ignore
    let { name, code, symbol, description, status } = data;

    if (!name || !symbol) return false;

    if (id !== "") {
      const updateUnit = await prisma.unit.update({
        where: {
          id: id,
        },
        data: {
          name,
          code,
          //@ts-ignore
          symbol,
          description,
          status,
        },
      });

      if (updateUnit) {
        `${updateUnit.name} Update successful!`;

        revalidatePath("/dashboard/unit");
        return updateUnit;
      }
    } else {
      const createUnit = await prisma.unit.create({
        data: {
          name,
          code,
          description,
          //@ts-ignore
          symbol,
          status,
        },
      });

      if (createUnit) {
        `${createUnit.name} Create successful!`;

        revalidatePath("/dashboard/unit");
        return createUnit;
      }
    }
  } catch (err) {
    err;
    return false;
  }
};

export const getUnitDw = async () => {
  try {
    const units = await prisma.unit.findMany({
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
        label: "Select Unit",
      },
    ];

    //  (units);
    units.map(
      (unit) =>
      (dw = [
        ...dw,
        {
          value: unit.id,
          label: unit.name,
        },
      ])
    );
    return dw;
  } catch (error) {
    console.error("Error fetching parent unit:", error);
    throw new Error("Failed to fetch unit");
  }
};

export const getUnitById = async (id: string): Promise<any | null> => {
  if (!id || id === "undefined" || id === "null" || id === "") return null;
  try {
    const unit = await prisma.unit.findUnique({
      where: {
        id: id,
      },
      select: {
        id: true,
        name: true,
        symbol: true,
      },
    });

    return unit;
  } catch (error) {
    console.error("Error fetching Unite name by ID:", error);
    return null;
  }
};

// export const unitDw = async () => {
//   try {
//     let categories;

//     categories = await prisma.category.findMany({

//       select: {
//         id: true,
//         name: true,
//       },
//     });

//     let dw = [
//       {
//         value: "",
//         label: "Select Unit",
//       },
//     ];

//     //  (categories);
//     categories.map(
//       (category) =>
//         (dw = [
//           ...dw,
//           {
//             value: category.id,
//             label: category.name,
//           },
//         ])
//     );
//     return dw;
//   } catch (error) {
//     console.error("Error fetching parent Unit:", error);
//     throw new Error("Failed to fetch Unit");
//   }
// };
