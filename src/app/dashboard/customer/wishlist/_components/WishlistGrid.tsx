"use client";

import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/app/redux-store/store";
import ProductCard from "@/components/home/ProductCard";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Heart } from "lucide-react";

const WishlistGrid = () => {
    const wishlistItems = useSelector((state: RootState) => state.wishlist.items);

    if (wishlistItems.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="bg-muted p-6 rounded-full mb-6">
                    <Heart className="size-12 text-muted-foreground" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Your wishlist is empty</h2>
                <p className="text-muted-foreground mb-8 max-w-md">
                    Save items you love to your wishlist to keep track of them and buy them later.
                </p>
                <Link href="/products">
                    <Button>Explore Products</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistItems.map((product) => (
                <ProductCard key={product.id} product={product as any} />
            ))}
        </div>
    );
};

export default WishlistGrid;
