import { z } from "zod";

export const LoginFormSchema = z.object({
  phone: z.string({ message: "Phone number is required" }),
  password: z.string().min(1, "Password is required").min(6, "minimum 6 digit"),
});
