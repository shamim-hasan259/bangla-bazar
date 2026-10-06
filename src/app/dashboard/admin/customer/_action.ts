"use server";
import prisma from "@/index";
import { revalidatePath } from "next/cache";
import { CustomerFormSchema } from "./CustomerFormSchema";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

export type Customer = z.infer<typeof CustomerFormSchema>;

// Helper function to generate a random 6-digit unique ID
const generateCustomerId = async (prisma: PrismaClient) => {
  const MAX_RETRIES = 3; // Maximum number of attempts to generate a unique ID

  for (let i = 0; i < MAX_RETRIES; i++) {
    const newCustomerId = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    // Check if the generated ID already exists in the database
    const existingCustomer = await prisma.customer.findUnique({
      where: {
        customerId: newCustomerId,
      },
    });

    if (!existingCustomer) {
      return newCustomerId;
    }
  }

  throw new Error("Failed to generate a unique customer ID");
};

export const handleDelete = async (id: string) => {
  try {
    const deleteOffer = await prisma.customer.delete({
      where: {
        id: id,
      },
    });
    if (deleteOffer) {
      revalidatePath("/dashboard/admin/customer");
      revalidatePath("/dashboard/seller/customer");
      return deleteOffer;
    }
  } catch (err) {
    return false;
  }
};

export const saveCustomer = async (id: string, data: Customer) => {
  try {
    const {
      name,
      phone,
      email,
      photo,
      username,
      password,
      type,
      company,
      status,
    } = data;

    if (!name || !phone) return false;

    let userData: any = {
      name,
      phone,
      email: email ? email : null,
      photo: photo ? photo : null,
      type: type || "customer",
      company: company ? company : null,
      status: status || "Active",
    };

    let hashedPassword = "";
    if (password && password.trim() !== "") {
      hashedPassword = await bcrypt.hash(password.trim(), 10);
      userData.password = hashedPassword;
    }

    if (id && id !== "") {
      const updateCustomer = await prisma.customer.update({
        where: {
          id: id,
        },
        data: userData,
      });

      if (updateCustomer) {
        revalidatePath("/dashboard/admin/customer");
        revalidatePath("/dashboard/seller/customer");
        revalidatePath("/dashboard/sales/create-order");
        return updateCustomer;
      }
    } else {
      const customerId = await generateCustomerId(prisma);
      const defaultPassword = hashedPassword || (await bcrypt.hash("123456", 10));

      const createUser = await prisma.customer.create({
        data: {
          ...userData,
          password: defaultPassword,
          customerId,
          type: "customer",
        },
      });

      if (createUser) {
        revalidatePath("/dashboard/admin/customer");
        revalidatePath("/dashboard/seller/customer");
        return createUser;
      }
    }
  } catch (err) {
    console.error("Save customer error:", err);
    return false;
  }
};

export const updateCustomerDue = async (id: string, newDue: number) => {
  try {
    const updatedCustomer = await prisma.customer.update({
      where: {
        id: id,
      },
      data: {
        walletBalance: newDue,
      },
    });

    if (updatedCustomer) {
      revalidatePath("/dashboard/admin/customer");
      revalidatePath("/dashboard/seller/customer");
      revalidatePath("/dashboard/sales/create-order");
      return updatedCustomer;
    }
  } catch (error) {
    console.error("Error updating customer due:", error);
    return null;
  }
};

export const importCustomer = async (data: any) => {
  try {
    for (const customerData of data) {
      const { name, phone, email } = customerData;
      if (!name || !phone) continue;

      const customerId = await generateCustomerId(prisma);
      const hashedPassword = await bcrypt.hash(phone, 10);

      const existing = await prisma.customer.findFirst({
        where: { phone: phone },
      });

      if (!existing) {
        await prisma.customer.create({
          data: {
            name,
            phone,
            email: email || undefined,
            customerId,
            password: hashedPassword,
            type: "customer",
            status: "Active",
          },
        });
      }
    }
  } catch (err) {
    console.error("Import customer error:", err);
    return false;
  } finally {
    revalidatePath("/dashboard/customer");
    revalidatePath("/dashboard/admin/customer");
    return true;
  }
};

export const CustomerDw = async () => {
  try {
    const customers = await prisma.customer.findMany({
      where: {
        status: "Active",
      },
      select: {
        id: true,
        name: true,
        company: true,
      },
    });

    let dw = [
      {
        value: "",
        label: "Select Customer",
      },
    ];

    customers.map(
      (customer) =>
      (dw = [
        ...dw,
        {
          value: `${customer?.id}`,
          label: `${customer?.company || "Personal"} - [${customer?.name}]`,
        },
      ])
    );
    return dw;
  } catch (error) {
    console.error("Error fetching customers for dropdown:", error);
    throw new Error("Failed to fetch customers");
  }
};

export const UpdateCustomerStatus = async (id: string, status: any) => {
  try {
    const update = await prisma.customer.update({
      where: {
        id: id,
      },
      data: { status: status },
    });

    if (update) {
      revalidatePath("/dashboard/admin/customer");
      revalidatePath("/dashboard/seller/customer");
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Customer status update error", error);
    return false;
  }
};

export const getCustomerById = async (id: string): Promise<any | null> => {
  try {
    const customer = await prisma.customer.findFirst({
      where: {
        OR: [{ id: id }, { customerId: id }],
      },
      select: {
        id: true,
        name: true,
        phone: true,
        company: true,
        walletBalance: true,
      },
    });
    if (customer) {
      return customer;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Error fetching customer by ID:", error);
    return null;
  }
};
