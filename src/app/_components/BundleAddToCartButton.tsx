"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useDispatch } from "react-redux";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { addToCart } from "@/app/redux-store/Slice/CartSlice";
import { toast } from "sonner";

interface BundleAddToCartButtonProps {
  bundleName: string;
  products: any[];
}

export default function BundleAddToCartButton({
  bundleName,
  products = [],
}: BundleAddToCartButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const dispatch = useDispatch();

  const handleAdd = () => {
    if (!session?.user) {
      toast.error("Please log in to add items to cart!");
      router.push("/auth/customer/login");
      return;
    }
    try {
      products.forEach((prod) => {
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

      toast.success(`Bundle "${bundleName}" items added to cart!`);
    } catch {
      toast.error("Failed to add bundle to cart");
    }
  };

  return (
    <Button
      onClick={handleAdd}
      className="bg-black hover:bg-slate-800 text-white font-bold rounded-xl py-3 flex items-center justify-center gap-1.5 shadow-sm text-[10px]"
    >
      <ShoppingCart className="w-3.5 h-3.5" />
      <span>Add Bundle</span>
    </Button>
  );
}
