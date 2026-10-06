import { z } from "zod";

export const CategoryFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is Required"),
  photo: z.string().optional(),
  description: z.string().optional(),
  code: z.string().optional(),
  parentId: z.string().nullable().optional().default(null),
  status: z.string().optional(),
});
