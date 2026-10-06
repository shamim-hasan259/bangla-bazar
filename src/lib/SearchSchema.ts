import { z } from "zod";

export const SearchSchema = z.object({
  search: z.string(),
  category: z.string().optional(),
});
