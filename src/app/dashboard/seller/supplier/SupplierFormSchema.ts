import { z } from "zod";

export const SupplierFormSchema = z.object({
  name: z.string().min(1, "Name is Required"),
  phone: z.string().min(1, "Phone is Required"),
  email: z.string().optional(),
  address: z.string().optional(),
  company: z.string().optional(),
  country: z.string().optional(),
  designation: z.string().optional(),
  description: z.string().optional(),
  status: z.string(),
});
