"use server";

import prisma from "@/index";

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
