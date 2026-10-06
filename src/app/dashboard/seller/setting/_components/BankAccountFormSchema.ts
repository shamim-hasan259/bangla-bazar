import { z } from "zod";

export const BankAccountFormSchema = z.object({
  accountTitle: z.string().nonempty("Account Title is required"),
  accountNumber: z
    .string()
    .nonempty("Account Number is required")
    .regex(/^\d+$/, "Account Number must be numeric"),
  bankName: z.string().nonempty("Business Registration Number is required"),
  branch: z.string().nonempty("Branch is required"),
  routingNumber: z
    .string()
    .nonempty("Routing Number is required")
    .regex(/^\d+$/, "Routing Number must be numeric"),
});
