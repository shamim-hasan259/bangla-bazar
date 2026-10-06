export const dynamic = "force-dynamic";
import prisma from "@/index";
import RightPromoClient from "./RightPromoClient";

export default async function RightPromoPage() {
  const banners = await prisma.banner.findMany({
    where: {
      type: "RightPromo",
    },
    orderBy: [
      { order: "asc" },
      { createdAt: "desc" },
    ],
  });

  const serializedBanners = banners.map((b) => ({
    ...b,
    createdAt: b.createdAt.toISOString(),
    updatedAt: b.updatedAt.toISOString(),
  }));

  return <RightPromoClient initialBanners={serializedBanners} />;
}
