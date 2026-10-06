
export const dynamic = "force-dynamic";
import prisma from "@/index";
import DealsGrid from "./DealsGrid";

const Deals = async () => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const dealProducts = await prisma.product.findMany({
    where: {
      createdAt: {
        gte: startOfToday,
        lte: endOfToday,
      },
      status: "Active",
    },
  });

  return (
    <div className="container mx-auto py-20 px-4 min-h-screen mt-10">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold mb-4">Today's Deals</h1>
        <p className="text-muted-foreground text-lg">
          Don't miss out on today's deals. Shop now!
        </p>
      </div>

      {dealProducts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-xl text-muted-foreground">No special deals today. Check back tomorrow!</p>
        </div>
      ) : (
        <DealsGrid products={dealProducts} />
      )}
    </div>
  );
};

export default Deals;

