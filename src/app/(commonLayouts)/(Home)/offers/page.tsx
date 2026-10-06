export const dynamic = "force-dynamic";
import prisma from "@/index";
import ProductCard from "@/components/home/ProductCard";

const Offers = async () => {
  const offerProducts = await prisma.product.findMany({
    where: {
      salesType: "Offer",
      status: "Active",
    },
  });

  return (
    <div className="container mx-auto py-20 px-4 min-h-screen mt-10">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold mb-4">Special Offers</h1>
        <p className="text-muted-foreground text-lg">
          Grab the best deals on your favorite products. Limited time only!
        </p>
      </div>
      {offerProducts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-xl text-muted-foreground">No active offers at the moment. Check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {offerProducts.map((product) => (
            <ProductCard key={product.id} product={product as any} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Offers;
