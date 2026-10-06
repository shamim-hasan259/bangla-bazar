"use client";

import { FC } from "react";
import { Product } from "@/types/interface";
import AddToWishlist from "./AddToWishlist";

interface WishlistButtonProps {
  product: Product;
}

const WishlistButton: FC<WishlistButtonProps> = ({ product }) => {
  return (
    <div className="absolute top-3 right-3 z-10">
      <AddToWishlist
        product={product}
        variant="ghost"
        size="sm"
        className="bg-slate-200 dark:bg-slate-900/90 cursor-pointer backdrop-blur-sm hover:bg-white dark:hover:bg-slate-900 shadow-md hover:shadow-lg transition-all duration-200 rounded-full h-9 w-9 p-0"
      />
    </div>
  );
};

export default WishlistButton;
