import { z } from "zod";

// Define the validation schema for the customer form
export const CustomerFormSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  phone: z.string().min(1, { message: "Phone is required" }),
  email: z
    .string()
    .email("Invalid email address")
    .optional()
    .or(z.literal("")),
  photo: z.string().optional(),
  username: z.string().optional(),
  password: z.string().optional(),
  type: z.string().optional(),
  due: z.number().optional(),
  dueType: z.any().optional(),

  // corporate
  contactPerson: z.string().optional(),
  contactPersonPhone: z.string().optional(),
  company: z.string().optional(),
  designation: z.string().optional(),
  bin: z.string().optional(),
  tin: z.string().optional(),
  treadLicense: z.string().optional(),
  creditOption: z.string().optional(),
  cLimitAmount: z.string().optional(),
  cLimitDay: z.string().optional(),
  status: z.string().min(1, { message: "Status is required" }),
});
