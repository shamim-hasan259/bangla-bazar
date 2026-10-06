"use server";
import prisma from "@/index";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ProductFormSchema } from "./create/ProductFormSchema";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export type Product = z.infer<typeof ProductFormSchema>;

export const handleDelete = async (id: string) => {
  try {
    const deleteProduct = await prisma.product.delete({
      where: {
        id: id,
      },
    });
    if (deleteProduct) {
      revalidatePath("/dashboard/seller/products");
      revalidatePath("/dashboard/admin/products");
      return deleteProduct;
    }
  } catch (err) {
    return false;
  }
};

async function validateCategoryUnderMaster(categoryId: string, masterCategoryId: string): Promise<boolean> {
  if (categoryId === masterCategoryId) return true;
  let currId = categoryId;
  for (let depth = 0; depth < 10; depth++) {
    const cat = await prisma.category.findUnique({
      where: { id: currId },
      select: { parentId: true }
    });
    if (!cat || !cat.parentId) return false;
    if (cat.parentId === masterCategoryId) return true;
    currId = cat.parentId;
  }
  return false;
}

// Helper function to sync product variants
const syncProductVariants = async (
  productId: string,
  hasVariants: boolean,
  variants: any,
  basePrice: number,
  baseMrp: number | null,
  baseTp: number | null,
  baseStock: number
) => {
  if (!hasVariants || !variants || !variants.data || !Array.isArray(variants.data)) {
    // Delete any existing variants if hasVariants is toggled off
    await prisma.productVariant.deleteMany({
      where: { productId }
    });
    return { totalStock: baseStock, price: basePrice, mrp: baseMrp, tp: baseTp };
  }

  const incomingVariants = variants.data;
  const incomingIds = incomingVariants.map((v: any) => v.id).filter(Boolean).filter((id: string) => /^[0-9a-fA-F]{24}$/.test(id));

  // Get existing database variants for this product
  const dbVariants = await prisma.productVariant.findMany({
    where: { productId }
  });

  // Find IDs to delete
  const dbIds = dbVariants.map(v => v.id);
  const toDeleteIds = dbIds.filter(id => !incomingIds.includes(id));

  if (toDeleteIds.length > 0) {
    await prisma.productVariant.deleteMany({
      where: { id: { in: toDeleteIds } }
    });
  }

  // Create or Update
  let totalStock = 0;
  for (const v of incomingVariants) {
    const vStock = parseInt(v.stock) || 0;
    totalStock += vStock;

    const variantRecord = {
      sku: v.sku || `${productId}-${v.color || ""}-${v.size || ""}-${Math.floor(Math.random() * 1000)}`,
      color: v.color || null,
      size: v.size || null,
      price: parseFloat(v.price) || basePrice,
      specialPrice: v.specialPrice ? parseFloat(v.specialPrice) : null,
      mrp: v.mrp ? parseFloat(v.mrp) : baseMrp,
      costPrice: v.costPrice ? parseFloat(v.costPrice) : baseTp,
      stock: vStock,
      barcode: v.barcode || null,
      images: v.images || [],
      availability: v.availability !== false,
    };

    const isValidObjectId = (id: string) => /^[0-9a-fA-F]{24}$/.test(id);

    if (v.id && isValidObjectId(v.id)) {
      const existing = await prisma.productVariant.findUnique({
        where: { id: v.id },
        select: { stock: true }
      });
      const oldStock = existing?.stock || 0;
      const diff = vStock - oldStock;

      await prisma.productVariant.update({
        where: { id: v.id },
        data: variantRecord
      });

      if (diff !== 0) {
        await prisma.stockLedger.create({
          data: {
            productId,
            variantId: v.id,
            type: "ManualAdjustment",
            quantity: diff,
            previousStock: oldStock,
            newStock: vStock,
            note: "Updated via product edit form"
          }
        });
      }
    } else {
      // Check if SKU exists to avoid collision
      const existing = await prisma.productVariant.findUnique({
        where: { sku: variantRecord.sku }
      });
      if (existing) {
        const oldStock = existing.stock || 0;
        const diff = vStock - oldStock;

        await prisma.productVariant.update({
          where: { id: existing.id },
          data: variantRecord
        });

        if (diff !== 0) {
          await prisma.stockLedger.create({
            data: {
              productId,
              variantId: existing.id,
              type: "ManualAdjustment",
              quantity: diff,
              previousStock: oldStock,
              newStock: vStock,
              note: "Updated via product edit form"
            }
          });
        }
      } else {
        const createdVariant = await prisma.productVariant.create({
          data: {
            ...variantRecord,
            productId
          }
        });

        if (vStock > 0) {
          await prisma.stockLedger.create({
            data: {
              productId,
              variantId: createdVariant.id,
              type: "InitialEntry",
              quantity: vStock,
              previousStock: 0,
              newStock: vStock,
              note: "Variant initial stock setup"
            }
          });
        }
      }
    }
  }

  // Determine pricing values from first variant
  let finalPrice = basePrice;
  let finalMrp = baseMrp;
  let finalTp = baseTp;

  if (incomingVariants.length > 0) {
    const first = incomingVariants[0];
    finalPrice = parseFloat(first.price) || finalPrice;
    finalMrp = first.mrp ? parseFloat(first.mrp) : finalMrp;
    finalTp = first.costPrice ? parseFloat(first.costPrice) : finalTp;
  }

  return { totalStock, price: finalPrice, mrp: finalMrp, tp: finalTp };
};

