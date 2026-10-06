import { Inventory } from "./columns";
import prisma from "@/index";
//INVENTORY OPERATIONS
//  openingQty: true,
//       grnQty: true,
//       returnQty: true,
//       rcvAdjustQty: true,
//       availableQty: true,
//       soldQty: true,
//       tpnQty: true,
//       damageQty: true,
//       rtvQty: true,
//       issueAdjustQty: true,
//       closingQty: true,

const generateClosingQty = async (inventory: any) => {
  const {
    openingQty,
    grnQty,
    returnQty,
    rcvAdjustQty,
    availableQty,
    soldQty,
    tpnQty,
    damageQty,
    rtvQty,
    issueAdjustQty,
  } = inventory;

  const avialbleQty = openingQty + grnQty + returnQty + rcvAdjustQty;

  const closingQty =
    avialbleQty - (soldQty + tpnQty + damageQty + rtvQty + issueAdjustQty);
  return closingQty;
};

//Sale Module ** =================================================

//SALE INVENTORY IN ( salesReturn, salesDelete/salesCancel, VOID Return)

export const saleInvetoryIn = async (products: any) => {
  if (products.length > 0) {
    products.map(async (product: any) => {
      const { id, qty } = product;
      try {
        const findProduct = await prisma.product.findUnique({
          where: {
            id: id,
          },
          select: {
            soldQty: true,
            availableQty: true,
            closingQty: true,
            stock: true,
          },
        });
        "inventory", findProduct;

        const updateInventory = await prisma.product.update({
          where: {
            id: id,
          },
          data: {
            soldQty: findProduct?.soldQty! - qty,
            availableQty: findProduct?.availableQty! + qty,
            closingQty: findProduct?.closingQty! + qty,
            stock: (findProduct?.stock || 0) + qty,
          },
        });

        if (updateInventory) {
          return true;
        } else {
          return false;
        }
      } catch (err) {
        err;
      }
    });
  }
};

//SALE INVENTORY OUT ( sales )
export const saleInvetoryOut = async (products: any) => {
  if (products.length > 0) {
    products.map(async (product: any) => {
      const { id, qty } = product;
      //  ("saleInventory", products);
      try {
        const findProduct = await prisma.product.findUnique({
          where: {
            id: id,
          },
          select: {
            soldQty: true,
            availableQty: true,
            closingQty: true,
            stock: true,
          },
        });
        "inventory", findProduct;

        const updateInventory = await prisma.product.update({
          where: {
            id: id,
          },
          data: {
            soldQty: findProduct?.soldQty! + qty,
            availableQty: findProduct?.availableQty! - qty,
            closingQty: findProduct?.closingQty! - qty,
            stock: (findProduct?.stock || 0) - qty,
          },
        });

        if (updateInventory) {
          return true;
        } else {
          return false;
        }
      } catch (err) {
        err;
      }
    });
  }
};

//Return INVENTORY IN ( salesReturn,  VOID Return)

export const returnInvetoryIn = async (products: any) => {
  if (products.length > 0) {
    products.map(async (product: any) => {
      const { id, qty } = product;
      try {
        const findProduct = await prisma.product.findUnique({
          where: {
            id: id,
          },
          select: {
            returnQty: true,
            availableQty: true,
            closingQty: true,
            stock: true,
          },
        });
        "inventory", findProduct;

        const updateInventory = await prisma.product.update({
          where: {
            id: id,
          },
          data: {
            returnQty: findProduct?.returnQty! + qty,
            availableQty: findProduct?.availableQty! + qty,
            closingQty: findProduct?.closingQty! + qty,
            stock: (findProduct?.stock || 0) + qty,
          },
        });
        if (updateInventory) {
          return true;
        } else {
          return false;
        }
      } catch (err) {
        err;
      }
    });
  }
};

