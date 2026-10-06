"use server";

import prisma from "@/index";
import { revalidatePath } from "next/cache";

const DEFAULT_SECTIONS = [
  { sectionType: "Navbar", titleEn: "Header Navigation Bar", titleBn: "নেভিগেশন হেডার", position: 1, enabled: true },
  { sectionType: "HeroBanner", titleEn: "Hero Slider & Promo Banners", titleBn: "প্রধান ব্যানার ও প্রমো", position: 2, enabled: true },
  { sectionType: "Categories", titleEn: "Featured Categories", titleBn: "জনপ্রিয় ক্যাটাগরি", position: 3, enabled: true },
  { sectionType: "FlashSale", titleEn: "Flash Sale & Hot Deals", titleBn: "ফ্ল্যাশ সেল ও হট ডিলস", position: 4, enabled: true },
  { sectionType: "TodayDeals", titleEn: "Deals of the Day & Top Vendors", titleBn: "দিনের সেরা ডিল ও ভেন্ডর", position: 5, enabled: true },
  { sectionType: "WeeklyBest", titleEn: "Weekly Best Products", titleBn: "সাপ্তাহিক সেরা পণ্য", position: 6, enabled: true },
  { sectionType: "NewArrivals", titleEn: "New Arrivals / Popular Products", titleBn: "নতুন ও জনপ্রিয় পণ্য", position: 7, enabled: true },
  { sectionType: "ProductGrid", titleEn: "Featured Products & Category Showcase", titleBn: "ফিচার্ড পণ্য ও ক্যাটাগরি গ্রিড", position: 8, enabled: true },
  { sectionType: "BundleSection", titleEn: "Bundle Deals Placement", titleBn: "বান্ডেল ডিলস", position: 9, enabled: true },
  { sectionType: "CampaignBanner", titleEn: "Campaign Placement Banner", titleBn: "ক্যাম্পেইন প্লেসমেন্ট", position: 10, enabled: true },
  { sectionType: "FeaturedSellers", titleEn: "Featured Stores & Sellers", titleBn: "ফিচার্ড স্টোর ও সেলার", position: 11, enabled: true },
  { sectionType: "Footer", titleEn: "Footer & Trust Information", titleBn: "ফুটার ইনফরমেশন", position: 12, enabled: true },
];

export async function getHomepageSections() {
  try {
    let sections = await prisma.homepageSection.findMany({
      orderBy: { position: "asc" },
      include: {
        campaign: {
          select: { id: true, name: true }
        },
        flashSale: {
          select: { id: true, name: true }
        }
      }
    });

    if (!sections || sections.length === 0) {
      for (const def of DEFAULT_SECTIONS) {
        await prisma.homepageSection.create({
          data: {
            sectionType: def.sectionType,
            titleEn: def.titleEn,
            titleBn: def.titleBn,
            position: def.position,
            enabled: def.enabled,
            config: { limit: 12 },
          }
        });
      }

      sections = await prisma.homepageSection.findMany({
        orderBy: { position: "asc" },
        include: {
          campaign: { select: { id: true, name: true } },
          flashSale: { select: { id: true, name: true } }
        }
      });
    }

    return sections;
  } catch (error) {
    console.error("Error getting homepage sections:", error);
    return [];
  }
}

export async function updateSectionOrdering(orders: { id: string; position: number }[]) {
  try {
    for (const order of orders) {
      await prisma.homepageSection.update({
        where: { id: order.id },
        data: { position: order.position }
      });
    }
    revalidatePath("/");
    revalidatePath("/dashboard/admin/homepage");
    return { success: true };
  } catch (error: any) {
    console.error("Error reordering sections:", error);
    return { success: false, error: error.message };
  }
}

export async function toggleSectionStatus(id: string, enabled: boolean) {
  try {
    const updated = await prisma.homepageSection.update({
      where: { id },
      data: { enabled }
    });
    revalidatePath("/");
    revalidatePath("/dashboard/admin/homepage");
    return { success: true, section: updated };
  } catch (error: any) {
    console.error("Error toggling section:", error);
    return { success: false, error: error.message };
  }
}