export const saveProduct = async (id: string, data: Product) => {
  console.log({ data, id });
  try {
    const {
      name,
      categoryId,
      masterCategoryId,
      storeId,
      productImgCollectionObject,
      video,
      model,
      brandId,
      // supplierId,
      color,
      picsInPackage,
      weight,
      unitId,
      salesType,
      hsCode,
      featured,
      website,
      price,
      mrp,
      tp,
      vat,
      stock,
      promoPrice,
      // promoStart,
      // promoEnd,
      description,
      highlight,
      variants,
      dimensions,
      dangerousGoods,
      hasVariants,
    } = data;

    // Backend category validation
    if (storeId && categoryId) {
      const store = await prisma.store.findUnique({
        where: { id: storeId },
        select: { masterCategoryId: true }
      });
      if (store) {
        const isValid = await validateCategoryUnderMaster(categoryId, store.masterCategoryId);
        if (!isValid) {
          throw new Error("Category validation failed: Selected category is not a descendant of the store's master category.");
        }
      }
    }

    let finalUnitId = unitId;
    if (!finalUnitId || finalUnitId === "") {
      const firstUnit = await prisma.unit.findFirst({
        where: { status: "Active" }
      });
      if (firstUnit) {
        finalUnitId = firstUnit.id;
      } else {
        const defaultUnit = await prisma.unit.create({
          data: {
            name: "Pcs",
            code: "pcs-" + Math.floor(Math.random() * 1000000),
            symbol: "pcs",
            status: "Active"
          }
        });
        finalUnitId = defaultUnit.id;
      }
    }

    if (id === "") {
      try {
        const session = await getServerSession(authOptions);
        let sellerId = session?.user?.type === "seller" ? session.user.id : undefined;

        let finalStoreId = storeId;
        let finalMasterCategoryId = masterCategoryId;

        if (session?.user?.type === "seller" || sellerId) {
          // Verify seller exists
          let currentSeller = null;
          if (sellerId) {
            currentSeller = await prisma.seller.findUnique({ where: { id: sellerId } });
          }
          if (!currentSeller && session?.user) {
            currentSeller = await prisma.seller.findFirst({
              where: {
                OR: [
                  { id: session.user.id },
                  { phone: session.user.phone || undefined },
                  { email: session.user.email || undefined },
                ],
              },
            });
          }

          if (!currentSeller) {
            throw new Error("Seller profile not found. Please log in again.");
          }

          sellerId = currentSeller.id;

          // Check store setup
          if (finalStoreId) {
            const storeRecord = await prisma.store.findFirst({
              where: {
                id: finalStoreId,
                sellerId: sellerId,
                deletedAt: null,
              },
            });
            if (!storeRecord) {
              throw new Error("Specified store not found or not owned by seller.");
            }
            if (storeRecord.status !== "Approved") {
              throw new Error("Your store is not approved by admin yet. Product upload is restricted until admin approval.");
            }
            finalMasterCategoryId = finalMasterCategoryId || storeRecord.masterCategoryId;
          } else {
            // Find seller's approved store
            const activeStore = await prisma.store.findFirst({
              where: {
                sellerId: sellerId,
                deletedAt: null,
                status: "Approved",
              },
              orderBy: { createdAt: "desc" },
            });

            if (!activeStore) {
              throw new Error("You must have an approved store before uploading products. Please wait for admin approval.");
            }

            finalStoreId = activeStore.id;
            finalMasterCategoryId = finalMasterCategoryId || activeStore.masterCategoryId;
          }
        } else {
          // Admin or system fallback
          if (finalStoreId) {
            const storeRecord = await prisma.store.findUnique({
              where: { id: finalStoreId },
              select: { sellerId: true, masterCategoryId: true }
            });
            if (storeRecord?.sellerId) {
              sellerId = storeRecord.sellerId;
            }
            if (storeRecord?.masterCategoryId && !finalMasterCategoryId) {
              finalMasterCategoryId = storeRecord.masterCategoryId;
            }
          }
          if (!sellerId) {
            const fallbackSeller = await prisma.seller.findFirst();
            sellerId = fallbackSeller ? fallbackSeller.id : undefined;
          }
        }

        const createProduct = await prisma.product.create({
          data: {
            name,
            category: categoryId ? { connect: { id: categoryId } } : undefined,
            masterCategory: finalMasterCategoryId ? { connect: { id: finalMasterCategoryId } } : undefined,
            photo: productImgCollectionObject || undefined,
            video: video || undefined,
            model: model || undefined,
            brand: brandId ? { connect: { id: brandId } } : undefined,
            seller: sellerId ? { connect: { id: sellerId } } : undefined,
            store: finalStoreId ? { connect: { id: finalStoreId } } : undefined,
            // supplierId: supplierId || undefined,
            color: color || undefined,
            picsInPackage,
            //@ts-ignore
            weight,
            unit: finalUnitId ? { connect: { id: finalUnitId } } : undefined,
            //@ts-ignore
            salesType: salesType || undefined,
            hsCode: hsCode || undefined,
            featured: featured || "false",
            website: website,
            price,
            mrp,
            tp,
            vat,
            stock,
            promoPrice,
            // promoStart,
            // promoEnd,
            description: description || undefined,
            highlight: highlight || undefined,
            variants: variants || undefined,
            dimensions: dimensions || undefined,
            dangerousGoods: dangerousGoods || undefined,
            hasVariants: hasVariants || false,
          },
        });
        console.log("from backend", createProduct);

        if (createProduct) {
          const syncResult = await syncProductVariants(
            createProduct.id,
            hasVariants || false,
            variants,
            price,
            mrp || null,
            tp || null,
            stock
          );

          const finalProduct = await prisma.product.update({
            where: { id: createProduct.id },
            data: {
              stock: syncResult.totalStock,
              availableQty: syncResult.totalStock,
              closingQty: syncResult.totalStock,
              price: syncResult.price,
              mrp: syncResult.mrp,
              tp: syncResult.tp,
            }
          });

          if (!hasVariants && syncResult.totalStock > 0) {
            await prisma.stockLedger.create({
              data: {
                productId: createProduct.id,
                type: "InitialEntry",
                quantity: syncResult.totalStock,
                previousStock: 0,
                newStock: syncResult.totalStock,
                note: "Product initial stock setup"
              }
            });
          }

          revalidatePath("/dashboard/seller/products");
          revalidatePath("/dashboard/admin/products");
          return finalProduct;
        }
      } catch (error) {
        console.log(error);
      }
    } else {
      try {
        let updateSellerId: string | undefined = undefined;
        if (storeId) {
          const storeRecord = await prisma.store.findUnique({
            where: { id: storeId },
            select: { sellerId: true }
          });
          if (storeRecord?.sellerId) {
            updateSellerId = storeRecord.sellerId;
          }
        }

        const updateProduct = await prisma.product.update({
          where: {
            id: id,
          },
          data: {
            name,
            category: categoryId ? { connect: { id: categoryId } } : undefined,
            masterCategory: masterCategoryId ? { connect: { id: masterCategoryId } } : undefined,
            photo: productImgCollectionObject || undefined,
            video: video || undefined,
            model: model || undefined,
            brand: brandId ? { connect: { id: brandId } } : undefined,
            seller: updateSellerId ? { connect: { id: updateSellerId } } : undefined,
            store: storeId ? { connect: { id: storeId } } : undefined,
            color: color || undefined,
            picsInPackage,
            //@ts-ignore
            weight,
            unit: finalUnitId ? { connect: { id: finalUnitId } } : undefined,
            //@ts-ignore
            salesType: salesType || undefined,
            hsCode: hsCode || undefined,
            featured: featured || "false",
            website: website,
            price,
            mrp,
            tp,
            vat,
            stock,
            promoPrice,
            description: description || undefined,
            highlight: highlight || undefined,
            variants: variants || undefined,
            dimensions: dimensions || undefined,
            dangerousGoods: dangerousGoods || undefined,
            hasVariants: hasVariants || false,
          },
        });

        if (updateProduct) {
          const syncResult = await syncProductVariants(
            updateProduct.id,
            hasVariants || false,
            variants,
            price,
            mrp || null,
            tp || null,
            stock
          );

          const finalProduct = await prisma.product.update({
            where: { id: updateProduct.id },
            data: {
              stock: syncResult.totalStock,
              availableQty: syncResult.totalStock,
              closingQty: syncResult.totalStock,
              price: syncResult.price,
              mrp: syncResult.mrp,
              tp: syncResult.tp,
            }
          });

          if (!hasVariants) {
            const oldStock = updateProduct.stock || 0;
            const diff = syncResult.totalStock - oldStock;
            if (diff !== 0) {
              await prisma.stockLedger.create({
                data: {
                  productId: updateProduct.id,
                  type: "ManualAdjustment",
                  quantity: diff,
                  previousStock: oldStock,
                  newStock: syncResult.totalStock,
                  note: "Updated via product edit form"
                }
              });
            }
          }

          revalidatePath("/dashboard/seller/products");
          revalidatePath("/dashboard/admin/products");
          return finalProduct;
        }
      } catch (error) {
        console.log(error);
      }
    }
  } catch (err) {
    console.log(err);
    return "Failed to save product";
  }
};

