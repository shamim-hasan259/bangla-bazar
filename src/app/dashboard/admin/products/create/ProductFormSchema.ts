import { z } from "zod";

export const ProductFormSchema = z.object({
  name: z.string().min(1, "Name is Required"), //done
  salesType: z.string().optional(), //done
  articleCode: z.string().optional(), //done
  ean: z.string().optional(), //done
  masterCategoryId: z.string().optional(), //done
  categoryId: z.string().optional(), //done
  unitId: z.string().optional(),
  brandId: z.string().optional(), //done
  vat: z.number().min(0).optional(), //done
  vatMethod: z.boolean().optional(), //done
  hsCode: z.string().optional(), //done
  type: z.string().optional(), //done
  shipping: z.string().optional(),
  featured: z.string().optional(),
  website: z.boolean().optional(),
  slug: z.string().optional(), //done
  description: z.string().optional(), //done
  specification: z.string().optional(), //done
  price: z.number().min(0, "Price must be positive").optional(),
  promoPrice: z.string().optional(), //done
  promoStart: z.date().optional(), //done
  promoEnd: z.date().optional(), //done
  photo: z.string().optional(),
  // gallery: z.string().optional(),
  supplierId: z.string().optional(), //done

  openingQty: z.number().min(0).optional(),
  soldQty: z.number().min(0).optional(),
  returnQty: z.number().min(0).optional(),
  damageQty: z.number().min(0).optional(),
  closingQty: z.number().min(0).optional(),
  cogs: z.number().min(0).optional(),
  mrp: z.number().min(0).optional(), //done
  tp: z.number().min(0).optional(), //done

  picsInPackage: z.number().min(0).optional(), //done
  status: z.string().optional(), //done
});
