import { z } from "zod";

export const BannerFormSchema = z.object({
  title: z.string().optional(),
  badge: z.string().optional(),
  discount: z.string().optional(),
  subtitle: z.string().optional(),
  imageUrl: z.string().min(1, "Image is required"),
  link: z.string().optional(),
  type: z.enum(["MainSlider", "RightPromo", "BottomPromo"]),
  status: z.enum(["Active", "Inactive"]),
  order: z.number().int().min(0),
});

export type BannerFormValues = z.infer<typeof BannerFormSchema>;
