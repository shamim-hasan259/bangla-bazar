"use server";

import prisma from "@/index";
import { endOfDay, format, startOfDay, subDays } from "date-fns";

export const DashboardInfoByDate = async ({
  startDate,
  endDate,
}: {
  startDate: Date;
  endDate: Date;
}) => {
  //  ("date", startDate, endDate);
  const start = startOfDay(startDate ? new Date(startDate) : new Date());
  const end = endOfDay(endDate ? new Date(endDate) : new Date());

  const sales = await prisma.sales.aggregate({
    _sum: {
      grossTotal: true,
    },
    _count: {
      id: true,
    },
    where: {
      createdAt: {
        gte: start,
        lte: end,
      },
    },
  });

  const result = {
    sales,
  };

  return {
    result,
  };
};

export const getDashboardDataByDate = async ({
  startDate,
  endDate,
}: {
  startDate?: Date;
  endDate?: Date;
}) => {
  try {
    const start = startOfDay(startDate ? new Date(startDate) : new Date());
    const end = endOfDay(endDate ? new Date(endDate) : new Date());
    //  (startDate, endDate);

    const salesData = await prisma.sales.aggregate({
      _sum: {
        grossTotal: true,
      },
      _count: {
        id: true,
      },

      where: {
        createdAt: {
          gte: new Date(start),
          lte: new Date(end),
        },
      },
    });

    const uniqueCustomers = await prisma.customer.aggregate({
      _count: {
        id: true,
      },
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
      },
    });

    const customers = await prisma.customer.aggregate({
      _count: {
        id: true,
      },
    });

    const products = await prisma.product.count({});

    const dashboardData = {
      revenue: salesData._sum.grossTotal,
      totalOrder: salesData._count.id,
      newCustomer: uniqueCustomers._count.id,
      totalCutomer: customers._count.id,
      products: products,
    };

    return dashboardData;
  } catch (err) {
    err;
    return err;
  }
};

export const getLastTwelveDaysSalesData = async () => {
  // Calculate the date range for the last 12 days
  const end = endOfDay(new Date());
  const start = startOfDay(subDays(end, 15));

  try {
    // MongoDB aggregation pipeline to filter documents by date range and group by day
    const salesData = await prisma.sales.aggregateRaw({
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
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
            totalAmount: { $sum: "$total" },
          },
        },
        {
          $sort: { _id: 1 }, // Sort by date in ascending order
        },
      ],
    });

    // Format the results to match the desired format
    const formattedData = (salesData as unknown as any[]).map(
      (sale: { _id: string; totalAmount: number }) => {
        const date = new Date(sale._id);
        const formattedDate = format(date, "do MMMM"); // Format date as "27th July"
        return {
          name: formattedDate,
          total: sale.totalAmount,
        };
      }
    );

    return formattedData;
  } catch (err) {
    console.error("Error fetching sales data:", err); // Log any errors
    return [];
  }
};

export const getLatestFiveSales = async () => {
  try {
    // Fetch the latest 5 sales with specific data
    const latestSales = await prisma.sales.findMany({
      orderBy: {
        createdAt: "desc", // Sort by creation date in descending order
      },
      take: 5, // Limit the results to 5
      select: {
        id: true,
        customer: {
          select: {
            name: true,
            phone: true, // Adjust fields as needed
          },
        },
        total: true,
        createdAt: true,
        // Add other fields as needed
      },
    });

    return latestSales;
  } catch (err) {
    console.error("Error fetching latest sales:", err); // Log any errors
    return [];
  }
};

export const getOrderStatusDistribution = async () => {
  try {
    const start = startOfDay(subDays(new Date(), 30));
    const end = endOfDay(new Date());
    const statuses = await prisma.sales.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
      },
    });

    return statuses.map(s => ({
      name: s.status,
      value: s._count.id
    }));
  } catch (err) {
    console.error("Error fetching order statuses:", err);
    return [];
  }
};

export const getTopProducts = async () => {
  try {
    const start = startOfDay(subDays(new Date(), 30));
    const end = endOfDay(new Date());
    const sales = await prisma.sales.findMany({
      where: {
        status: "Complete",
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      select: {
        products: true,
      },
    });

    const productMap: Record<string, {name: string, quantity: number, revenue: number}> = {};
    sales.forEach(sale => {
      sale.products.forEach((p: any) => {
        if (!p.id) return;
        if (!productMap[p.id]) {
          productMap[p.id] = { name: p.name || 'Unknown', quantity: 0, revenue: 0 };
        }
        productMap[p.id].quantity += (Number(p.qty) || Number(p.quantity) || 0);
        productMap[p.id].revenue += (Number(p.qty) || Number(p.quantity) || 0) * (Number(p.tp) || Number(p.price) || 0);
      });
    });

    const topProducts = Object.values(productMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
      
    return topProducts;
  } catch (err) {
    console.error("Error fetching top products:", err);
    return [];
  }
};

export const getCustomerGrowthData = async () => {
  const end = endOfDay(new Date());
  const start = startOfDay(subDays(end, 15));

  try {
    const rawData = await prisma.customer.aggregateRaw({
      pipeline: [
        {
          $match: {
            createdAt: {
              $gte: { $date: start },
              $lte: { $date: end },
            },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ],
    });

    // Create a continuous timeline of the last 15 days
    const dateMap: Record<string, number> = {};
    for (let i = 15; i >= 0; i--) {
      const d = subDays(new Date(), i);
      const formattedDate = format(d, "do MMM");
      dateMap[formattedDate] = 0;
    }

    // Populate actuals from the database query
    (rawData as unknown as any[]).forEach((item) => {
      const date = new Date(item._id);
      const formattedDate = format(date, "do MMM");
      if (dateMap[formattedDate] !== undefined) {
        dateMap[formattedDate] = item.count;
      }
    });

    // Format for charts
    return Object.entries(dateMap).map(([name, count]) => ({
      name,
      count,
    }));
  } catch (err) {
    console.error("Error fetching customer growth:", err);
    return [];
  }
};

export const getSellerGrowthData = async () => {
  const end = endOfDay(new Date());
  const start = startOfDay(subDays(end, 15));

  try {
    const rawData = await prisma.seller.aggregateRaw({
      pipeline: [
        {
          $match: {
            createdAt: {
              $gte: { $date: start },
              $lte: { $date: end },
            },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ],
    });

    // Create a continuous timeline of the last 15 days
    const dateMap: Record<string, number> = {};
    for (let i = 15; i >= 0; i--) {
      const d = subDays(new Date(), i);
      const formattedDate = format(d, "do MMM");
      dateMap[formattedDate] = 0;
    }

    // Populate actuals from the database query
    (rawData as unknown as any[]).forEach((item) => {
      const date = new Date(item._id);
      const formattedDate = format(date, "do MMM");
      if (dateMap[formattedDate] !== undefined) {
        dateMap[formattedDate] = item.count;
      }
    });

    // Format for charts
    return Object.entries(dateMap).map(([name, count]) => ({
      name,
      count,
    }));
  } catch (err) {
    console.error("Error fetching seller growth:", err);
    return [];
  }
};
