import React from "react";
import prisma from "@/index";
import { Layers } from "lucide-react";
import BundleAddToCartButton from "./BundleAddToCartButton";

export default async function BundlePlacement({ section }: { section: any }) {
  try {
    // Query active bundles safely
    const bundles: any[] = (await (prisma as any).productBundle?.findMany({
      where: { status: "Active" },
      take: 4
    })) || [];

    if (!bundles || bundles.length === 0) return null;

    // Resolve all products involved in these bundles
    const bundleProductIds: string[] = Array.from(
      new Set(bundles.flatMap((b: any) => b.productIds || []))
    );

    const dbProducts: any[] = await prisma.product.findMany({
      where: { id: { in: bundleProductIds } },
      select: { id: true, name: true, price: true, photo: true, mrp: true }
    });

    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-xs space-y-4 text-xs">
        <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-slate-900 dark:text-white" />
          Special Bundle Offers
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bundles.map((bundle: any) => {
            const bundleProducts = dbProducts.filter((p: any) =>
              (bundle.productIds || []).includes(p.id)
            );
            if (bundleProducts.length < 2) return null;

            const baseTotal = bundleProducts.reduce(
              (sum: number, p: any) => sum + (p.price || 0),
              0
            );
            const bundlePrice = Math.max(0, baseTotal - (bundle.discountValue || 0));

            return (
              <div
                key={bundle.id}
                className="border border-slate-100 dark:border-slate-850 p-4 rounded-xl flex flex-col md:flex-row justify-between gap-4 bg-slate-50/50"
              >
                <div className="space-y-3 flex-1 min-w-0">
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-200">{bundle.name}</h4>
                    {bundle.description && (
                      <p className="text-slate-500 mt-0.5 text-[10px]">{bundle.description}</p>
                    )}
                  </div>

                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {bundleProducts.map((p: any) => {
                      let img = "";
                      if (p.photo) {
                        if (Array.isArray(p.photo) && p.photo.length > 0) {
                          img = p.photo[0];
                        } else if (typeof p.photo === "string") {
                          img = p.photo;
                        }
                      }

                      return (
                        <div
                          key={p.id}
                          className="w-12 h-12 rounded-lg bg-white border p-1 shrink-0 flex items-center justify-center"
                        >
                          {img ? (
                            <img src={img} alt={p.name} className="w-full h-full object-contain" />
                          ) : (
                            <div className="w-full h-full bg-slate-100 rounded" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-col justify-between items-end gap-2 border-t md:border-t-0 md:border-l pt-3 md:pt-0 md:pl-4 border-slate-100 dark:border-slate-800 shrink-0">
                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      ৳{bundlePrice.toLocaleString()}
                    </div>
                    {baseTotal > bundlePrice && (
                      <div className="text-[10px] text-slate-400 line-through">
                        ৳{baseTotal.toLocaleString()}
                      </div>
                    )}
                  </div>

                  <BundleAddToCartButton bundleName={bundle.name || "Bundle"} products={bundleProducts} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  } catch (err) {
    console.error("Error loading Bundle placement:", err);
    return null;
  }
}
