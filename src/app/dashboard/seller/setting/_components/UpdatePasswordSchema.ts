import { z } from "zod";

export const UpdatePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(6, { message: "Current password min 6 character" }),
  newPassword: z.string().min(6, { message: "New password min 6 character" }),
  confirmPassword: z
    .string()
    .min(6, { message: "New password min 6 character" }),
});
