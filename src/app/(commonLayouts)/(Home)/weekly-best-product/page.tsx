export const dynamic = "force-dynamic";
import prisma from "@/index";
import ProductCard from "@/components/home/ProductCard";

const WeeklyBestProductPage = async () => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  // 1. Fetch sales from last 7 days
  const recentSales = await prisma.sales.findMany({
    where: {
      createdAt: {
        gte: sevenDaysAgo,
      },
    },
    select: {
      soldProducts: true,
      products: true,
    },
  });

  // 2. Aggregate quantities by productId
  const salesCount: Record<string, number> = {};
  recentSales.forEach((sale: any) => {
    const items = (sale.soldProducts || sale.products || []) as any[];
    items.forEach((item: any) => {
      const pId = item.productId || item.id;
      if (pId) {
        const qty = Number(item.qty || item.quantity || 0);
        salesCount[pId] = (salesCount[pId] || 0) + qty;
      }
    });
  });

  // 3. Sort IDs by quantity sold descending
  const sortedProductIds = Object.keys(salesCount).sort(
    (a, b) => salesCount[b] - salesCount[a]
  );

  // 4. Fetch the products
  const products = await prisma.product.findMany({
    where: {
      id: { in: sortedProductIds },
      status: "Active",
    },
  });

  // 5. Re-sort products matching the sales aggregate order
  const sortedProducts = products
    .map((p) => ({
      ...p,
      salesCount: salesCount[p.id] || 0,
    }))
    .sort((a, b) => b.salesCount - a.salesCount);

  return (
    <div className="container mx-auto py-20 px-4 min-h-screen mt-10">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold mb-4">Weekly Best Products</h1>
        <p className="text-muted-foreground text-lg">
          Our top-selling products over the last 7 days.
        </p>
      </div>

      {sortedProducts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-xl text-muted-foreground">No sales data available for the last 7 days.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {sortedProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800/80 shadow-2xs hover:shadow-md transition-all duration-200"
            >
              <ProductCard product={product as any} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WeeklyBestProductPage;
