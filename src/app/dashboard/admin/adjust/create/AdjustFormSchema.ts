import { z } from "zod";

export const AdjustFormSchema = z.object({
  userId: z.string().optional(),
  adjustMentNo: z.string().optional(),
  products: z.any().optional(),
  note: z.string().optional(),
  warehouseId: z.string().optional(),
  rcvAdjustmentQty: z.number().optional(),
  rcvAdjustmentTotal: z.number().optional(),
  issueAdjustQty: z.number().optional(),
  issueAdjustTotal: z.number().optional(),
  total: z.number().optional(),
  totalItem: z.number().optional(),
  grossTotal: z.number().optional(),
  grossTotalRound: z.number().optional(),
  status: z.string().default("Complete"),
});
