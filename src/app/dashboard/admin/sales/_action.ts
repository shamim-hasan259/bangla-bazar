"use server";
import prisma from "@/index";
import { revalidatePath } from "next/cache";
import { createOrderStatusNotification } from "@/lib/notifications";
import { CreateOrderSchema } from "./create-order/CreateOrderSchema";
import { generateId } from "@/lib/idGenerator";
import {
  returnInvetoryIn,
  saleInvetoryIn,
  saleInvetoryOut,
} from "../inventory/_action";
import { endOfDay, format, startOfDay } from "date-fns";

export const handleDelete = async (id: string) => {
  try {
    const deleteProduct = await prisma.sales.delete({
      where: {
        id: id,
      },
    });
    //  (deleteOffer);
    if (deleteProduct) {
      //@ts-ignore
      `${deleteProduct?.name} deleted successful!`;
      revalidatePath("/dashboard/offers");
      return deleteProduct;
    }
  } catch (err) {
    return false;
  }
};

export const createOrder = async (data: CreateOrderSchema) => {
  const newInvoiceNo = await generateId("sale");
  const {
    id,
    invoiceId,
    source,
    warehouseId,
    soldProducts,
    soldCalculation,
    userId,
    customerId,
    products,
    orderCalculation,
    prevDueAmount,
    currentDueAmount,
    returnProducts,
    returnCalculation,
    totalItem,
    returnActive,
    total,
    discount,
    vat,
    note,
    grossTotal,
    grossTotalRound,
    totalRecievable,
    totalRecieved,
    changeAmount,
    deliveryAddresss,
    vehicleInfo,
    deliveryDate,
    deliveryTime,
    vatCallanNumber,
    paidAmount,
    status,
  } = data;

  try {
    if (id === "") {
      const createOrder = await prisma.sales.create({
        data: {
          invoiceId: newInvoiceNo,
          source,
          warehouseId,
          userId,
          customerId,
          products,
          orderCalculation,
          soldProducts,
          prevDueAmount,
          currentDueAmount,
          soldCalculation,
          returnProducts,
          returnActive,
          returnCalculation,
          totalItem,
          total,
          discount,
          vat,
          note,
          grossTotal,
          grossTotalRound,
          totalRecievable,
          totalRecieved,
          changeAmount,
          paidAmount,
          deliveryAddresss,
          vehicleInfo,
          deliveryDate,
          deliveryTime,
          vatCallanNumber,
          status,
        },
      });
      if (createOrder) {
        //  ("soldProducts", soldProducts);
        if (status === "Complete") {
          const updateInventory = await saleInvetoryOut(soldProducts);
        } else {
          const updateInventory = await saleInvetoryOut(soldProducts);
          const updateReturnInventory = await returnInvetoryIn(returnProducts);
        }
        //  ("updateInventory", updateInventory);
        // if (updateInventory) {
        //    ("Sale Inventory updated");
        // }
        `${createOrder.invoiceId} updated successfully!`;
        revalidatePath("/dashboard/sales");
        const newOrder = salesById(createOrder.id);
        return newOrder;
      }
    } else {
      const updateOrder = await prisma.sales.update({
        where: {
          id: id,
        },
        data: {
          invoiceId,
          source,
          warehouseId,
          userId,
          customerId,
          products,
          orderCalculation,
          soldProducts,
          soldCalculation,
          returnProducts,
          returnActive,
          returnCalculation,
          totalItem,
          total,
          discount,
          vat,
          note,
          grossTotal,
          grossTotalRound,
          totalRecievable,
          totalRecieved,
          changeAmount,
          deliveryAddresss,
          vehicleInfo,
          deliveryDate,
          deliveryTime,
          vatCallanNumber,
          paidAmount,
          status: "Complete",
        },
      });
      if (updateOrder) {
        const updateInventory = await saleInvetoryOut(returnProducts);
        const updateReturnInventory = await returnInvetoryIn(returnProducts);
        `${updateOrder.invoiceId} updated successfully!`;
        revalidatePath("/dashboard/sales");
        const newOrder = salesById(updateOrder.id);
        return newOrder;
      }
    }
  } catch (error) {
    error;
  }
};

