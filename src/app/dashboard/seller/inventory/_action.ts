"use server";

import prisma from "@/index";
import { revalidatePath } from "next/cache";

// Helper function to validate ObjectId
const isValidObjectId = (id: string) => /^[0-9a-fA-F]{24}$/.test(id);

// 1. SALE INVENTORY OUT (Customer buys product/variant)
export const saleInvetoryOut = async (products: any) => {
  if (products && products.length > 0) {
    for (const product of products) {
      const { id, variantId, qty } = product;
      try {
        let prevStock = 0;
        let newStock = 0;

        if (variantId && isValidObjectId(variantId)) {
          const variant = await prisma.productVariant.findUnique({
            where: { id: variantId },
            select: { stock: true }
          });
          prevStock = variant?.stock || 0;
          newStock = Math.max(0, prevStock - qty);

          await prisma.productVariant.update({
            where: { id: variantId },
            data: { stock: newStock }
          });
        }

        const findProduct = await prisma.product.findUnique({
          where: { id: id },
          select: {
            soldQty: true,
            availableQty: true,
            closingQty: true,
            stock: true,
          },
        });

        if (findProduct) {
          const updatedStock = Math.max(0, (findProduct.stock || 0) - qty);
          if (!variantId) {
            prevStock = findProduct.stock || 0;
            newStock = updatedStock;
          }

          await prisma.product.update({
            where: { id: id },
            data: {
              soldQty: (findProduct.soldQty || 0) + qty,
              availableQty: Math.max(0, (findProduct.availableQty || 0) - qty),
              closingQty: Math.max(0, (findProduct.closingQty || 0) - qty),
              stock: updatedStock,
            },
          });
        }

        // Write audit log to StockLedger
        await prisma.stockLedger.create({
          data: {
            productId: id,
            variantId: variantId && isValidObjectId(variantId) ? variantId : null,
            type: "Sale",
            quantity: -qty,
            previousStock: prevStock,
            newStock: newStock,
            note: "Customer checkout purchase",
          }
        });
      } catch (err) {
        console.error("saleInvetoryOut error:", err);
      }
    }
  }
};

// 2. SALE INVENTORY IN (Order cancelled / returned)
export const saleInvetoryIn = async (products: any) => {
  if (products && products.length > 0) {
    for (const product of products) {
      const { id, variantId, qty } = product;
      try {
        let prevStock = 0;
        let newStock = 0;

        if (variantId && isValidObjectId(variantId)) {
          const variant = await prisma.productVariant.findUnique({
            where: { id: variantId },
            select: { stock: true }
          });
          prevStock = variant?.stock || 0;
          newStock = prevStock + qty;

          await prisma.productVariant.update({
            where: { id: variantId },
            data: { stock: newStock }
          });
        }

        const findProduct = await prisma.product.findUnique({
          where: { id: id },
          select: {
            soldQty: true,
            availableQty: true,
            closingQty: true,
            stock: true,
          },
        });

        if (findProduct) {
          const updatedStock = (findProduct.stock || 0) + qty;
          if (!variantId) {
            prevStock = findProduct.stock || 0;
            newStock = updatedStock;
          }

          await prisma.product.update({
            where: { id: id },
            data: {
              soldQty: Math.max(0, (findProduct.soldQty || 0) - qty),
              availableQty: (findProduct.availableQty || 0) + qty,
              closingQty: (findProduct.closingQty || 0) + qty,
              stock: updatedStock,
            },
          });
        }

        // Write audit log to StockLedger
        await prisma.stockLedger.create({
          data: {
            productId: id,
            variantId: variantId && isValidObjectId(variantId) ? variantId : null,
            type: "Return",
            quantity: qty,
            previousStock: prevStock,
            newStock: newStock,
            note: "Order cancelled - stock returned",
          }
        });
      } catch (err) {
        console.error("saleInvetoryIn error:", err);
      }
    }
  }
};

// 3. RETURN INVENTORY IN
export const returnInvetoryIn = async (products: any) => {
  if (products && products.length > 0) {
    for (const product of products) {
      const { id, variantId, qty } = product;
      try {
        let prevStock = 0;
        let newStock = 0;

        if (variantId && isValidObjectId(variantId)) {
          const variant = await prisma.productVariant.findUnique({
            where: { id: variantId },
            select: { stock: true }
          });
          prevStock = variant?.stock || 0;
          newStock = prevStock + qty;

          await prisma.productVariant.update({
            where: { id: variantId },
            data: { stock: newStock }
          });
        }

        const findProduct = await prisma.product.findUnique({
          where: { id: id },
          select: {
            returnQty: true,
            availableQty: true,
            closingQty: true,
            stock: true,
          },
        });

        if (findProduct) {
          const updatedStock = (findProduct.stock || 0) + qty;
          if (!variantId) {
            prevStock = findProduct.stock || 0;
            newStock = updatedStock;
          }

          await prisma.product.update({
            where: { id: id },
            data: {
              returnQty: (findProduct.returnQty || 0) + qty,
              availableQty: (findProduct.availableQty || 0) + qty,
              closingQty: (findProduct.closingQty || 0) + qty,
              stock: updatedStock,
            },
          });
        }

        // Write audit log to StockLedger
        await prisma.stockLedger.create({
          data: {
            productId: id,
            variantId: variantId && isValidObjectId(variantId) ? variantId : null,
            type: "Return",
            quantity: qty,
            previousStock: prevStock,
            newStock: newStock,
            note: "Sales Return Inward",
          }
        });
      } catch (err) {
        console.error("returnInvetoryIn error:", err);
      }
    }
  }
};

