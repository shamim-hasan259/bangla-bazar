import { z } from "zod";

export const UserFormSchema = z
  .object({
    name: z.string(),
    username: z
      .string()
      .min(5, {
        message: "Username must be at least 5 characters.",
      })
      .max(50, "max 50 characters"),
    email: z.union([z.string().email(), z.literal("")]),
    phone: z.string(),
    password: z
      .string()
      .min(1, "password is required")
      .min(6, "minimum 6 digit"),
    confirmPassword: z
      .string()
      .min(1, "password confirmation is required")
      .min(6, "minimum 6 digit"),
    warehouseId: z.string().optional(),
    type: z.string(),
    status: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Password do not Match",
  });
