import { z } from "zod";

export const AccountSettingFormSchema = z.object({
  name: z.string().min(2, { message: "Name is required" }),
  phone: z.string().min(10, { message: "Phone number is required" }),
  email: z.string().email({ message: "Enter a valid email address" }),
  code: z.string().min(4, { message: "Code required" }),
});
