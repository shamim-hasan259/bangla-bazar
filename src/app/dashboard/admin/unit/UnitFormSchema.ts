import { z } from "zod";

export const UnitFormSchema = z.object({
  name: z.string().min(1, "Name is Required"),
  symbol: z.string().min(1, "Symbol is Required"),
  description: z.string().optional(),
  code: z.string().min(1, "Code is Required"),
  status: z.string(),
});