//import product from csv function
// export const importProduct = async (data: any) => {
//   try {
//     const promises = data.map(
//       async ({
//         name,
//         salesType,
//         articleCode,
//         categoryId,
//         brandId,
//         supplierId,
//         price,
//         ean,
//         vat,
//         vatMethod,
//         hsCode,
//         shipping,
//         featured,
//         website,
//         slug,
//         description,
//         specification,
//         promoPrice,
//         promoStart,
//         promoEnd,
//         photo,
//         mrp,
//         tp,
//         pisInPackege,
//         masterCategoryId,
//         status,
//         type,
//         unitId,
//       }) => {
//         await prisma.product.create({
//           data: {
//             name,
//             salesType,
//             articleCode,
//             categoryId,
//             brandId,
//             supplierId,
//             price, // Convert price to number
//             ean,
//             vat,
//             vatMethod: vatMethod === "true",
//             hsCode,
//             shipping,
//             featured,
//             website,
//             slug,
//             description,
//             specification,
//             promoPrice, // Convert promoPrice to number if needed
//             promoStart,
//             promoEnd,
//             photo,
//             mrp,
//             tp,
//             pisInPackege,
//             masterCategoryId,
//             status,
//             type,
//             unitId,
//           },
//         });
//       }
//     );

//     await Promise.all(promises);
//     revalidatePath("/dashboard/product");
//   } catch (err) {
//     err;
//     return false;
//   }
// };

