import { z } from "zod";

const numericFieldOptional = z.preprocess(
  (val) => (val === "" || val === undefined || val === null || Number.isNaN(Number(val)) ? undefined : Number(val)),
  z.number().optional()
);

const numericFieldRequiredPositive = z.preprocess(
  (val) => (val === "" || val === undefined || val === null || Number.isNaN(Number(val)) ? undefined : Number(val)),
  z.number({ required_error: "Price is required" }).positive({ message: "Price must be greater than 0" })
);

const numericFieldRequiredNonNegative = z.preprocess(
  (val) => (val === "" || val === undefined || val === null || Number.isNaN(Number(val)) ? undefined : Number(val)),
  z.number({ required_error: "Stock is required" }).min(0, { message: "Stock quantity must be at least 0" })
);

export const ProductFormSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  categoryId: z.string().optional(),
  masterCategoryId: z.string().optional(),
  storeId: z.string().optional(),
  photo: z.any(),
  productImgCollectionObject: z.any().optional(),
  video: z.string().optional(),
  ytVideoLink: z.string().optional(),
  model: z.string().optional(),
  brandId: z.string().optional(),
  supplierId: z.string().optional(),
  color: z.string().optional(),
  picsInPackage: numericFieldOptional,
  weight: numericFieldOptional,
  unitId: z.string().optional(),
  salesType: z.string().optional(),
  hsCode: z.string().optional(),
  featured: z.string().optional(),
  website: z.string().optional(),
  price: numericFieldRequiredPositive,
  mrp: numericFieldOptional,
  tp: numericFieldOptional,
  vat: numericFieldOptional,
  stock: numericFieldRequiredNonNegative,
  promoPrice: numericFieldOptional,
  promoStart: z.date().optional(),
  promoEnd: z.date().optional(),
  description: z.string().optional(),
  highlight: z.string().optional(),
  variants: z.any().optional(),
  dimensions: z.any().optional(),
  dangerousGoods: z.string().optional(),
  hasVariants: z.boolean().optional(),
});

