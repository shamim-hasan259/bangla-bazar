"use client";

import React from "react";
import { Button } from "../ui/button";
import { Heart } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { addToWishlist, removeFromWishlist } from "@/app/redux-store/Slice/WishlistSlice";
import { toast } from "sonner";
import { RootState } from "@/app/redux-store/store";
import { cn } from "@/lib/utils";
import { sendClientNotification } from "@/lib/clientNotifications";

interface AddToWishlistProps {
    product: any;
    variant?: "default" | "ghost" | "outline";
    size?: "default" | "sm" | "lg";
    className?: string;
}

const AddToWishlist = ({
    product,
    variant = "ghost",
    size = "sm",
    className
}: AddToWishlistProps) => {
    const { data: session } = useSession();
    const router = useRouter();
    const dispatch = useDispatch();

    const wishlistItems = useSelector(
        (state: RootState) => state.wishlist.items
    );

    const isInWishlist = wishlistItems.some(
        (item) => item.id === product?.id
    );

    const handleToggleWishlist = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!session?.user) {
            toast.error("Please log in to add items to wishlist!");
            router.push("/auth/customer/login");
            return;
        }

        const userRole = String(
            (session?.user as any)?.role || (session?.user as any)?.type || ""
        ).toLowerCase();
        const isAdmin = ["admin", "manager", "stuff", "sales", "marketing"].includes(userRole);

        if (isAdmin) {
            toast.error("Admins cannot add products to wishlist! Please use a customer account.");
            return;
        }

        if (isInWishlist) {
            dispatch(removeFromWishlist(product?.id));
            toast.success("Removed from wishlist");
        } else {
            const currentUserId = (session.user as any).id;
            const currentUserEmail = session.user.email;
            const currentUserPhone = (session.user as any).phone;

            if (
                (product?.sellerId && product.sellerId === currentUserId) ||
                (product?.seller?.id && product.seller.id === currentUserId) ||
                (product?.store?.sellerId && product.store.sellerId === currentUserId) ||
                (currentUserEmail && (product?.seller?.email === currentUserEmail || product?.store?.email === currentUserEmail)) ||
                (currentUserPhone && (product?.seller?.phone === currentUserPhone || product?.store?.phone === currentUserPhone))
            ) {
                toast.error("You cannot add your own product to wishlist!");
                return;
            }

            dispatch(
                addToWishlist({
                    id: product?.id,
                    name: product?.name,
                    photo: product?.photo,
                    price: product?.price,
                    mrp: product?.mrp,
                })
            );
            sendClientNotification({
                category: "Wishlist",
                title: "Added to Wishlist ❤️",
                message: `"${product?.name || "Product"}" has been saved to your wishlist.`,
                link: "/dashboard/customer/wishlist",
            });
            toast.success("Added to wishlist");
        }
    };

    return (
        <Button
            onClick={handleToggleWishlist}
            variant={variant}
            size={size}
            className={cn(
                "transition-all duration-200",
                isInWishlist && "text-red-500 hover:text-red-600",
                className
            )}
            title={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
            <Heart
                className={cn(
                    "h-5 w-5 transition-all",
                    isInWishlist && "fill-current"
                )}
            />
            {size !== "sm" && (
                <span className="ml-2">
                    {isInWishlist ? "Saved" : "Save"}
                </span>
            )}
        </Button>
    );
};

export default AddToWishlist;
