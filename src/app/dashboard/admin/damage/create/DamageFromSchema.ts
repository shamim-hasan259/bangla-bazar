import { z } from "zod";

export const DamageFormSchema = z.object({
  id: z.string().optional(),
  userId: z.string().optional(),
  damageNo: z.string().optional(),
  products: z.any().optional(),
  note: z.string().optional(),
  warehouseId: z.string().optional(),
  total: z.number().optional(),
  totalItem: z.number().optional(),
  grossTotal: z.number().optional(),
  grossTotalRound: z.number().optional(),
  status: z.string().default("Complete"),
});
