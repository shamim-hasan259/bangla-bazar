"use server";

import prisma from "@/index";
import { revalidatePath } from "next/cache";
import { generateId } from "@/lib/idGenerator";
import { endOfDay, format, startOfDay } from "date-fns";
import { createUserLogs } from "../../admin/users/_action";

export const handleDelete = async (id: string) => {
  // TODO:: Update Customer Due || Sales Info for delete transactions
  try {
    const deleteOffer = await prisma.transactions.delete({
      where: {
        id: id,
      },
    });
    //  (deleteOffer);
    if (deleteOffer) {
      `${deleteOffer.name} deleted successful!`;
      revalidatePath("/dashboard/accounts");
      return deleteOffer;
    }
  } catch (err) {
    err;
    return false;
  }
};

export const createTransaction = async (data: any) => {
  try {
    //@ts-ignore
    //  ("transaction creation ", data);
    if (data?.accountsHeadId !== null || data?.amount < 0) {
      let newInvoiceNo;
      if (data?.type === "Collection") {
        newInvoiceNo = await generateId("in");
      } else {
        newInvoiceNo = await generateId("exp");
      }
      const transactionData = {
        ...data,
        transactionId: newInvoiceNo,
        date: data.date ? data.date.toISOString() : null, // Convert DateTime to String
      };

      const createTransaction = await prisma.transactions.create({
        data: transactionData,
      });

      if (createTransaction) {
        //  (`${createCollection.name} Create successful!`);
        if (createTransaction.type === "Collection") {
          createUserLogs(
            createTransaction?.userId,
            createTransaction?.transactionId,
            "Collection",
            "Create"
          );
        } else {
          createUserLogs(
            createTransaction?.userId,
            createTransaction?.transactionId,
            "Expense",
            "Create"
          );
        }
        revalidatePath("/dashboard/accounts");
        return createTransaction;
      }
    } else {
      return false;
    }
  } catch (err) {
    return false;
  }
};

// export const updateOffer = async (id: string, data: Offer) => {
//   try {
//     //ts-ignore
//     // const { id, ...data } = data;
//     const updateOffer = await prisma.offer.update({
//       where: {
//         id: id,
//       },
//       //@ts-ignore
//       data: data,
//     });
//     updateOffer;
//     if (updateOffer) {
//       `${updateOffer.name} Update successful!`;
//       revalidatePath("/dashboard/offers");
//       return updateOffer;
//     }
//   } catch (err) {
//     return err;
//   }
// };

export const getTransactionByDate = async ({
  startDate,
  endDate,
}: {
  startDate?: Date;
  endDate?: Date;
}) => {
  const start = startOfDay(startDate ? new Date(startDate) : new Date());
  const end = endOfDay(endDate ? new Date(endDate) : new Date());
  //  (startDate, endDate);

  const transactions = await prisma.transactions.findMany({
    where: {
      createdAt: {
        gte: start,
        lte: end,
      },
    },
    select: {
      id: true,
      transactionId: true,
      name: true,
      amount: true,
      date: true,
      type: true,
      createdAt: true,
    },
  });

  const formattedData = transactions.map((transactions) => ({
    ...transactions,
    createdAt: format(new Date(transactions.createdAt), "MM/dd/yyyy"), // Format createdAt date
  }));

  return formattedData;
};
