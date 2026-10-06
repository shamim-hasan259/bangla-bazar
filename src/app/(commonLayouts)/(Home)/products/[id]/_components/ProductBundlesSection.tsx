"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Layers, ShoppingCart } from "lucide-react";
import { useDispatch } from "react-redux";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { addToCart } from "@/app/redux-store/Slice/CartSlice";
import { toast } from "sonner";

interface ProductBundlesSectionProps {
  bundles: any[];
  allProducts: any[]; // all products list mapped for names & prices
}

export default function ProductBundlesSection({
  bundles = [],
  allProducts = [],
}: ProductBundlesSectionProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const dispatch = useDispatch();

  const handleAddBundleToCart = (bundle: any, bundleProducts: any[]) => {
    if (!session?.user) {
      toast.error("Please log in to add items to cart!");
      router.push("/auth/customer/login");
      return;
    }
    try {
      bundleProducts.forEach((prod) => {
        // Map photo cleanly
        let photoUrl = "";
        if (prod.photo) {
          if (Array.isArray(prod.photo) && prod.photo.length > 0) {
            photoUrl = prod.photo[0];
          } else if (typeof prod.photo === "string") {
            photoUrl = prod.photo;
          }
        }

        dispatch(
          addToCart({
            id: prod.id,
            quantity: 1,
            name: prod.name,
            photo: photoUrl || "",
            price: prod.price,
            mrp: prod.mrp || prod.price,
          })
        );
      });

      toast.success(`Bundle "${bundle.name}" items added to cart!`);
    } catch {
      toast.error("Failed to add bundle to cart");
    }
  };

  if (bundles.length === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-xs space-y-4 text-xs">
      <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
        <Layers className="w-5 h-5 text-[#1E60ED]" />
        Frequently Bought Together
      </h3>
      <div className="space-y-4">
        {bundles.map((bundle) => {
          // Resolve full product data inside this bundle
          const bundleProducts = allProducts.filter((p) => bundle.productIds.includes(p.id));
          if (bundleProducts.length < 2) return null;

          const baseTotal = bundleProducts.reduce((sum, p) => sum + p.price, 0);
          const bundlePrice = Math.max(0, baseTotal - bundle.discountValue);

          return (
            <div
              key={bundle.id}
              className="border border-slate-100 dark:border-slate-850 p-4 rounded-xl space-y-4"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200">{bundle.name}</h4>
                  {bundle.description && (
                    <p className="text-slate-500 mt-0.5 text-[11px]">{bundle.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-4 self-end md:self-auto">
                  <div className="text-right">
                    <div className="flex items-center gap-1.5 justify-end">
                      <span className="line-through text-slate-450">৳ {baseTotal.toFixed(0)}</span>
                      <span className="font-bold text-[#1E60ED] text-sm">৳ {bundlePrice.toFixed(0)}</span>
                    </div>
                    <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold text-[9px]">
                      Save ৳ {bundle.discountValue}
                    </span>
                  </div>
                  <Button
                    onClick={() => handleAddBundleToCart(bundle, bundleProducts)}
                    className="bg-[#1E60ED] hover:bg-blue-600 text-white font-bold rounded-xl flex items-center gap-2 py-4"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Add Bundle to Cart</span>
                  </Button>
                </div>
              </div>

              {/* Grouped products visual mapping */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 border-t pt-4">
                {bundleProducts.map((p, idx) => {
                  let img = "";
                  if (p.photo) {
                    if (Array.isArray(p.photo) && p.photo.length > 0) {
                      img = p.photo[0];
                    } else if (typeof p.photo === "string") {
                      img = p.photo;
                    }
                  }

                  return (
                    <div key={p.id} className="flex flex-col items-center text-center space-y-1">
                      <div className="relative w-12 h-12 rounded border overflow-hidden bg-slate-50">
                        {img ? (
                          <img src={img} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-300">
                            No Image
                          </div>
                        )}
                      </div>
                      <p className="font-semibold text-slate-700 dark:text-slate-350 truncate max-w-full text-[10px]" title={p.name}>
                        {p.name}
                      </p>
                      <p className="text-slate-500 text-[10px] font-bold">৳ {p.price}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
