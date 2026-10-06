import { z } from "zod";

export const addressFormSchema = z.object({
  type: z.string().default("home"),
  name: z.string().min(3, {
    message: "Name must be at least 3 characters.",
  }),
  country: z.string().optional().default("Bangladesh"),
  // If these are required for checkout, remove .optional()
  district: z.string().min(1, "District is required"), 
  city: z.string().min(1, "City is required"),
  streetAddress: z.string().min(1, "Street address is required"),
  zipCode: z.string().min(1, "Zip code is required"),
  
  // Update Phone:
  phone: z
    .string()
    .min(1, { message: "Phone number is required" }) // Catches empty string
    .min(11, { message: "Phone number must be at least 11 digits" }),
    
  email: z.union([
    z.string().email("Invalid email address"),
    z.literal("")
  ]).optional(),
});
