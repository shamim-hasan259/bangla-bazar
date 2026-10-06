import { z } from "zod";

export const WireHouseFormSchema = z.object({
  name: z.string().min(1, "Name is Required"),
  company: z.string(),
  code: z.string().min(1, "Code is Required"),
  address: z.string(),
  type: z.string(),
  email:z.string(),
  phone:z.string(),
  status: z.string()
});