//Return INVENTORY OUT ( sales, salesDelete/salesCancel, )
export const returnInvetoryOut = async (products: any) => {
  if (products.length > 0) {
    products.map(async (product: any) => {
      const { id, qty } = product;
      try {
        const findProduct = await prisma.product.findUnique({
          where: {
            id: id,
          },
          select: {
            returnQty: true,
            availableQty: true,
            closingQty: true,
            stock: true,
          },
        });
        "inventory", findProduct;

        const updateInventory = await prisma.product.update({
          where: {
            id: id,
          },
          data: {
            returnQty: (findProduct?.returnQty || 0) - qty,
            availableQty: (findProduct?.availableQty || 0) - qty,
            closingQty: (findProduct?.closingQty || 0) - qty,
            stock: (findProduct?.stock || 0) - qty,
          },
        });

        if (updateInventory) {
          return true;
        } else {
          return false;
        }
      } catch (err) {
        err;
      }
    });
  }
};

//grn Module ** =================================================

//grn INVENTORY IN ( grnsReturn, grnsDelete/grnsCancel, VOID Return)
export const grnInvetoryIn = async (products: any) => {
  if (products?.length > 0) {
    products.map(async (product: any) => {
      const { id, qty } = product;
      try {
        const findProduct = await prisma.product.findUnique({
          where: {
            id: id,
          },
          select: {
            grnQty: true,
            availableQty: true,
            closingQty: true,
            stock: true,
          },
        });
        "inventory", findProduct;

        const updateInventory = await prisma.product.update({
          where: {
            id: id,
          },
          data: {
            grnQty: (findProduct?.grnQty || 0) + qty,
            availableQty: (findProduct?.availableQty || 0) + qty,
            closingQty: (findProduct?.closingQty || 0) + qty,
            stock: (findProduct?.stock || 0) + qty,
          },
        });

        if (updateInventory) {
          return true;
        } else {
          return false;
        }
      } catch (err) {
        err;
      }
    });
  }
  return true;
};

//grn INVENTORY OUT ( grns )
export const grnInvetoryOut = async (products: any) => {
  if (products.length > 0) {
    products.map(async (product: any) => {
      const { id, qty, articleCode } = product;

      try {
        const findProduct = await prisma.product.findUnique({
          where: {
            id: id,
          },
          select: {
            grnQty: true,
            availableQty: true,
            closingQty: true,
            stock: true,
          },
        });

        //  ("inventory", articleCode, qty, findProduct, data);
        const updateInventory = await prisma.product.update({
          where: {
            id: id,
          },
          data: {
            grnQty: findProduct?.grnQty! - qty,
            availableQty: findProduct?.availableQty! - qty,
            closingQty: findProduct?.closingQty! - qty,
            stock: (findProduct?.stock || 0) - qty,
          },
        });

        if (updateInventory) {
          return true;
        } else {
          return false;
        }
      } catch (err) {
        err;
      }
    });
  }
  return true;
};

//adjust Module ** =================================================
//TODO:: work with issue adjustment and receive adjustments
//adjust INVENTORY IN ( adjustAdd )
export const adjustInvetoryIn = async (products: any) => {
  if (products.length > 0) {
    products.map(async (product: any) => {
      const { id, qty, type } = product;
      try {
        const findProduct = await prisma.product.findUnique({
          where: {
            id: id,
          },
          select: {
            rcvAdjustQty: true,
            issueAdjustQty: true,
            availableQty: true,
            closingQty: true,
            stock: true,
          },
        });
        "inventory", findProduct;
        let data;

        if (type === "in") {
          data = {
            rcvAdjustQty: findProduct?.rcvAdjustQty! + qty,
            availableQty: findProduct?.availableQty! + qty,
            closingQty: findProduct?.closingQty! + qty,
            stock: (findProduct?.stock || 0) + qty,
          };
        } else {
          data = {
            issueAdjustQty: findProduct?.issueAdjustQty! + qty,
            availableQty: findProduct?.availableQty! - qty,
            closingQty: findProduct?.closingQty! - qty,
            stock: (findProduct?.stock || 0) - qty,
          };
        }

        const updateInventory = await prisma.product.update({
          where: {
            id: id,
          },
          data: data,
        });

        if (updateInventory) {
          return true;
        } else {
          return false;
        }
      } catch (err) {
        err;
      }
    });
  }
};

