"use server";
import prisma from "@/index";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { AccountsHeadFormSchema } from "./AccountsHeadFormSchema";
import { createUserLogs } from "../users/_action";

export type AccountsHead = z.infer<typeof AccountsHeadFormSchema>;

export const handleDelete = async (id: string) => {
  try {
    const user = await prisma.accountsHead.delete({
      where: {
        id: id,
      },
    });
    if (user) {
      `Deleted successful!`;
      revalidatePath("/dashboard/accounts-head");
      return true;
    }
  } catch (err) {
    err;
    return false;
  }
};

export const saveCategory = async (data: AccountsHead) => {
  try {
    //  ("saveCategor", data);
    let { id, name, code, photo, parentId, description, status } = data;

    //  ("categoryData", id);

    // if (!name || !parentId) return false;
    if (id === undefined) {
      const createAccountsHead = await prisma.accountsHead.create({
        data: {
          name,
          code,
          photo,
          parentId,
          description,
          status,
        },
      });

      if (createAccountsHead) {
        //  (`${createAccountsHead.name} Create successful!`);
        createUserLogs(
          createAccountsHead?.name,
          createAccountsHead?.id,
          "Account Head",
          "Create"
        );
        revalidatePath("/dashboard/accounts-head");
        return createAccountsHead;
      }
    } else {
      const updateAccountsHead = await prisma.accountsHead.update({
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

      if (updateAccountsHead) {
        `${updateAccountsHead.name} Update successful!`;
        createUserLogs(
          updateAccountsHead?.name,
          updateAccountsHead?.id,
          "Account Head",
          "Edit"
        );
        revalidatePath("/dashboard/category");
        return updateAccountsHead;
      }
    }
  } catch (err) {
    return false;
  }
};

export const parentAccountsHead = async () => {
  try {
    const accountsHead = await prisma.accountsHead.findMany({
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
        label: "Select Accounts Head",
      },
    ];

    //  ("Parent Category", categories);

    //  (categories);
    accountsHead.map(
      (account) =>
        (dw = [
          ...dw,
          {
            value: account.id,
            label: account.name,
          },
        ])
    );
    return dw;
  } catch (error) {
    console.error("Error fetching master Account Head:", error);
    throw new Error("Failed to fetch Account Head");
  }
};

// Sub Category List
export const accountHeadDw = async (id?: string) => {
  //  (id)
  try {
    let accountsHead;

    if (id !== "") {
      accountsHead = await prisma.accountsHead.findMany({
        where: {
          parentId: id,
        },
        select: {
          id: true,
          name: true,
        },
      });
    } else {
      accountsHead = await prisma.accountsHead.findMany({
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
        label: "Select Accounts Head",
      },
    ];

    //  (accountsHead);
    accountsHead.map(
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
    console.error("Error fetching parent accountsHead:", error);
    throw new Error("Failed to fetch accountsHead");
  }
};

//Master Category List
export const categoryMCDw = async () => {
  try {
    let accountsHead;

    accountsHead = await prisma.accountsHead.findMany({
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

    //  (accountsHead);
    accountsHead.map(
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
    console.error("Error fetching parent accountsHead:", error);
    throw new Error("Failed to fetch accountsHead");
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
        `${category.count} accountsHead created successfully!`;
        revalidatePath("/dashboard/category");
        return category;
      }
    } else {
      ("Importing subaccountsHead");

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
    console.error("Error importing accountsHead:", error);
  }
};

export const getAccountHeadById = async (
  id: string
): Promise<string | null> => {
  try {
    const accountsHead = await prisma.accountsHead.findUnique({
      where: {
        id: id,
      },
      select: {
        id: true,
        name: true,
        parentId: true,
      },
    });

    return accountsHead;
  } catch (error) {
    console.error("Error fetching brand name by ID:", error);
    return null;
  }
};