export const salesById = async (id: string) => {
  try {
    const sales = await prisma.sales.findFirst({
      where: {
        id: id,
      },
      include: {
        customer: {
          select: {
            name: true,
            phone: true,
            address: true,
            email: true,
            company: true,
            due: true,
            bin: true,
          },
        },
        user: {
          select: {
            name: true,
            phone: true,
            email: true,
          },
        },
        warehouse: {
          select: {
            name: true,
          },
        },
      },
    });
    return sales;
  } catch (error) {
    error;
  }
};

export const salesWithDue = async (id: string) => {
  try {
    const sales = await prisma.sales.findUnique({
      where: {
        id: id,
      },
      select: {
        // Select specific fields from the sales table
        id: true,
        grossTotal: true,
        invoiceId: true,
        createdAt: true,
        status: true,
        isDue: true,
        duePaid: true,
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
            company: true,
            due: true,
          },
        },
      },
    });
    return sales;
  } catch (error) {
    error;
    return null;
  }
};

export const invoiceDw = async () => {
  try {
    const invoices = await prisma.sales.findMany({
      where: {
        // isDue:true,
        // duePaid:false
      },
      select: {
        id: true,
        invoiceId: true,
        // company:true
      },
    });

    let dw = [
      {
        value: "",
        label: "Select Invoice",
      },
    ];

    //  (suppliers);
    invoices.map(
      (invoice) =>
        (dw = [
          ...dw,
          { value: `${invoice?.id}`, label: `${invoice?.invoiceId}` },
        ])
    );
    //  ("selectedInvoice", dw);
    return dw;
  } catch (error) {
    console.error("Error fetching Invoice:", error);
    throw new Error("Failed to fetch Invoices");
  }
};

export const updateInvoice = async (invoiceNo: string, data: any) => {
  try {
    const invoice = await prisma.sales.update({
      where: {
        invoiceId: invoiceNo,
      },
      data: data,
    });

    return invoice ? invoice : false;
  } catch (error) {
    console.error("Error updating Invoice:", error?.message);
    console.error("Error details:", error);

    throw new Error("Failed to update Invoice");
  }
};