//adjust INVENTORY OUT (adjustDelete )
export const adjustInvetoryOut = async (products: any) => {
  if (products.length > 0) {
    products.map(async (product: any) => {
      const { id, qty, type } = product;
      try {
        const findProduct = await prisma.product.findUnique({
          where: {
            id: id,
          },
          select: {
            rcvAdjustQty: true,
            issueAdjustQty: true,
            availableQty: true,
            closingQty: true,
            stock: true,
          },
        });
        "inventory", findProduct;
        let data;

        if (type === "in") {
          data = {
            rcvAdjustQty: findProduct?.rcvAdjustQty! - qty,
            availableQty: findProduct?.availableQty! - qty,
            closingQty: findProduct?.closingQty! - qty,
            stock: (findProduct?.stock || 0) - qty,
          };
        } else {
          data = {
            issueAdjustQty: findProduct?.issueAdjustQty! - qty,
            availableQty: findProduct?.availableQty! + qty,
            closingQty: findProduct?.closingQty! + qty,
            stock: (findProduct?.stock || 0) + qty,
          };
        }

        const updateInventory = await prisma.product.update({
          where: {
            id: id,
          },
          data: data,
        });

        if (updateInventory) {
          return true;
        } else {
          return false;
        }
      } catch (err) {
        err;
      }
    });
  }
};

//damage Module ** =================================================

//damage INVENTORY IN ( damageAdd, damageEdit, damageDelete)
export const damageInvetoryIn = async (products: any) => {
  if (products.length > 0) {
    products.map(async (product: any) => {
      const { id, qty } = product;
      try {
        const findProduct = await prisma.product.findUnique({
          where: {
            id: id,
          },
          select: {
            damageQty: true,
            availableQty: true,
            closingQty: true,
            stock: true,
          },
        });
        "inventory", findProduct;

        const updateInventory = await prisma.product.update({
          where: {
            id: id,
          },
          data: {
            damageQty: findProduct?.damageQty! - qty,
            availableQty: findProduct?.availableQty! + qty,
            closingQty: findProduct?.closingQty! + qty,
            stock: (findProduct?.stock || 0) + qty,
          },
        });

        if (updateInventory) {
          return true;
        } else {
          return false;
        }
      } catch (err) {
        err;
      }
    });
  }
};

//damage INVENTORY OUT (damageEdit )
export const damageInvetoryOut = async (products: any) => {
  if (products.length > 0) {
    products.map(async (product: any) => {
      const { id, qty } = product;
      try {
        const findProduct = await prisma.product.findUnique({
          where: {
            id: id,
          },
          select: {
            damageQty: true,
            availableQty: true,
            closingQty: true,
            stock: true,
          },
        });
        "inventory", findProduct;

        const updateInventory = await prisma.product.update({
          where: {
            id: id,
          },
          data: {
            damageQty: findProduct?.damageQty! + qty,
            availableQty: findProduct?.availableQty! - qty,
            closingQty: findProduct?.closingQty! - qty,
            stock: (findProduct?.stock || 0) - qty,
          },
        });

        if (updateInventory) {
          return true;
        } else {
          return false;
        }
      } catch (err) {
        err;
      }
    });
  }
};

//TPN Module ** =================================================

