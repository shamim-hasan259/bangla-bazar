export const dynamic = "force-dynamic";

import React from "react";
import prisma from "@/index";
import SliderClient from "./SliderClient";

export default async function SliderPage() {
  const initialBanners = await prisma.banner.findMany({
    where: {
      type: "MainSlider",
    },
    orderBy: [
      { order: "asc" },
      { createdAt: "desc" }
    ],
  });

  // Convert dates to ISO strings for client component serialization safety
  const serializedBanners = initialBanners.map(banner => ({
    ...banner,
    createdAt: banner.createdAt.toISOString(),
    updatedAt: banner.updatedAt.toISOString(),
  }));

  return <SliderClient initialBanners={serializedBanners} />;
}
