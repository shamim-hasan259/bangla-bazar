import { z } from "zod";

export const RegistrationFormSchema = z.object({
  name: z.string().min(2, { message: "Name is required" }),
  phone: z.string().min(6, { message: "Phone number is required" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  nidFront: z.string().optional(),
  nidBack: z.string().optional(),
  photo: z.string().optional(),
});

