"use server";
import prisma from "@/index";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { AdjustFormSchema } from "./create/AdjustFormSchema";
import { generateId } from "@/lib/idGenerator";
import { adjustInvetoryIn, adjustInvetoryOut } from "../inventory/_action";
import { endOfDay, startOfDay } from "date-fns";

export type Adjust = z.infer<typeof AdjustFormSchema>;

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

export const saveAdjust = async (data: Adjust) => {
  const newAdjustNo = await generateId("adj");
  try {
    let {
      id,
      userId,
      adjustMentNo,
      products,
      note,
      warehouseId,
      rcvAdjustmentQty,
      rcvAdjustmentTotal,
      issueAdjustQty,
      issueAdjustTotal,
      total,
      totalItem,
      grossTotal,
      grossTotalRound,
      status,
    } = data;

    // if (!id || !articleCode) return false;

    if (id !== "") {
      const updateUnit = await prisma.adjust.update({
        where: {
          id: id,
        },
        data: {
          //@ts-ignore
          user: { connect: { id: userId } },
          adjustMentNo,
          products,
          note,
          warehouse: { connect: { id: warehouseId } },
          rcvAdjustmentQty,
          rcvAdjustmentTotal,
          issueAdjustQty,
          issueAdjustTotal,
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
      const createAdjust = await prisma.adjust.create({
        data: {
          user: { connect: { id: userId } },
          adjustMentNo: newAdjustNo,
          products,
          note,
          warehouse: { connect: { id: warehouseId } },
          rcvAdjustmentQty,
          rcvAdjustmentTotal,
          issueAdjustQty,
          issueAdjustTotal,
          total,
          totalItem,
          grossTotal,
          grossTotalRound,
          status,
        },
      });

      if (createAdjust) {
        const updateInventory = adjustInvetoryIn(products);
        `${createAdjust.id} Create successful!`;
        revalidatePath("/dashboard/adjust");
        return createAdjust;
      }
    }
  } catch (err) {
    err;
    return false;
  }
};

export const UpdateAdjustStatus = async (id: string, status: string) => {
  //  ("Triggered update", id, status);
  try {
    const update = await prisma.adjust.update({
      where: {
        id: id,
      },
      //@ts-ignore
      data: { status: status },
    });

    if (update.status === "Complete") {
      const updateInventory = adjustInvetoryIn(update.products);
    } else {
      const updateInventory = adjustInvetoryOut(update.products);
    }

    if (update) {
      ("update successful");
      revalidatePath("/dashboard/adjust");
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("sales update error", error);
    return false;
  }
};

export const getAdjustByDate = async ({
  startDate,
  endDate,
}: {
  startDate?: Date;
  endDate?: Date;
}) => {
  const start = startOfDay(startDate ? new Date(startDate) : new Date());
  const end = endOfDay(endDate ? new Date(endDate) : new Date());
  //  (startDate, endDate);

  const adjustData = await prisma.adjust.findMany({
    where: {
      createdAt: {
        gte: start,
        lte: end,
      },
    },
    select: {
      id: true,
      adjustMentNo: true,
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

  const formattedData = adjustData.map((adjust) => ({
    ...adjust,
    // createdAt: format(new Date(tpnData.createdAt), 'MM/dd/yyyy'), // Format createdAt date
  }));

  return formattedData;
};
