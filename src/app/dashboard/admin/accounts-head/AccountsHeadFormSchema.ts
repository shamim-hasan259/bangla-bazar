import { z } from "zod";

export const AccountsHeadFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is Required"),
  code: z.string().optional(),
  description: z.string().optional(),
  parentId: z.string().nullable().optional().default(null),
  photo: z.string().optional(),
  status: z.string().optional(),
});
