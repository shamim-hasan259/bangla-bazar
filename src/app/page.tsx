export const dynamic = "force-dynamic";

import React from "react";
import prisma from "@/index";
import MavenNavbar from "@/components/common/MavenNavbar";
import Footer from "@/components/common/Footer";
import Banner from "@/components/home/Banner";
import FeaturedCategories from "@/components/home/FeaturedCategories";
import PopularProduct from "@/components/home/PopularProduct";
import DailyBestSells from "@/components/home/DailyBestSells";
import DealsOfTheDay from "@/components/home/DealsOfTheDay";
import WeeklyTopVendorsSection from "@/components/home/WeeklyTopVendorsSection";
import DailyDealsCarouselSection from "@/components/home/DailyDealsCarouselSection";
import FeaturedProductsSection from "@/components/home/FeaturedProductsSection";
import FeaturedSellersSection from "@/components/home/FeaturedSellersSection";
import CampaignPlacement from "./_components/CampaignPlacement";
import FlashSalePlacement from "./_components/FlashSalePlacement";
import FlashSaleGridSection from "@/components/home/FlashSaleGridSection";
import HotDealSection from "@/components/home/HotDealSection";
import BundlePlacement from "./_components/BundlePlacement";
import TriplePromoBanners from "@/components/home/TriplePromoBanners";
import DualPromoBanners from "@/components/home/DualPromoBanners";
import CategorySection from "@/components/home/CategorySection";

