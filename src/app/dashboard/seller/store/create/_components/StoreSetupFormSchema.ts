import { z } from "zod";

export const StoreSetupFormSchema = z.object({
  storeNameBn: z.string().min(2, { message: "Store Name (Bangla) is required" }),
  storeNameEn: z.string().min(2, { message: "Store Name (English) is required" }),
  slug: z.string()
    .min(3, { message: "Store Slug must be at least 3 characters" })
    .regex(/^[a-z0-9-]+$/, { message: "URL slug can only contain lowercase letters, numbers, and hyphens" }),
  masterCategoryId: z.string().min(1, { message: "Please select a master category" }),
  description: z.string().optional(),
  phone: z.string().min(10, { message: "Phone number is required" }),
  email: z.string().email({ message: "Enter a valid email address" }),
  address: z.string().optional(),
  facebook: z.string().optional(),
  instagram: z.string().optional(),
  x: z.string().optional(),
});