//TPN INVENTORY IN ( tpnAdd, tpnEdit, tpnDelete)
export const tpnInvetoryIn = async (products: any) => {
  if (products.length > 0) {
    products.map(async (product: any) => {
      const { id, qty } = product;
      try {
        const findProduct = await prisma.product.findUnique({
          where: {
            id: id,
          },
          select: {
            tpnQty: true,
            availableQty: true,
            closingQty: true,
            stock: true,
          },
        });
        "inventory", findProduct;

        const updateInventory = await prisma.product.update({
          where: {
            id: id,
          },
          data: {
            tpnQty: findProduct?.tpnQty! - qty,
            availableQty: findProduct?.availableQty! + qty,
            closingQty: findProduct?.closingQty! + qty,
            stock: (findProduct?.stock || 0) + qty,
          },
        });

        if (updateInventory) {
          return true;
        } else {
          return false;
        }
      } catch (err) {
        err;
      }
    });
  }
};

//tpn INVENTORY OUT (tpnEdit )
export const tpnInvetoryOut = async (products: any) => {
  if (products.length > 0) {
    products.map(async (product: any) => {
      const { id, qty } = product;
      try {
        const findProduct = await prisma.product.findUnique({
          where: {
            id: id,
          },
          select: {
            tpnQty: true,
            availableQty: true,
            closingQty: true,
            stock: true,
          },
        });
        "inventory", findProduct;

        const updateInventory = await prisma.product.update({
          where: {
            id: id,
          },
          data: {
            tpnQty: findProduct?.tpnQty! + qty,
            availableQty: findProduct?.availableQty! - qty,
            closingQty: findProduct?.closingQty! - qty,
            stock: (findProduct?.stock || 0) - qty,
          },
        });

        if (updateInventory) {
          return true;
        } else {
          return false;
        }
      } catch (err) {
        err;
      }
    });
  }
};

//rtv Module ** =================================================

//rtv INVENTORY IN ( rtvAdd, rtvEdit, rtvDelete)
export const rtvInvetoryIn = async (productId: string, qty: number) => {
  try {
    const findProduct = await prisma.product.findUnique({
      where: {
        id: productId,
      },
      select: {
        rtvQty: true,
        availableQty: true,
        closingQty: true,
        stock: true,
      },
    });
    "inventory", findProduct;

    const updateInventory = await prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        rtvQty: (findProduct?.rtvQty || 0) + qty,
        availableQty: (findProduct?.availableQty || 0) - qty,
        closingQty: (findProduct?.closingQty || 0) - qty,
        stock: (findProduct?.stock || 0) - qty,
      },
    });

    if (updateInventory) {
      return true;
    } else {
      return false;
    }
  } catch (err) {
    err;
  }
};

//rtv INVENTORY OUT (rtvEdit )
export const rtvInvetoryOut = async (productId: string, qty: number) => {
  try {
    const findProduct = await prisma.product.findUnique({
      where: {
        id: productId,
      },
      select: {
        rtvQty: true,
        availableQty: true,
        closingQty: true,
        stock: true,
      },
    });
    "inventory", findProduct;

    const updateInventory = await prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        rtvQty: (findProduct?.rtvQty || 0) - qty,
        availableQty: (findProduct?.availableQty || 0) + qty,
        closingQty: (findProduct?.closingQty || 0) + qty,
        stock: (findProduct?.stock || 0) + qty,
      },
    });

    if (updateInventory) {
      return true;
    } else {
      return false;
    }
  } catch (err) {
    err;
  }
};

export const resetAllProductData = async () => {
  try {
    // Define the default values
    const defaultValues = {
      openingQty: 0,
      grnQty: 0,
      returnQty: 0,
      rcvAdjustQty: 0,
      availableQty: 0,
      soldQty: 0,
      tpnQty: 0,
      damageQty: 0,
      rtvQty: 0,
      issueAdjustQty: 0,
      closingQty: 0,
      stock: 0,
    };

    // Fetch all products
    const allProducts = await prisma.product.findMany();

    // Update each product with the default values
    const updatePromises = allProducts.map((product) =>
      prisma.product.update({
        where: { id: product.id },
        data: defaultValues,
      })
    );

    // Wait for all updates to complete
    await Promise.all(updatePromises);

    ("All product data has been reset.");
    return true;
  } catch (err) {
    console.error("Error resetting product data:", err);
    return false;
  }
};
