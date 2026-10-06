import { z } from "zod";

export const VendorFormSchema = z.object({
  name: z.string().min(1, "Name is Required"),
  phone: z.string().min(1, "Phone is Required"),
  email: z.string().optional(),
  address: z.string().optional(),
  country: z.string().optional(),
  district: z.string().optional(),
  division: z.string().optional(),
  commissionRate: z.number().optional(),
  status: z.string(),
});