// PRODUCT SEARCH CUSTOME SELECT
// export const searchProductDw = async (queryString: string) => {
//   // Check if the queryString contains only numbers
//   const isNumericQuery = /^\d+$/.test(queryString);
//   //  ("isNumariceQuery: " + isNumericQuery);
//   let productList = [];
//   if (isNumericQuery) {
//     //  ("numeric function trigger");
//     //  ("check number");
//     // If the query is a number, search for matches in the EAN code or article code
//     productList = await prisma.product.findMany({
//       where: {
//         OR: [
//           { ean: { equals: queryString } },
//           { articleCode: { equals: queryString } },
//         ],
//       },
//       select: {
//         id: true,
//         name: true,
//         articleCode: true,
//       },
//       take: 10,
//     });
//   } else {
//     const firstWord = queryString.split(" ")[0];
//     // If the query is a string, search for matches in the product name
//     productList = await prisma.product.findMany({
//       where: {
//         name: {
//           contains: queryString,
//           // startsWith: firstWord,
//           mode: "insensitive",
//         },
//       },
//       select: {
//         id: true,
//         name: true,
//         articleCode: true,
//       },
//       take: 10,
//     });
//   }

//   return productList.map((product) => ({
//     value: product.id,
//     label: `${product.name} [${product.articleCode}]`,
//   }));
// };

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
      // select: {
      //   id: true,
      //   name: true,
      //   articleCode: true,
      //   categoryId: true,
      //   mrp: true,
      //   tp: true,
      //   hsCode: true,
      //   openingQty: true,
      //   cogs: true,
      //   closingQty: true,
      //   vat: true,
      //   price:true,
      //   // Add all other fields you want to fetch here
      // },
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
  //  ("Triggered update", id, status);
  try {
    const update = await prisma.product.update({
      where: {
        id: id,
      },
      //@ts-ignore
      data: { status: status },
    });

    if (update) {
      // ("update successful");
      revalidatePath("/dashboard/products");
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("sales update error", error);
    return false;
  }
};

