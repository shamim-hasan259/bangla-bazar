import React from 'react';
import prisma from "@/index";
import TopPromoBar from "@/components/lazada/TopPromoBar";
import LazadaHeader from "@/components/lazada/LazadaHeader";
import HeroCarousel from "@/components/lazada/HeroCarousel";
import ServiceBar from "@/components/lazada/ServiceBar";
import FlashSale from "@/components/lazada/FlashSale";
import CategoryGrid from "@/components/lazada/CategoryGrid";
import ProductGrid from "@/components/lazada/ProductGrid";
import Footer from "@/components/common/Footer";

export const dynamic = "force-dynamic";

const HomePage = async () => {
  // Fetch products for different sections
  const allProducts = await prisma.product.findMany({
    take: 24,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      price: true,
      mrp: true,
      photo: true,
    }
  });

  const categories = await prisma.category.findMany({
    where: { status: "Active" },
    take: 16
  });

  // Split products for different sections
  const flashSaleProducts = allProducts.slice(0, 6);
  const justForYouProducts = allProducts.slice(6);

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* Top Promotional Strip */}
      <TopPromoBar />

      {/* Main Navigation Header */}
      <LazadaHeader />

      <main>
        {/* Hero Slider */}
        <HeroCarousel />

        {/* Benefits/Service Bar */}
        <ServiceBar />

        {/* Flash Sale Section */}
        <FlashSale products={flashSaleProducts} />

        {/* Categories Grid */}
        <CategoryGrid categories={categories} />

        {/* Just For You Section */}
        <ProductGrid products={justForYouProducts} />
      </main>

      {/* Standard Footer */}
      <Footer />
    </div>
  );
};

export default HomePage;
