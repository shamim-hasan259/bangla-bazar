import { z } from "zod";

export const BusinessInfoFormSchema = z.object({
  sellerType: z.string().min(1, "Seller type is required"),
  businessName: z.string().min(1, "Business name is required"),
  businessRegistrationNumber: z
    .string()
    .min(1, "Registration number is required"),
  address: z.string().optional(),
  city: z.string().min(1, "City is required"),
  country: z.string().min(1, "Country is required"),
});
