export const dynamic = "force-dynamic";

import React from "react";
import prisma from "@/index";
import BottomPromoClient from "./BottomPromoClient";

export default async function BottomPromoPage() {
  const currentBanner = await prisma.banner.findFirst({
    where: {
      type: "BottomPromo",
    },
  });

  const serializedBanner = currentBanner
    ? {
        ...currentBanner,
        createdAt: currentBanner.createdAt.toISOString(),
        updatedAt: currentBanner.updatedAt.toISOString(),
      }
    : null;

  return <BottomPromoClient initialBanner={serializedBanner} />;
}
