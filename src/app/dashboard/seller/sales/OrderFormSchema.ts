import { z } from "zod";

export const OrderFormSchema = z.object({
  offerId: z.string().min(1, "offer required"),
  customerId: z.string().min(1, "customer required"),
  userId: z.string().min(1, "User required"),
  amount: z.string().optional(),
  paymentMethod: z.string().optional(),
  status: z.enum(["Complete", "Pending", "Ordered", "Delete"]),
});
