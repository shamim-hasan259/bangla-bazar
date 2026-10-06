import React from "react";
import prisma from "@/index";
import DailyBestSells from "@/components/home/DailyBestSells";

interface FlashSalePlacementProps {
  section: any;
}

export default async function FlashSalePlacement({ section }: FlashSalePlacementProps) {
  try {
    let flashSaleId = section.flashSaleId;

    if (!flashSaleId) {
      const activeFs = await prisma.flashSale.findFirst({
        where: {
          endDate: { gte: new Date() }
        },
        orderBy: { startDate: "asc" }
      });
      if (activeFs) {
        flashSaleId = activeFs.id;
      }
    }

    if (!flashSaleId) return null;

    // Query Flash Sale details & approved items
    const fs = await prisma.flashSale.findUnique({
      where: { id: flashSaleId },
      include: {
        products: {
          where: { status: "Approved" },
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                mrp: true,
                photo: true,
              }
            }
          }
        }
      }
    });

    if (!fs || new Date(fs.endDate) < new Date()) return null;
    const flashProducts = fs.products.map(fp => {
      if (!fp.product) return null;
      const discountedPrice = fp.product.price - (fp.product.price * (fp.discountPercentage / 100));
      return {
        ...fp.product,
        price: discountedPrice,
        mrp: fp.product.price,
      };
    }).filter(Boolean);

    if (flashProducts.length === 0) return null;

    return (
      <DailyBestSells products={flashProducts as any} />
    );
  } catch (error) {
    console.error("FlashSalePlacement Error:", error);
    return null;
  }
}
