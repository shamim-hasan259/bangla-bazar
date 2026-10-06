"use client";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import defaultImage from "../../../public/img/wishListDefault.png";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import React, { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useSelector, useDispatch } from "react-redux";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { RootState } from "@/app/redux-store/store";
import { removeFromWishlist, clearWishlist } from "@/app/redux-store/Slice/WishlistSlice";
import { addToCart } from "@/app/redux-store/Slice/CartSlice";
import { toast } from "sonner";
import { Separator } from "../ui/separator";
import { useLanguage } from "@/context/LanguageContext";

function WishListDrawer({
  triggerClassName,
  iconClassName,
  showLabel = false,
}: {
  triggerClassName?: string;
  iconClassName?: string;
  showLabel?: boolean;
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState<boolean>(false);
  const dispatch = useDispatch();
  const { t } = useLanguage();

  const wishlists = useSelector(
    (state: RootState) => state.wishlist.items
  );

  const handleRemoveFromWishlist = (id: string) => {
    dispatch(removeFromWishlist(id));
    toast.success(t("removed_from_wishlist", "Removed from wishlist"));
  };

  const handleMoveToCart = (product: any) => {
    if (!session?.user) {
      toast.error("Please log in to add items to cart!");
      setOpen(false);
      router.push("/auth/customer/login");
      return;
    }
    dispatch(
      addToCart({
        id: product.id,
        quantity: 1,
        name: product.name,
        photo: product.photo,
        price: product.price,
        mrp: product.mrp,
      })
    );
    dispatch(removeFromWishlist(product.id));
    toast.success(t("moved_to_cart", "Moved to cart"));
  };

  const handleClearWishlist = () => {
    dispatch(clearWishlist());
    toast.success(t("wishlist_cleared", "Wishlist cleared"));
  };

  // Helper function to extract product image
  const getProductImage = (photo: any) => {
    if (!photo) return defaultImage;
    if (Array.isArray(photo) && photo.length > 0) {
      return photo[0] || defaultImage;
    }
    if (typeof photo === 'string' && photo !== '') {
      return photo;
    }
    return defaultImage;
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen && !session?.user) {
      toast.error("Please log in to view your wishlist!");
      router.push("/auth/customer/login?callbackUrl=/wishlist");
      return;
    }
    setOpen(newOpen);
  };

  return (
    <div>
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            onClick={(e) => {
              if (!session?.user) {
                e.preventDefault();
                e.stopPropagation();
                toast.error("Please log in to view your wishlist!");
                router.push("/auth/customer/login?callbackUrl=/wishlist");
                return;
              }
              setOpen(true);
            }}
            className={cn("h-auto py-1 px-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-transparent hover:text-blue-600 transition-colors relative group flex items-center gap-1.5 cursor-pointer shadow-none border-none", triggerClassName)}
          >
            <div className="relative flex items-center">
              <Heart size={21} className={cn("text-slate-700 dark:text-slate-300 group-hover:text-blue-600 transition-colors", iconClassName)} />
              {session?.user && wishlists.length > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-blue-600 text-white text-[10px] font-bold h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center border border-white dark:border-slate-900 shadow-xs animate-in zoom-in">
                  {wishlists.length}
                </span>
              )}
            </div>
            {showLabel && (
              <span className="text-[13px] font-medium text-slate-700 dark:text-slate-300 group-hover:text-blue-600 transition-colors">
                {t("wishlist")}
              </span>
            )}
          </Button>
        </SheetTrigger>

        <SheetContent className="h-full flex flex-col w-full sm:max-w-lg">
          <SheetHeader>
            <div className="flex items-center justify-between">
              <div>
                <SheetTitle className="text-2xl font-bold">{t("wishlist")}</SheetTitle>
                <SheetDescription>
                  {wishlists.length} {wishlists.length === 1 ? t("item", "item") : t("items", "items")}
                </SheetDescription>
              </div>
              {wishlists.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearWishlist}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={16} className="mr-2" />
                  {t("clear_all", "Clear All")}
                </Button>
              )}
            </div>
          </SheetHeader>

          <Separator className="my-4" />

          <div className="flex-1 overflow-y-auto py-2">
            {wishlists.length > 0 ? (
              <ul className="space-y-4">
                {wishlists.map((product) => (
                  <li
                    key={product.id}
                    className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 hover:shadow-lg transition-all duration-200"
                  >
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800">
                          <Image
                            src={getProductImage(product.photo)}
                            fill
                            alt={product.name || "Product Image"}
                            className="object-cover"
                          />
                        </div>
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 line-clamp-2 mb-2">
                          {t(product.name, product.name)}
                        </h3>

                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-lg font-bold text-primary">
                            ৳{product.price?.toFixed(2)}
                          </span>
                          {product.mrp && product.mrp > product.price && (
                            <span className="text-sm text-slate-400 line-through">
                              ৳{product.mrp.toFixed(2)}
                            </span>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleMoveToCart(product)}
                            className="flex-1 h-9"
                          >
                            <ShoppingCart size={16} className="mr-2" />
                            {t("add_to_cart")}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRemoveFromWishlist(product.id)}
                            className="h-9 px-3 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                  <Heart size={40} className="text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  {t("wishlist_empty", "Your wishlist is empty")}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-xs">
                  {t("save_items_love", "Save items you love to your wishlist and shop them later")}
                </p>
                <Button onClick={() => setOpen(false)} variant="default">
                  {t("start_shopping", "Start Shopping")}
                </Button>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default WishListDrawer;