export const UpdateProductPrice = async (id: string, price: number, tp?: number | null) => {
  try {
    const update = await prisma.product.update({
      where: {
        id: id,
      },
      data: {
        price: price,
        tp: tp === null ? null : tp,
      },
    });

    if (update) {
      revalidatePath("/dashboard/seller/products");
      return true;
    }
    return false;
  } catch (error) {
    console.error("Update product price error", error);
    return false;
  }
};

export const UpdateProductStock = async (id: string, stock: number) => {
  try {
    const update = await prisma.product.update({
      where: {
        id: id,
      },
      data: {
        stock: stock,
        availableQty: Math.round(stock),
      },
    });

    if (update) {
      revalidatePath("/dashboard/seller/products");
      return true;
    }
    return false;
  } catch (error) {
    console.error("Update product stock error", error);
    return false;
  }
};

export const fetchAllCategories = async () => {
  try {
    const categories = await prisma.category.findMany({
      where: {
        status: "Active",
      },
      select: {
        id: true,
        name: true,
        code: true,
        parentId: true,
      },
    });
    return categories;
  } catch (error) {
    console.error("Error fetching all categories:", error);
    return [];
  }
};

export const getSellerDashboardData = async () => {
  try {
    const session = await getServerSession(authOptions);
    const sellerId = session?.user?.type === "seller" ? session.user.id : undefined;

    if (!sellerId) {
      return null;
    }

    const seller = await prisma.seller.findUnique({
      where: { id: sellerId },
      select: {
        id: true,
        name: true,
        walletBalance: true,
        commissionRate: true,
      }
    });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const sales = await prisma.sales.findMany({
      where: {
        sellerIds: { has: sellerId },
        createdAt: { gte: thirtyDaysAgo }
      },
      select: {
        id: true,
        grossTotal: true,
        createdAt: true,
        status: true,
        products: true,
      }
    });

    const analytics = await prisma.analyticsEvent.findMany({
      where: {
        sellerId: sellerId,
        createdAt: { gte: thirtyDaysAgo }
      },
      select: {
        eventType: true,
        device: true,
      }
    });

    return {
      seller,
      sales,
      analytics
    };
  } catch (error) {
    console.error("Error fetching seller dashboard data:", error);
    return null;
  }
};