export const UpdateSaleStatus = async (id: string, status: string) => {
  //  ("Triggered update", id, status);

  try {
    const update = await prisma.sales.update({
      where: {
        id: id,
      },
      //@ts-ignore
      data: { status: status },
    });

    if (update) {
      "update successful", update;
      const updateInventory = saleInvetoryIn(update?.soldProducts);
      const updateReturnInventory = returnInvetoryIn(update?.soldProducts);
      
      // Send dynamic order update notification
      await createOrderStatusNotification(id, status);
      
      revalidatePath("/dashboard/sales");
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("sales update error", error);
    return false;
  }
};

export const getSaleByDateRange = async ({
  startDate,
  endDate,
}: {
  startDate: Date;
  endDate: Date;
}) => {
  const start = startOfDay(startDate);
  const end = endOfDay(endDate);
  //  (startDate,start,endDate,end)
  const sales = await prisma.sales.aggregateRaw({
    pipeline: [
      {
        $match: {
          createdAt: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $lookup: {
          from: "customers",
          localField: "customerId",
          foreignField: "_id",
          as: "customer",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$customer",
      },
      {
        $unwind: "$user",
      },
      {
        $project: {
          sale: "$_id",
          invoiceId: 1,
          "user.name": 1,
          "customer.name": 1,
          "customer.phone": 1,
          amount: 1,
          status: 1,
          createdAt: 1,
        },
      },
    ],
  });
  sales;
  return sales;
};

export const getInvoicesByDateRange = async ({}: // startDate,
// endDate,
{
  // startDate: Date;
  // endDate: Date;
}) => {
  //  ("datfnf", startDate, endDate);

  const sales = await prisma.sales.aggregateRaw({
    pipeline: [
      // {
      //   $match: {
      //     createdAt: {
      //       $gte: new Date(),
      //       $lte: new Date(),
      //     },
      //   },
      // },
      {
        $unwind: "$soldProducts",
      },
      {
        $group: {
          _id: "$soldProducts.articleCode",
          name: { $first: "$soldProducts.name" },
          totalQty: { $sum: "$soldProducts.qty" },
          totalDiscount: { $sum: { $ifNull: ["$soldProducts.discount", 0] } },
          total: {
            $sum: { $multiply: ["$soldProducts.price", "$soldProducts.qty"] },
          },
          tp: { $first: "$soldProducts.tp" },
          price: { $addToSet: "$soldProducts.price" },
          discounts: { $addToSet: "$soldProducts.discount" },
          invoices: { $addToSet: "$invoiceId" },
          createdAt: { $first: "$createdAt" },
        },
      },
      {
        $project: {
          articleCode: "$_id",
          name: 1,
          totalQty: 1,
          totalDiscount: 1,
          total: 1,
          price: { $avg: "$price" },
          averageDiscount: { $avg: "$discounts" },
          tp: 1,
          invoices: 1,
          createdAt: 1,
        },
      },
    ],
  });

  const formattedSales = sales?.map((sale: any) => ({
    articleCode: sale.articleCode,
    name: sale.name,
    totalQty: sale.totalQty,
    totalDiscount: sale.totalDiscount,
    total: sale.total,
    price: sale.price,
    averageDiscount: sale.averageDiscount,
    tp: sale.tp,
    invoices: sale.invoices,
    createdAt: sale.createdAt,
  }));

  return formattedSales;
};

export const getSalesReportByCategory = async ({
  startDate,
  endDate,
}: {
  startDate: Date;
  endDate: Date;
}) => {
  const sales = await prisma.sales.aggregateRaw({
    pipeline: [
      {
        $match: {
          createdAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
          },
        },
      },
      {
        $unwind: "$soldProducts",
      },
      {
        $lookup: {
          from: "products",
          localField: "soldProducts.productId",
          foreignField: "_id",
          as: "product",
        },
      },
      {
        $unwind: "$product",
      },
      {
        $group: {
          _id: "$product.categoryId",
          totalQty: { $sum: "$soldProducts.qty" },
          totalDiscount: { $sum: { $ifNull: ["$soldProducts.discount", 0] } },
          total: {
            $sum: { $multiply: ["$soldProducts.price", "$soldProducts.qty"] },
          },
          avgPrice: { $avg: "$soldProducts.price" },
          avgDiscount: { $avg: { $ifNull: ["$soldProducts.discount", 0] } },
          invoices: { $addToSet: "$invoiceId" },
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $unwind: "$category",
      },
      {
        $project: {
          categoryId: "$_id",
          categoryName: "$category.name",
          totalQty: 1,
          totalDiscount: 1,
          total: 1,
          avgPrice: 1,
          avgDiscount: 1,
          invoices: 1,
        },
      },
    ],
  });

  const formattedSales = sales?.map((sale: any) => ({
    categoryId: sale.categoryId,
    categoryName: sale.categoryName,
    totalQty: sale.totalQty,
    totalDiscount: sale.totalDiscount,
    total: sale.total,
    avgPrice: sale.avgPrice,
    avgDiscount: sale.avgDiscount,
    invoices: sale.invoices,
  }));

  return formattedSales;
};

export const getSaleByDate = async ({
  startDate,
  endDate,
}: {
  startDate?: Date;
  endDate?: Date;
}) => {
  const start = startOfDay(startDate ? new Date(startDate) : new Date());
  const end = endOfDay(endDate ? new Date(endDate) : new Date());
  //  (startDate, endDate);

  const sale = await prisma.sales.findMany({
    where: {
      createdAt: {
        gte: start,
        lte: end,
      },
      sellerIds: {
        isEmpty: true,
      },
    },
    select: {
      id: true,
      invoiceId: true,
      grossTotalRound: true,
      status: true,
      createdAt: true,
      user: {
        select: {
          name: true,
        },
      },
      customer: {
        select: {
          name: true,
          phone: true,
          company: true,
        },
      },
    },
  });

  const formattedData = sale?.map((sale) => ({
    ...sale,
    createdAt: format(new Date(sale.createdAt), "MM/dd/yyyy"), // Format createdAt date
  }));

  return formattedData || [];
};

//Article Sale Report Function
export const articleSaledata = async ({
  startDate,
  endDate,
}: {
  startDate: Date;
  endDate: Date;
}) => {
  // Fixed date range for testing
  const start = startOfDay(startDate);
  const end = endOfDay(endDate);

  try {
    // MongoDB aggregation pipeline to filter documents by date range and sum the qty of each product
    const sales = await prisma.sales.aggregateRaw({
      pipeline: [
        {
          $match: {
            status: "Complete",
            createdAt: {
              $gte: { $date: start },
              $lte: { $date: end },
            },
          },
        },
        {
          $unwind: "$soldProducts", // Unwind the soldProducts array
        },
        {
          $group: {
            _id: "$soldProducts.articleCode",
            totalQty: { $sum: "$soldProducts.qty" },
            total: { $sum: "$soldProducts.price" },
            articleCode: { $first: "$soldProducts.articleCode" },
            name: { $first: "$soldProducts.name" },
            price: { $first: "$soldProducts.price" },
            tp: { $first: "$soldProducts.tp" },
            qty: { $first: "$soldProducts.qty" },
            createdAt: { $first: "$createdAt" },
          },
        },
        {
          $project: {
            _id: 0,
            articleCode: 1,
            total: 1,
            totalQty: 1,
            price: 1,
            name: 1,
            tp: 1,
            createdAt: 1,
          },
        },
      ],
    });

    return sales;
  } catch (err) {
    console.error("Error fetching sales:", err); // Log any errors
    return err;
  }
};

//CategorySale

export const categorySaleData = async ({
  startDate,
  endDate,
}: {
  startDate: Date;
  endDate: Date;
}) => {
  // Fixed date range for testing
  const start = startOfDay(startDate);
  const end = endOfDay(endDate);

  try {
    // MongoDB aggregation pipeline to filter documents by date range and sum the qty of each product
    const sales = await prisma.sales.aggregateRaw({
      pipeline: [
        {
          $match: {
            status: "Complete",
            createdAt: {
              $gte: { $date: start },
              $lte: { $date: end },
            },
          },
        },
        {
          $unwind: "$soldProducts", // Unwind the soldProducts array
        },
        {
          $group: {
            _id: "$soldProducts.categoryId",
            totalQty: { $sum: "$soldProducts.qty" },
            totalAmount: { $sum: "$soldProducts.total" },
            products: { $push: "$soldProducts" },
          },
        },
        {
          $lookup: {
            from: "Category", // Collection name of categories
            localField: "soldProducts.categoryId",
            foreignField: "id", // Adjust the field name if necessary
            as: "categoryInfo",
          },
        },
        {
          $unwind: {
            path: "$categoryInfo", // Unwind the categoryInfo array
            preserveNullAndEmptyArrays: false, // Ensure no empty arrays are preserved
          },
        },
        {
          $group: {
            _id: "$_id", // Group by categoryId to ensure unique categories
            categoryId: { $first: "$_id" }, // Take the first occurrence of categoryId
            categoryName: { $first: "$categoryInfo.name" }, // Take the first occurrence of categoryName
            categoryCode: { $first: "$categoryInfo.code" }, // Take the first occurrence of categoryCode
            totalQty: { $sum: "$totalQty" },
            totalAmount: { $sum: "$totalAmount" },
            products: { $push: "$products" }, // Aggregate products
          },
        },
        {
          $project: {
            _id: 0,
            categoryId: 1,
            categoryName: 1,
            categoryCode: 1,
            totalQty: 1,
            totalAmount: 1,
            products: {
              $reduce: {
                input: "$products",
                initialValue: [],
                in: { $concatArrays: ["$$value", "$$this"] },
              },
            },
          },
        },
        {
          $sort: { categoryId: 1 }, // Sort by categoryId
        },
      ],
    });

    //  ("article Sale count:", sales.length); // Log the number of sales

    return sales;
  } catch (err) {
    console.error("Error fetching sales:", err); // Log any errors
    return err;
  }
};

export const getUniqueArticlesWithTotalQty = async () => {
  try {
    // MongoDB aggregation pipeline
    const uniqueArticles = await prisma.adjust.aggregateRaw({
      pipeline: [
        {
          $unwind: "$products", // Unwind the products array
        },
        {
          $group: {
            _id: "$products.articleCode", // Group by articleCode
            totalQty: { $sum: "$products.qty" }, // Sum the quantity for each article code
          },
        },
        {
          $project: {
            _id: 0,
            articleCode: "$_id", // Rename _id to articleCode
            totalQty: 1, // Include totalQty field
          },
        },
        {
          $sort: { articleCode: 1 }, // Sort by articleCode in ascending order
        },
      ],
    });

    return uniqueArticles;
  } catch (err) {
    console.error("Error fetching unique articles with total quantity:", err); // Log any errors
    return err;
  }
};
