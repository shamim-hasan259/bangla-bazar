"use server";
import prisma from "@/index";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { generateId } from "@/lib/idGenerator";
import { DamageFormSchema } from "./create/DamageFromSchema";
import { damageInvetoryIn, damageInvetoryOut } from "../inventory/_action";
import { endOfDay, startOfDay } from "date-fns";

export type Damage = z.infer<typeof DamageFormSchema>;

export const handleDelete = async (id: string) => {
  try {
    const deleteProduct = await prisma.product.delete({
      where: {
        id: id,
      },
    });
    //  (deleteOffer);
    if (deleteProduct) {
      `${deleteProduct.name} deleted successful!`;
      revalidatePath("/dashboard/offers");
      return deleteProduct;
    }
  } catch (err) {
    err;
    return false;
  }
};

export const saveDamage = async (data: Damage) => {
  const newDamageNo = await generateId("adj");
  try {
    let {
      id,
      userId,
      damageNo,
      products,
      note,
      warehouseId,

      total,
      totalItem,
      grossTotal,
      grossTotalRound,
      status,
    } = data;

    // if (!id || !articleCode) return false;

    if (id !== "") {
      const updateUnit = await prisma.damage.update({
        where: {
          id: id,
        },
        data: {
          //@ts-ignore
          user: { connect: { id: userId } },
          damageNo,
          products,
          note,
          warehouse: { connect: { id: warehouseId } },

          total,
          totalItem,
          grossTotal,
          grossTotalRound,
          status,
        },
      });

      if (updateUnit) {
        `${updateUnit.id} Update successful!`;

        revalidatePath("/dashboard/adjust");
        return updateUnit;
      }
    } else {
      const createDamage = await prisma.damage.create({
        //@ts-ignore
        data: {
          user: { connect: { id: userId } },
          damageNo: newDamageNo,
          products,
          note,
          warehouse: { connect: { id: warehouseId } },
          total,
          totalItem,
          grossTotal,
          grossTotalRound,
          status,
        },
      });

      if (createDamage) {
        const updateInventory = damageInvetoryOut(products);
        `${createDamage.id} Create successful!`;
        revalidatePath("/dashboard/adjust");
        return createDamage;
      }
    }
  } catch (err) {
    err;
    return false;
  }
};

export const UpdateDamageStatus = async (id: string, status: string) => {
  //  ("Triggered update", id, status);
  try {
    const update = await prisma.damage.update({
      where: {
        id: id,
      },
      //@ts-ignore
      data: { status: status },
    });

    if (update) {
      ("update successful");
      revalidatePath("/dashboard/damage");
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("sales update error", error);
    return false;
  }
};

export const getDamageByDate = async ({
  startDate,
  endDate,
}: {
  startDate?: Date;
  endDate?: Date;
}) => {
  const start = startOfDay(startDate ? new Date(startDate) : new Date());
  const end = endOfDay(endDate ? new Date(endDate) : new Date());
  //  (startDate, endDate);

  const damageData = await prisma.damage.findMany({
    where: {
      createdAt: {
        gte: start,
        lte: end,
      },
    },
    select: {
      id: true,
      damageNo: true,
      totalItem: true,
      total: true,
      grossTotal: true,
      status: true,
      createdAt: true,
      warehouse: {
        select: {
          name: true,
        },
      },
    },
  });

  //  ("tpnData", tpnData);

  const formattedData = damageData.map((damage) => ({
    ...damage,
    // createdAt: format(new Date(tpnData.createdAt), 'MM/dd/yyyy'), // Format createdAt date
  }));

  return formattedData;
};
