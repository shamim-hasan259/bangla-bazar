"use server";
import prisma from "@/index";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { SupplierFormSchema } from "./SupplierFormSchema";

export type Supplier = z.infer<typeof SupplierFormSchema>;

export const handleDelete = async (id: string) => {
  try {
    const supplier = await prisma.supplier.delete({
      where: {
        id: id,
      },
    });
    if (supplier) {
      `Deleted successful!`;
      revalidatePath("/dashboard/supplier");
      return true;
    }
  } catch (err) {
    err;
    return false;
  }
};

export const saveSupplier = async (id: string, data: Supplier) => {
  try {
    //ts-ignore
    let {
      name,
      phone,
      email,
      address,
      company,
      country,
      designation,
      description,
      status,
    } = data;

    if (!name || !phone) return false;

    if (id !== "") {
      const updateSupplier = await prisma.supplier.update({
        where: {
          id: id,
        },
        data: {
          name,
          phone,
          email: email || "",
          address: address || "",
          company: company || "",
          country: country || "",
          designation: designation || "",
          description: description || "",
          // @ts-ignore
          status: status || "Active",
        },
      });

      if (updateSupplier) {
        revalidatePath("/dashboard/supplier");
        return updateSupplier;
      }
    } else {
      const createSupplier = await prisma.supplier.create({
        data: {
          name,
          email: email || "",
          phone,
          address: address || "",
          company: company || "",
          country: country || "",
          designation: designation || "",
          description: description || "",
          // @ts-ignore
          status: status || "Active",
        },
      });

      if (createSupplier) {
        revalidatePath("/dashboard/supplier");
        return createSupplier;
      }
    }
  } catch (err) {
    err;
    return false;
  }
};

export const SupplierDw = async () => {
  try {
    const suppliers = await prisma.supplier.findMany({
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
        label: "Select Supplier",
      },
    ];

    //  (suppliers);
    suppliers.map(
      (supplier) =>
      (dw = [
        ...dw,
        {
          value: supplier.id,
          label: supplier.name,
        },
      ])
    );
    return dw;
  } catch (error) {
    console.error("Error fetching parent suppliers:", error);
    throw new Error("Failed to fetch suppliers");
  }
};

export const UpdateSupplierStatus = async (id: string, status: string) => {
  //  ("Triggered update", id, status);
  try {
    const update = await prisma.supplier.update({
      where: {
        id: id,
      },
      //@ts-ignore
      data: { status: status },
    });

    if (update) {
      ("update successful");
      revalidatePath("/dashboard/supplier");
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("sales update error", error);
    return false;
  }
};

export const getSupplierById = async (id: string): Promise<any | null> => {
  if (!id || id === "undefined" || id === "null" || id === "") return null;
  try {
    const supplier = await prisma.supplier.findUnique({
      where: {
        id: id,
      },
      select: {
        id: true,
        name: true,
      },
    });

    return supplier;
  } catch (error) {
    console.error("Error fetching brand name by ID:", error);
    return null;
  }
};
