import { z } from "zod";

export const StoreSetupFormSchema = z.object({
  storeName: z.string().min(2, { message: "Store name is required" }),
  description: z.string().optional(),
  phone: z.string().min(10, { message: "Phone number is required" }),
  // storeLogo: z.string(),
  // storeBanner: z.string(),
  email: z.string().email({ message: "Enter a valid email address" }),
  address: z.string().optional(),
  facebook: z.string().optional(),
  instagram: z.string().optional(),
  x: z.string().optional(),
});
