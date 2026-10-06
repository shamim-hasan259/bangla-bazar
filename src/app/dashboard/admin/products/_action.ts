"use server";
import prisma from "@/index";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ProductFormSchema } from "./create/ProductFormSchema";
import { parseSafeDate } from "@/lib/utils";

export type Product = z.infer<typeof ProductFormSchema>;

export const handleDelete = async (id: string) => {
  try {
    const deleteProduct = await prisma.product.delete({
      where: {
        id: id,
      },
    });
    if (deleteProduct) {
      revalidatePath("/dashboard/offers");
      return deleteProduct;
    }
  } catch (err) {
    console.error(err);
    return false;
  }
};

const safeRevalidate = (path: string) => {
  try {
    revalidatePath(path);
  } catch (e) {
    // Ignore when called outside Next.js request context
  }
};

const toValidObjectId = (val: any): string | undefined => {
  if (!val || typeof val !== "string") return undefined;
  const trimmed = val.trim();
  return /^[0-9a-fA-F]{24}$/.test(trimmed) ? trimmed : undefined;
};

export const saveProduct = async (id: string, data: Product) => {
  try {
    let {
      name,
      salesType,
      articleCode,
      ean,
      masterCategoryId,
      categoryId,
      unitId,
      brandId,
      vat,
      vatMethod,
      hsCode,
      type,
      shipping,
      featured,
      website,
      slug,
      description,
      specification,
      price,
      promoPrice,
      promoStart,
      promoEnd,
      photo,
      supplierId,
      openingQty,
      cogs,
      mrp,
      tp,
      picsInPackage,
      status,
    } = data;

    if (!name || name.trim() === "") return false;

    if (!articleCode || articleCode.trim() === "") {
      articleCode = `ART-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    }

    if (!slug || slug.trim() === "") {
      const slugBase = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
      slug = `${slugBase || "product"}-${Math.random().toString(36).substring(2, 6)}`;
    }

    // Ensure a valid unitId is always present since Unit is required in Product schema
    let validUnitId = toValidObjectId(unitId);
    if (!validUnitId) {
      let defaultUnit = await prisma.unit.findFirst();
      if (!defaultUnit) {
        defaultUnit = await prisma.unit.create({
          data: {
            name: "Piece",
            code: `PCS_${Math.random().toString(36).substring(2, 5)}`,
            status: "Active",
            symbol: "pc",
          },
        });
      }
      validUnitId = defaultUnit.id;
    }

    const formattedPrice = typeof price === "number" ? price : parseFloat(price || "0") || 0;
    const formattedPromoPrice = promoPrice ? parseFloat(promoPrice) : undefined;
    const formattedPromoStart = parseSafeDate(promoStart);
    const formattedPromoEnd = parseSafeDate(promoEnd);

    const prismaData: any = {
      name: name.trim(),
      salesType: (salesType || type || "Standerd") as any,
      articleCode: articleCode.trim(),
      ean: ean || undefined,
      masterCategoryId: toValidObjectId(masterCategoryId),
      categoryId: toValidObjectId(categoryId),
      unitId: validUnitId,
      brandId: toValidObjectId(brandId),
      vat: vat ?? 0,
      vatMethod: vatMethod ? "true" : "false",
      hsCode: hsCode || undefined,
      shipping: shipping || undefined,
      featured: featured || "false",
      website: website !== false ? "true" : "false",
      slug: slug.trim(),
      description: description || undefined,
      specification: specification || undefined,
      price: formattedPrice,
      promoPrice: formattedPromoPrice,
      promoStart: formattedPromoStart,
      promoEnd: formattedPromoEnd,
      photo: photo || undefined,
      supplierId: toValidObjectId(supplierId),
      mrp: mrp ?? formattedPrice,
      tp: tp ?? formattedPrice,
      picsInPackage: picsInPackage ?? 1,
      openingQty: openingQty ?? 0,
      cogs: cogs ?? 0,
      status: (status as any) || "Active",
    };

    if (!id || id.trim() === "") {
      const createProduct = await prisma.product.create({
        data: prismaData,
      });

      if (createProduct) {
        safeRevalidate("/dashboard/admin/products");
        safeRevalidate("/dashboard/products");
        safeRevalidate("/products");
        return createProduct;
      }
    } else {
      const updateProduct = await prisma.product.update({
        where: {
          id: id.trim(),
        },
        data: prismaData,
      });

      if (updateProduct) {
        safeRevalidate("/dashboard/admin/products");
        safeRevalidate("/dashboard/products");
        safeRevalidate("/products");
        return updateProduct;
      }
    }
  } catch (err) {
    console.error("saveProduct error:", err);
    return false;
  }
};

export const importProduct = async (data: any) => {
  try {
    const promises = data.map(
      async (item: any) => {
        const {
          name,
          salesType,
          articleCode,
          categoryId,
          brandId,
          supplierId,
          price,
          ean,
          vat,
          vatMethod,
          hsCode,
          shipping,
          featured,
          website,
          slug,
          description,
          specification,
          promoPrice,
          promoStart,
          promoEnd,
          photo,
          mrp,
          tp,
          picsInPackage,
          masterCategoryId,
          status,
          type,
          unitId,
        } = item;

        await prisma.product.create({
          data: {
            name,
            salesType: (salesType || type) as any,
            articleCode,
            categoryId,
            brandId,
            supplierId,
            price: price ? parseFloat(price) : 0,
            ean,
            vat: vat ? parseFloat(vat) : 0,
            vatMethod: (vatMethod === "true" || vatMethod === true) ? "true" : "false",
            hsCode,
            shipping,
            featured: featured || "false",
            website: (website === "true" || website === true) ? "true" : "false",
            slug,
            description,
            specification,
            promoPrice: promoPrice ? parseFloat(promoPrice) : undefined,
            promoStart: parseSafeDate(promoStart),
            promoEnd: parseSafeDate(promoEnd),
            photo,
            mrp: mrp ? parseFloat(mrp) : 0,
            tp: tp ? parseFloat(tp) : 0,
            picsInPackage: picsInPackage ? parseFloat(picsInPackage) : 0,
            masterCategoryId,
            status,
            unitId,
          },
        });
      }
    );

    await Promise.all(promises);
    revalidatePath("/dashboard/products");
  } catch (err) {
    console.error("importProduct error:", err);
    return false;
  }
};

export const searchProductDw = async (queryString: string) => {
  const isNumericQuery = /^\d+$/.test(queryString);
  let productList = [];
  if (isNumericQuery) {
    productList = await prisma.product.findMany({
      where: {
        OR: [
          { ean: { equals: queryString } },
          { articleCode: { equals: queryString } },
        ],
      },
      select: {
        id: true,
        name: true,
        articleCode: true,
      },
      take: 10,
    });
  } else {
    productList = await prisma.product.findMany({
      where: {
        name: {
          contains: queryString,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        name: true,
        articleCode: true,
      },
      take: 10,
    });
  }

  return productList.map((product) => ({
    value: product.id,
    label: `${product.name} [${product.articleCode}]`,
  }));
};

export const searchProductById = async (id: string) => {
  try {
    const product = await prisma.product.findFirst({
      where: {
        id: id,
      },
      include: {
        masterCategory: {
          select: {
            name: true,
          },
        },
        category: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!product) {
      throw new Error(`Product with id ${id} not found`);
    }

    return product;
  } catch (error) {
    console.error("Error fetching product by id:", error);
    throw error;
  }
};

export const UpdateProductStatus = async (id: string, status: string) => {
  try {
    const update = await prisma.product.update({
      where: {
        id: id,
      },
      //@ts-ignore
      data: { status: status },
    });

    if (update) {
      revalidatePath("/dashboard/products");
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("UpdateProductStatus error:", error);
    return false;
  }
};