// 4. RETURN INVENTORY OUT
export const returnInvetoryOut = async (products: any) => {
  if (products && products.length > 0) {
    for (const product of products) {
      const { id, variantId, qty } = product;
      try {
        let prevStock = 0;
        let newStock = 0;

        if (variantId && isValidObjectId(variantId)) {
          const variant = await prisma.productVariant.findUnique({
            where: { id: variantId },
            select: { stock: true }
          });
          prevStock = variant?.stock || 0;
          newStock = Math.max(0, prevStock - qty);

          await prisma.productVariant.update({
            where: { id: variantId },
            data: { stock: newStock }
          });
        }

        const findProduct = await prisma.product.findUnique({
          where: { id: id },
          select: {
            returnQty: true,
            availableQty: true,
            closingQty: true,
            stock: true,
          },
        });

        if (findProduct) {
          const updatedStock = Math.max(0, (findProduct.stock || 0) - qty);
          if (!variantId) {
            prevStock = findProduct.stock || 0;
            newStock = updatedStock;
          }

          await prisma.product.update({
            where: { id: id },
            data: {
              returnQty: Math.max(0, (findProduct.returnQty || 0) - qty),
              availableQty: Math.max(0, (findProduct.availableQty || 0) - qty),
              closingQty: Math.max(0, (findProduct.closingQty || 0) - qty),
              stock: updatedStock,
            },
          });
        }

        // Write audit log to StockLedger
        await prisma.stockLedger.create({
          data: {
            productId: id,
            variantId: variantId && isValidObjectId(variantId) ? variantId : null,
            type: "Sale",
            quantity: -qty,
            previousStock: prevStock,
            newStock: newStock,
            note: "Return Outward Reversal",
          }
        });
      } catch (err) {
        console.error("returnInvetoryOut error:", err);
      }
    }
  }
};

// 5. INLINE MANUAL STOCK ADJUSTMENT (Quick Edit)
export const updateStockInline = async (
  productId: string,
  variantId: string | null,
  newStockVal: number,
  note: string = "Manual stock update"
) => {
  try {
    let prevStock = 0;
    if (variantId && isValidObjectId(variantId)) {
      const variant = await prisma.productVariant.findUnique({
        where: { id: variantId },
        select: { stock: true }
      });
      prevStock = variant?.stock || 0;

      await prisma.productVariant.update({
        where: { id: variantId },
        data: { stock: newStockVal }
      });

      // Recalculate parent product stock
      const allVariants = await prisma.productVariant.findMany({
        where: { productId }
      });
      const totalStock = allVariants.reduce((sum, v) => sum + v.stock, 0);

      await prisma.product.update({
        where: { id: productId },
        data: {
          stock: totalStock,
          availableQty: totalStock,
          closingQty: totalStock,
        }
      });
    } else {
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { stock: true, storeId: true }
      });
      prevStock = product?.stock || 0;

      await prisma.product.update({
        where: { id: productId },
        data: {
          stock: newStockVal,
          availableQty: newStockVal,
          closingQty: newStockVal,
        }
      });

      if (product?.storeId) {
        revalidatePath(`/dashboard/seller/store-dashboard/${product.storeId}/inventory/stock`);
        revalidatePath(`/dashboard/seller/store-dashboard/${product.storeId}/inventory/ledger`);
      }
    }

    // Write to StockLedger
    await prisma.stockLedger.create({
      data: {
        productId,
        variantId: variantId && isValidObjectId(variantId) ? variantId : null,
        type: "ManualAdjustment",
        quantity: newStockVal - prevStock,
        previousStock: prevStock,
        newStock: newStockVal,
        note,
      }
    });

    // Also check parent product storeId if variant update
    if (variantId) {
      const parentProd = await prisma.product.findUnique({
        where: { id: productId },
        select: { storeId: true }
      });
      if (parentProd?.storeId) {
        revalidatePath(`/dashboard/seller/store-dashboard/${parentProd.storeId}/inventory/stock`);
        revalidatePath(`/dashboard/seller/store-dashboard/${parentProd.storeId}/inventory/ledger`);
      }
    }

    revalidatePath("/dashboard/seller/inventory/stock");
    revalidatePath("/dashboard/seller/inventory/ledger");
    return { success: true };
  } catch (err: any) {
    console.error("updateStockInline error:", err);
    return { success: false, error: err.message };
  }
};
