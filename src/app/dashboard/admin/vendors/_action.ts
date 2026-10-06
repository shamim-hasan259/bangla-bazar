"use server";
import prisma from "@/index";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import bcrypt from "bcrypt";
import { VendorFormSchema } from "./VendorFormSchema";

export type Vendor = z.infer<typeof VendorFormSchema>;

export const handleDelete = async (id: string) => {
  try {
    const seller = await prisma.seller.delete({
      where: {
        id: id,
      },
    });
    if (seller) {
      revalidatePath("/dashboard/admin/vendors");
      revalidatePath("/dashboard/seller");
      return { success: true, message: "Vendor deleted successfully!" };
    }
    return { success: false, message: "Vendor not found." };
  } catch (err: any) {
    console.error("Error deleting vendor:", err);
    return { success: false, message: err.message || "Failed to delete vendor" };
  }
};

export const saveVendor = async (id: string, data: Vendor) => {
  try {
    let {
      name,
      phone,
      email,
      address,
      country,
      district,
      division,
      commissionRate,
      status,
    } = data;

    if (!name || !name.trim()) {
      return { success: false, message: "Vendor name is required!" };
    }
    if (!phone || !phone.trim()) {
      return { success: false, message: "Vendor phone number is required!" };
    }

    const cleanPhone = phone.trim();
    const cleanEmail = email && email.trim() !== "" ? email.trim() : null;
    const parsedCommission = typeof commissionRate === "number" && !isNaN(commissionRate) ? commissionRate : 10;
    const vendorStatus = (status === "Inactive" ? "Inactive" : "Active") as any;

    if (id && id.trim() !== "") {
      // Check phone conflict with other vendors
      const phoneConflict = await prisma.seller.findFirst({
        where: {
          id: { not: id },
          phone: cleanPhone,
        },
      });

      if (phoneConflict) {
        return { success: false, message: "Another vendor already uses this phone number!" };
      }

      if (cleanEmail) {
        const emailConflict = await prisma.seller.findFirst({
          where: {
            id: { not: id },
            email: cleanEmail,
          },
        });
        if (emailConflict) {
          return { success: false, message: "Another vendor already uses this email address!" };
        }
      }

      const updateVendor = await prisma.seller.update({
        where: {
          id: id,
        },
        data: {
          name: name.trim(),
          phone: cleanPhone,
          email: cleanEmail,
          address: address?.trim() || "",
          country: country?.trim() || "Bangladesh",
          district: district?.trim() || "",
          division: division?.trim() || "",
          commissionRate: parsedCommission,
          status: vendorStatus,
        },
      });

      if (updateVendor) {
        revalidatePath("/dashboard/admin/vendors");
        revalidatePath("/dashboard/seller");
        return { success: true, data: updateVendor, message: "Vendor updated successfully!" };
      }
    } else {
      // Check if phone already exists
      const existingSeller = await prisma.seller.findFirst({
        where: {
          OR: [
            { phone: cleanPhone },
            ...(cleanEmail ? [{ email: cleanEmail }] : []),
          ],
        },
      });

      if (existingSeller) {
        if (existingSeller.phone === cleanPhone) {
          return { success: false, message: "A vendor with this phone number already exists!" };
        }
        if (cleanEmail && existingSeller.email === cleanEmail) {
          return { success: false, message: "A vendor with this email address already exists!" };
        }
      }

      const hashedPassword = await bcrypt.hash("password123", 10);
      const generatedSellerId = `SLR-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

      const createVendor = await prisma.seller.create({
        data: {
          name: name.trim(),
          email: cleanEmail,
          phone: cleanPhone,
          address: address?.trim() || "",
          country: country?.trim() || "Bangladesh",
          district: district?.trim() || "",
          division: division?.trim() || "",
          commissionRate: parsedCommission,
          type: "Seller",
          password: hashedPassword,
          sellerId: generatedSellerId,
          status: vendorStatus,
        },
      });

      if (createVendor) {
        revalidatePath("/dashboard/admin/vendors");
        revalidatePath("/dashboard/seller");
        return { success: true, data: createVendor, message: "Vendor created successfully!" };
      }
    }

    return { success: false, message: "Unable to save vendor data." };
  } catch (err: any) {
    console.error("Error creating/updating vendor:", err);
    return { success: false, message: err.message || "Failed to save vendor." };
  }
};

export const VendorDw = async () => {
  try {
    const sellers = await prisma.seller.findMany({
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
        label: "Select Vendor",
      },
    ];

    sellers.forEach((seller) => {
      dw.push({
        value: seller.id,
        label: seller.name,
      });
    });

    return dw;
  } catch (error) {
    console.error("Error fetching parent sellers:", error);
    throw new Error("Failed to fetch sellers");
  }
};

export const UpdateVendorStatus = async (id: string, status: string) => {
  try {
    const update = await prisma.seller.update({
      where: {
        id: id,
      },
      data: {
        status: (status as any) || "Active",
      },
    });

    if (update) {
      revalidatePath("/dashboard/admin/vendors");
      revalidatePath("/dashboard/seller");
      return update;
    }
  } catch (error) {
    console.error("Error updating vendor status:", error);
    return false;
  }
};

export const getVendorById = async (id: string) => {
  try {
    const seller = await prisma.seller.findUnique({
      where: {
        id: id,
      },
    });

    if (seller) {
      return seller;
    }
  } catch (err) {
    console.error("Error getting vendor by id:", err);
    return false;
  }
};