// AI API helper function with fallback support
const callGeminiAPI = async (prompt: string, isJson: boolean = false) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { success: false, error: "GEMINI_API_KEY is not configured in environment variables." };
  }

  const models = ["gemini-2.5-flash", "gemini-3.5-flash", "gemini-flash-latest", "gemini-2.0-flash"];
  let lastError = "";

  for (const model of models) {
    try {
      const requestBody: any = {
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      };
      
      if (isJson) {
        requestBody.generationConfig = {
          responseMimeType: "application/json"
        };
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (text) {
          return { success: true, text };
        }
      } else {
        const errorData = await response.json();
        lastError = errorData.error?.message || `Gemini API returned error status: ${response.status}`;
        console.warn(`Gemini model ${model} failed: ${lastError}. Trying next model...`);
      }
    } catch (error: any) {
      lastError = error.message || "Network connection error.";
      console.error(`Error calling Gemini model ${model}:`, error);
    }
  }

  return { success: false, error: lastError };
};

export const optimizeTitleAction = async (currentTitle: string) => {
  const prompt = `You are an expert e-commerce SEO optimization assistant. Your task is to take a raw product title/name and optimize it to make it professional, appealing, and SEO-friendly for an e-commerce platform. Keep it within 100 characters. Return ONLY the optimized title as plain text, without any introductory text, quotes, or markdown.
Raw Title: ${currentTitle}`;

  const res = await callGeminiAPI(prompt, false);
  if (res.success && res.text) {
    return { success: true, title: res.text };
  }
  return { success: false, error: res.error };
};

export const generateDescriptionAndHighlightsAction = async (keywords: string) => {
  const prompt = `You are an expert e-commerce copywriter. Take these product keywords/features and generate a high-quality product description (written in professional and engaging HTML format with paragraph tags <p> and bold text <strong> where appropriate) and a list of key highlights (4-5 key bullet points).
Keywords/Features: ${keywords}
Return your response as a JSON object with exactly two keys:
1. "description": HTML string containing paragraphs, bold text, etc., summarizing the product beautifully. Do NOT use markdown code blocks inside the HTML.
2. "highlights": A string containing the key highlights as a comma-separated list of short sentences (e.g., "Premium quality cotton, Lightweight and breathable, Slim fit styling, Durable stitching").

Ensure that the JSON is valid. Only return the JSON object, no wrapping markdown blocks or other text.`;

  const res = await callGeminiAPI(prompt, true);
  if (res.success && res.text) {
    try {
      const parsed = JSON.parse(res.text);
      return { success: true, data: parsed };
    } catch (e: any) {
      return { success: false, error: "Failed to parse generated JSON content from Gemini." };
    }
  }
  return { success: false, error: res.error };
};

export const checkSellerStoreStatus = async () => {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return { hasStore: false, hasApprovedStore: false, stores: [] };
    }

    const seller = await prisma.seller.findFirst({
      where: {
        OR: [
          { id: session.user.id },
          { phone: session.user.phone || undefined },
          { email: session.user.email || undefined },
        ],
      },
    });

    if (!seller) {
      return { hasStore: false, hasApprovedStore: false, stores: [] };
    }

    const stores = await prisma.store.findMany({
      where: {
        sellerId: seller.id,
        deletedAt: null,
      },
      select: {
        id: true,
        storeNameEn: true,
        status: true,
        masterCategoryId: true,
      },
    });

    const hasStore = stores.length > 0;
    const hasApprovedStore = stores.some((s) => s.status === "Approved");

    return { hasStore, hasApprovedStore, stores };
  } catch (err) {
    console.error("Error checking seller store status:", err);
    return { hasStore: false, hasApprovedStore: false, stores: [] };
  }
};