export default async function Home() {
  try {
    let enabledSections: any[] = [];
    try {
      if ((prisma as any).homepageSection) {
        enabledSections = await (prisma as any).homepageSection.findMany({
          where: { enabled: true },
          orderBy: { position: "asc" },
        });
      }
    } catch (e) {
      enabledSections = [];
    }
    // Fallback: If no homepage sections are present in db, load legacy static elements
    if (!enabledSections || enabledSections.length === 0) {
      let products: any[] = [];
      let banners: any[] = [];
      let categories: any[] = [];
      try {
        products = await prisma.product.findMany({
          where: { status: "Active" },
          select: {
            id: true,
            photo: true,
            name: true,
            price: true,
            tp: true,
            mrp: true,
            createdAt: true,
          },
        });
      } catch (e) {
        products = [];
      }

      try {
        banners = await prisma.banner.findMany({
          where: { status: "Active" },
          orderBy: [{ order: "asc" }, { createdAt: "desc" }],
        });
      } catch (e) {
        banners = [];
      }

      try {
        categories = await prisma.category.findMany({
          where: { status: "Active", parentId: null },
          include: {
            subcategories: {
              where: { status: "Active" },
            },
            _count: { select: { products: true } },
          },
          orderBy: { name: "asc" },
        });
      } catch (e) {
        categories = [];
      }

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      sevenDaysAgo.setHours(0, 0, 0, 0);

      let weeklySales: any[] = [];
      try {
        if ((prisma as any).sales) {
          weeklySales = await (prisma as any).sales.findMany({
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
        }
      } catch (e) {
        weeklySales = [];
      }

      const weeklySalesCount: Record<string, number> = {};
      weeklySales.forEach((sale: any) => {
        const items = (sale.soldProducts || sale.products || []) as any[];
        items.forEach((item: any) => {
          const pId = item.productId || item.id;
          if (pId) {
            const qty = Number(item.qty || item.quantity || 0);
            weeklySalesCount[pId] = (weeklySalesCount[pId] || 0) + qty;
          }
        });
      });

      const weeklyProducts = products
        .filter((p) => weeklySalesCount[p.id] !== undefined)
        .map((p) => ({
          ...p,
          salesCount: weeklySalesCount[p.id] || 0,
        }))
        .sort((a, b) => b.salesCount - a.salesCount);

      const otherProducts = products.filter((p) => weeklySalesCount[p.id] === undefined);
      const displayWeeklyProducts = [...weeklyProducts, ...otherProducts];

      return (
        <>
          <MavenNavbar />
          <div className="bg-[#F5F5F5] dark:bg-slate-950 min-h-screen flex flex-col w-full overflow-x-hidden">
            <Banner banners={banners} />
            <TriplePromoBanners />
            <main className="w-full max-w-[1200px] mx-auto px-4 xl:px-0 pt-6 pb-6 flex flex-col gap-6 flex-1">
              <div className="flex flex-col gap-6 w-full pb-8">
                <FeaturedCategories categories={categories} />
                <FlashSaleGridSection />
                <HotDealSection />
                <DualPromoBanners />
                <WeeklyTopVendorsSection />
                <DailyDealsCarouselSection />
                <PopularProduct
                  products={displayWeeklyProducts}
                  title="Weekly Best Product"
                  shopMoreLink="/weekly-best-product"
                />
                <FeaturedProductsSection
                  products={products}
                  title="Featured Products"
                  shopMoreLink="/products"
                />
                <CategorySection
                  title="Men's T-Shirts & Polos"
                  categoryKey="mens-tshirt"
                  shopMoreLink="/products?category=mens-tshirt"
                />
                <CategorySection
                  title="Men's Pants & Trousers"
                  categoryKey="mens-pant"
                  shopMoreLink="/products?category=mens-pant"
                />
                <CategorySection
                  title="Electronics & Gadgets"
                  categoryKey="electronics"
                  shopMoreLink="/products?category=electronics"
                />
                <CategorySection
                  title="Fashion & Apparel"
                  categoryKey="fashion"
                  shopMoreLink="/products?category=fashion"
                />
                <CategorySection
                  title="Watches & Jewelry"
                  categoryKey="watches"
                  shopMoreLink="/products?category=watches"
                />
                <CategorySection
                  title="Laptops & Tech"
                  categoryKey="laptops"
                  shopMoreLink="/products?category=laptops"
                />
                <CategorySection
                  title="Beauty & Skincare"
                  categoryKey="beauty"
                  shopMoreLink="/products?category=beauty"
                />
                <CategorySection
                  title="Headphones & Audio"
                  categoryKey="audio"
                  shopMoreLink="/products?category=audio"
                />
              </div>
            </main>
            <Footer />
          </div>
        </>
      );
    }

    // Fetch dynamic assets
    let products: any[] = [];
    try {
      products = await prisma.product.findMany({
        where: { status: "Active" },
        select: {
          id: true,
          photo: true,
          name: true,
          price: true,
          tp: true,
          mrp: true,
          createdAt: true,
        },
      });
    } catch (e) {
      products = [];
    }

    let categories: any[] = [];
    try {
      categories = await prisma.category.findMany({
        where: { status: "Active", parentId: null },
        include: {
          subcategories: {
            where: { status: "Active" },
          },
          _count: { select: { products: true } },
        },
        orderBy: { name: "asc" },
      });
    } catch (e) {
      categories = [];
    }

    let stores: any[] = [];
    try {
      if ((prisma as any).store) {
        stores = await (prisma as any).store.findMany({
          where: { status: "Active" },
          include: {
            _count: { select: { products: true } },
          },
          take: 12,
        });
      }
    } catch (e) {
      stores = [];
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    let weeklySales: any[] = [];
    try {
      if ((prisma as any).sales) {
        weeklySales = await (prisma as any).sales.findMany({
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
      }
    } catch (e) {
      weeklySales = [];
    }

    const weeklySalesCount: Record<string, number> = {};
    weeklySales.forEach((sale: any) => {
      const items = (sale.soldProducts || sale.products || []) as any[];
      items.forEach((item: any) => {
        const pId = item.productId || item.id;
        if (pId) {
          const qty = Number(item.qty || item.quantity || 0);
          weeklySalesCount[pId] = (weeklySalesCount[pId] || 0) + qty;
        }
      });
    });

    const weeklyProducts = products
      .filter((p) => weeklySalesCount[p.id] !== undefined)
      .map((p) => ({
        ...p,
        salesCount: weeklySalesCount[p.id] || 0,
      }))
      .sort((a, b) => b.salesCount - a.salesCount);

    const otherProducts = products.filter((p) => weeklySalesCount[p.id] === undefined);
    const displayWeeklyProducts = [...weeklyProducts, ...otherProducts];

    let activeBannersList: any[] = [];
    try {
      const activeBanners = await prisma.banner.findMany({
        where: { status: "Active" },
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      });
      activeBannersList = activeBanners.map((b: any) => ({
        id: b.id,
        photo: b.imageUrl,
        imageUrl: b.imageUrl,
        slug: b.link || "#",
        link: b.link || "#",
        title: b.title,
        badge: b.badge || null,
        discount: b.discount || null,
        subtitle: b.subtitle || null,
        type: b.type,
        order: b.order,
        status: b.status,
        createdAt: b.createdAt,
        updatedAt: b.updatedAt,
      }));
    } catch (e) {
      activeBannersList = [];
    }
    return (
      <div className="bg-[#F5F5F5] dark:bg-slate-950 min-h-screen flex flex-col w-full overflow-x-clip">
        {/* Dynamic sections rendering in sorting order */}
        {enabledSections.map((section) => {
          switch (section.sectionType) {
            case "Navbar":
              return <MavenNavbar key={section.id} />;

            case "HeroBanner":
              return (
                <div key={section.id} className="w-full flex flex-col gap-2">
                  <Banner banners={activeBannersList as any} />
                  <TriplePromoBanners />
                </div>
              );

            case "FlashSale":
              return (
                <div key={section.id} className="w-full max-w-[1200px] mx-auto px-4 xl:px-0 flex flex-col gap-6">
                  <FlashSaleGridSection />
                  <HotDealSection />
                  <FlashSalePlacement section={section} />
                </div>
              );

            case "Categories":
              return (
                <div key={section.id} className="w-full max-w-[1200px] mx-auto px-4 xl:px-0">
                  <FeaturedCategories categories={categories} />
                </div>
              );



            case "WeeklyBest":
              return (
                <div key={section.id} className="w-full max-w-[1200px] mx-auto px-4 xl:px-0">
                  <PopularProduct
                    products={displayWeeklyProducts.slice(0, (section.config as any)?.limit || 12)}
                    title={section.titleEn || "Weekly Best Product"}
                    shopMoreLink="/weekly-best-product"
                  />
                </div>
              );

            case "TodayDeals":
            case "DealsOfTheDay":
              return (
                <div key={section.id} className="w-full max-w-[1200px] mx-auto px-4 xl:px-0 flex flex-col gap-6">
                  <WeeklyTopVendorsSection />
                  <DailyDealsCarouselSection />
                </div>
              );

            case "CampaignBanner":
              return (
                <div key={section.id} className="w-full max-w-[1200px] mx-auto px-4 xl:px-0">
                  <CampaignPlacement section={section} />
                </div>
              );

            case "BundleSection":
              return (
                <div key={section.id} className="w-full max-w-[1200px] mx-auto px-4 xl:px-0">
                  <BundlePlacement section={section} />
                </div>
              );

            case "NewArrivals":
              return (
                <div key={section.id} className="w-full max-w-[1200px] mx-auto px-4 xl:px-0">
                  <PopularProduct products={products.slice(0, (section.config as any)?.limit || 12)} title={section.titleEn || "New Arrivals"} />
                </div>
              );

            case "ProductGrid":
            case "FeaturedProducts":
              return (
                <div key={section.id} className="w-full max-w-[1200px] mx-auto px-4 xl:px-0 flex flex-col gap-6">
                  <FeaturedProductsSection products={products.slice(0, (section.config as any)?.limit || 24)} title={section.titleEn?.replace(/\s*grid\s*/i, "") || "Featured Products"} />
                  <CategorySection title="Men's T-Shirts & Polos" categoryKey="mens-tshirt" shopMoreLink="/products?category=mens-tshirt" />
                  <CategorySection title="Men's Pants & Trousers" categoryKey="mens-pant" shopMoreLink="/products?category=mens-pant" />
                  <CategorySection title="Electronics & Gadgets" categoryKey="electronics" shopMoreLink="/products?category=electronics" />
                  <CategorySection title="Fashion & Apparel" categoryKey="fashion" shopMoreLink="/products?category=fashion" />
                  <CategorySection title="Watches & Jewelry" categoryKey="watches" shopMoreLink="/products?category=watches" />
                  <CategorySection title="Laptops & Tech" categoryKey="laptops" shopMoreLink="/products?category=laptops" />
                  <CategorySection title="Beauty & Skincare" categoryKey="beauty" shopMoreLink="/products?category=beauty" />
                  <CategorySection title="Headphones & Audio" categoryKey="audio" shopMoreLink="/products?category=audio" />
                </div>
              );
            case "FeaturedSellers":
            case "TopStores":
              return (
                <div key={section.id} className="w-full max-w-[1200px] mx-auto px-4 xl:px-0">
                  <FeaturedSellersSection stores={stores} />
                </div>
              );

            case "Footer":
              const hasCategoryGrid = enabledSections.some((s) => s.sectionType === "ProductGrid" || s.sectionType === "FeaturedProducts");
              const hasFlashSale = enabledSections.some((s) => s.sectionType === "FlashSale");
              const hasTodayDeals = enabledSections.some((s) => s.sectionType === "TodayDeals" || s.sectionType === "DealsOfTheDay");

              return (
                <React.Fragment key={section.id}>
                  {!hasFlashSale && (
                    <div className="w-full max-w-[1200px] mx-auto px-4 xl:px-0 flex flex-col gap-6">
                      <FlashSaleGridSection />
                      <HotDealSection />
                    </div>
                  )}
                  {!hasTodayDeals && (
                    <div className="w-full max-w-[1200px] mx-auto px-4 xl:px-0 flex flex-col gap-6">
                      <WeeklyTopVendorsSection />
                      <DailyDealsCarouselSection />
                    </div>
                  )}
                  {!hasCategoryGrid && (
                    <div className="w-full max-w-[1200px] mx-auto px-4 xl:px-0 flex flex-col gap-6">
                      <FeaturedProductsSection products={products.slice(0, 24)} title="Featured Products" shopMoreLink="/products" />
                      <CategorySection title="Men's T-Shirts & Polos" categoryKey="mens-tshirt" shopMoreLink="/products?category=mens-tshirt" />
                      <CategorySection title="Men's Pants & Trousers" categoryKey="mens-pant" shopMoreLink="/products?category=mens-pant" />
                      <CategorySection title="Electronics & Gadgets" categoryKey="electronics" shopMoreLink="/products?category=electronics" />
                      <CategorySection title="Fashion & Apparel" categoryKey="fashion" shopMoreLink="/products?category=fashion" />
                      <CategorySection title="Watches & Jewelry" categoryKey="watches" shopMoreLink="/products?category=watches" />
                      <CategorySection title="Laptops & Tech" categoryKey="laptops" shopMoreLink="/products?category=laptops" />
                      <CategorySection title="Beauty & Skincare" categoryKey="beauty" shopMoreLink="/products?category=beauty" />
                      <CategorySection title="Headphones & Audio" categoryKey="audio" shopMoreLink="/products?category=audio" />
                    </div>
                  )}
                  <div className="w-full max-w-[1200px] mx-auto px-4 xl:px-0">
                    <FeaturedSellersSection stores={stores} />
                  </div>
                  <Footer />
                </React.Fragment>
              );

            default:
              return null;
          }
        })}
      </div>
    );
  } catch (globalError) {
    console.error("Home page error caught:", globalError);
    return (
      <>
        <MavenNavbar />
        <div className="bg-[#F5F5F5] dark:bg-slate-950 min-h-screen flex flex-col w-full overflow-x-clip">
          <Banner banners={[]} />
          <TriplePromoBanners />
          <main className="w-full max-w-[1200px] mx-auto px-4 xl:px-0 pt-6 pb-6 flex flex-col gap-6 flex-1">
            <div className="flex flex-col gap-6 w-full pb-8">
              <FeaturedCategories categories={[]} />
              <FlashSaleGridSection />
              <HotDealSection />
              <DualPromoBanners />
              <WeeklyTopVendorsSection />
              <DailyDealsCarouselSection />
              <PopularProduct
                products={[]}
                title="Weekly Best Product"
                shopMoreLink="/weekly-best-product"
              />
              <FeaturedProductsSection
                products={[]}
                title="Featured Products"
                shopMoreLink="/products"
              />
              <CategorySection title="Men's T-Shirts & Polos" categoryKey="mens-tshirt" shopMoreLink="/products?category=mens-tshirt" />
              <CategorySection title="Men's Pants & Trousers" categoryKey="mens-pant" shopMoreLink="/products?category=mens-pant" />
              <CategorySection title="Electronics & Gadgets" categoryKey="electronics" shopMoreLink="/products?category=electronics" />
              <CategorySection title="Fashion & Apparel" categoryKey="fashion" shopMoreLink="/products?category=fashion" />
              <CategorySection title="Watches & Jewelry" categoryKey="watches" shopMoreLink="/products?category=watches" />
              <CategorySection title="Laptops & Tech" categoryKey="laptops" shopMoreLink="/products?category=laptops" />
              <CategorySection title="Beauty & Skincare" categoryKey="beauty" shopMoreLink="/products?category=beauty" />
              <CategorySection title="Headphones & Audio" categoryKey="audio" shopMoreLink="/products?category=audio" />
              <FeaturedSellersSection stores={[]} />
            </div>
          </main>
          <Footer />
        </div>
      </>
    );
  }
}