export async function updateSectionConfig(
  id: string,
  config: any,
  campaignId?: string,
  flashSaleId?: string
) {
  try {
    const updated = await prisma.homepageSection.update({
      where: { id },
      data: {
        config: config || {},
        campaignId: campaignId || null,
        flashSaleId: flashSaleId || null
      }
    });
    revalidatePath("/");
    revalidatePath("/dashboard/admin/homepage");
    return { success: true, section: updated };
  } catch (error: any) {
    console.error("Error updating config:", error);
    return { success: false, error: error.message };
  }
}

const DEFAULT_BANNERS = [
  {
    title: "Super Discount 90%",
    subtitle: "Exclusive Summer Offer on Tech & Gadgets",
    desktopImage: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&q=80",
    mobileImage: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80",
    linkUrl: "/products",
    position: 1,
    enabled: true,
  },
  {
    title: "Studio Headsets Sale",
    subtitle: "High-Fidelity Audio & Noise Cancelling",
    desktopImage: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=1200&q=80",
    mobileImage: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&q=80",
    linkUrl: "/products?category=audio",
    position: 2,
    enabled: true,
  },
  {
    title: "Luxury Smart Watches",
    subtitle: "Next Gen AMOLED & Health Tracking",
    desktopImage: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&q=80",
    mobileImage: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80",
    linkUrl: "/products?category=watches",
    position: 3,
    enabled: true,
  },
];

export async function getHomepageBanners() {
  try {
    let banners = await prisma.homepageBanner.findMany({
      orderBy: { position: "asc" }
    });

    if (!banners || banners.length === 0) {
      // Check legacy banners first
      try {
        const legacy = await prisma.banner.findMany({
          where: { status: "Active" },
          orderBy: [{ order: "asc" }, { createdAt: "desc" }]
        });
        if (legacy && legacy.length > 0) {
          for (let i = 0; i < legacy.length; i++) {
            const b = legacy[i];
            await prisma.homepageBanner.create({
              data: {
                title: b.title || `Promo Slide ${i + 1}`,
                subtitle: "Special Verified Offer",
                desktopImage: b.imageUrl || "/img/products/modern-smartphone.jpg",
                mobileImage: b.imageUrl || "/img/products/modern-smartphone.jpg",
                linkUrl: b.link || "/products",
                position: b.order || (i + 1),
                enabled: true,
              }
            });
          }
        } else {
          for (const def of DEFAULT_BANNERS) {
            await prisma.homepageBanner.create({
              data: def
            });
          }
        }
      } catch {
        for (const def of DEFAULT_BANNERS) {
          await prisma.homepageBanner.create({
            data: def
          });
        }
      }

      banners = await prisma.homepageBanner.findMany({
        orderBy: { position: "asc" }
      });
    }

    return banners;
  } catch (error) {
    console.error("Error getting banners:", error);
    return [];
  }
}

export async function createHomepageBanner(data: {
  title?: string;
  subtitle?: string;
  desktopImage: string;
  mobileImage?: string;
  linkUrl?: string;
  position: number;
}) {
  try {
    const banner = await prisma.homepageBanner.create({
      data: {
        title: data.title || null,
        subtitle: data.subtitle || null,
        desktopImage: data.desktopImage,
        mobileImage: data.mobileImage || null,
        linkUrl: data.linkUrl || null,
        position: Number(data.position)
      }
    });
    revalidatePath("/");
    revalidatePath("/dashboard/admin/homepage");
    return { success: true, banner };
  } catch (error: any) {
    console.error("Error creating banner:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteHomepageBanner(id: string) {
  try {
    await prisma.homepageBanner.delete({
      where: { id }
    });
    revalidatePath("/");
    revalidatePath("/dashboard/admin/homepage");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting banner:", error);
    return { success: false, error: error.message };
  }
}

// ============================================
// Helper Options Queries
// ============================================

export async function getHomepageCampaigns() {
  try {
    return await prisma.campaign.findMany({
      where: { endDate: { gte: new Date() } },
      select: { id: true, name: true }
    });
  } catch (error) {
    console.error("Error getting campaigns for homepage selection:", error);
    return [];
  }
}

export async function getHomepageFlashSales() {
  try {
    return await prisma.flashSale.findMany({
      where: { endDate: { gte: new Date() } },
      select: { id: true, name: true }
    });
  } catch (error) {
    console.error("Error getting flash sales for homepage selection:", error);
    return [];
  }
}
