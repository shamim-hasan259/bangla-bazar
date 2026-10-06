"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Star, ShoppingCart, GitCompare, Heart } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ProductProps } from "@/types/interface";
import { useDispatch, useSelector } from "react-redux";
import { useSession } from "next-auth/react";
import { RootState } from "@/app/redux-store/store";
import { addToCart } from "@/app/redux-store/Slice/CartSlice";
import { addToCompare, removeFromCompare } from "@/app/redux-store/Slice/CompareSlice";
import { addToWishlist, removeFromWishlist } from "@/app/redux-store/Slice/WishlistSlice";
import { toast } from "sonner";
import { sendClientNotification } from "@/lib/clientNotifications";
import { useLanguage } from "@/context/LanguageContext";


const DIVERSE_FALLBACK_ITEMS = [
  { photo: "/img/products/modern-smartphone.jpg", name: "Modern Flagship 5G Smartphone 256GB", price: 42500, mrp: 48000 },
  { photo: "/img/products/wireless-earbuds.jpg", name: "True Wireless Earbuds IPX7 Touch Control", price: 1899, mrp: 2499 },
  { photo: "/img/products/black-cotton-tshirt.jpg", name: "Premium Black Cotton Crewneck T-Shirt", price: 650, mrp: 850 },
  { photo: "/img/products/mens-denim-jeans.jpg", name: "Men's Classic Blue Slim Fit Denim Jeans", price: 1450, mrp: 1850 },
  { photo: "/img/products/running-sneakers.jpg", name: "Pro Athletic Lightweight Running Sneakers", price: 2150, mrp: 2650 },
  { photo: "/img/products/luxury-perfume.jpg", name: "Aura Nocturne Eau De Parfum 100ml Luxury", price: 1450, mrp: 1800 },
  { photo: "/img/products/vitamin-c-serum.jpg", name: "Vitamin C Brightening Face Serum 30ml", price: 899, mrp: 1099 },
  { photo: "/img/products/khaki-chino-pants.jpg", name: "Men's Premium Slim Fit Casual Chino Pants", price: 1250, mrp: 1550 },
  { photo: "/img/products/portable-speaker.jpg", name: "Portable Bluetooth Speaker 20W Waterproof", price: 2499, mrp: 2999 },
  { photo: "/img/products/white-polo-shirt.jpg", name: "Classic White Pique Polo T-Shirt", price: 799, mrp: 999 },
  { photo: "/img/products/casual-hoodie.jpg", name: "Casual Fleece Pullover Hoodie Sweatshirt", price: 1299, mrp: 1699 },
  { photo: "/img/products/travel-backpack.jpg", name: "Waterproof Travel Laptop Backpack 30L", price: 1999, mrp: 2499 },
];

function StarRating({ rating }: { rating: number | string }) {
  const score = typeof rating === "string" ? parseFloat(rating) : rating;
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = score >= star;
        const half = !filled && score >= star - 0.5;
        return (
          <span key={star} className="relative inline-block w-3.5 h-3.5">
            <Star className="w-3.5 h-3.5 text-slate-200 fill-slate-200 absolute inset-0" />
            {(filled || half) && (
              <span className="absolute inset-0 overflow-hidden" style={{ width: half ? "50%" : "100%" }}>
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
}

const ProductCard: React.FC<ProductProps> = ({ product }) => {
  const { data: session } = useSession();
  const { t } = useLanguage();
  const { id, name, price, mrp, photo } = product || {};

  const dispatch = useDispatch();
  const cartItems = useSelector((state: RootState) => state.cart?.items || []);
  const compareItems = useSelector((state: RootState) => state.compare?.items || []);
  const wishlistItems = useSelector((state: RootState) => state.wishlist?.items || []);
  const [imageError, setImageError] = useState(false);
  const [hovered, setHovered] = useState(false);

  const getFallbackItem = () => {
    const key = String(id || name || "prod");
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      hash = key.charCodeAt(i) + ((hash << 5) - hash);
    }
    return DIVERSE_FALLBACK_ITEMS[Math.abs(hash) % DIVERSE_FALLBACK_ITEMS.length];
  };

  const fallbackItem = getFallbackItem();

  const isValidUrl = (url: any): boolean => {
    if (typeof url !== "string") return false;
    const t = url.trim();
    return t !== "" && (t.startsWith("/") || t.startsWith("http://") || t.startsWith("https://"));
  };

  const extractProductImage = () => {
    if (imageError) return fallbackItem.photo;
    if (Array.isArray(photo) && photo.length > 0) {
      return isValidUrl(photo[0]) ? photo[0].trim() : fallbackItem.photo;
    }
    if (typeof photo === "string") return isValidUrl(photo) ? photo.trim() : fallbackItem.photo;
    return fallbackItem.photo;
  };

  const productImg = extractProductImage();

  const getCleanTitle = () => {
    if (!name || name.trim() === "" || ["t-shirt","shirt","product"].includes(name.toLowerCase())) return fallbackItem.name;
    return name;
  };

  const displayTitle = getCleanTitle();
  const displayPrice = price && price > 0 ? price : fallbackItem.price;
  const displayMrp = mrp && mrp > displayPrice ? mrp : (fallbackItem.mrp || Math.round(displayPrice * 1.15));
  const isCompared = compareItems.some((item) => item.id === (id || "prod-item"));
  const isWishlisted = wishlistItems.some((item) => item.id === (id || "prod-item"));
  const discountPercent = displayMrp && displayMrp > displayPrice ? Math.round(((displayMrp - displayPrice) / displayMrp) * 100) : 0;
  const ratingScore = product?.rating || "4.5";
  const reviewCount = product?.reviews || "21k";

  const router = useRouter();

  const userRole = String(
    (session?.user as any)?.role || (session?.user as any)?.type || ""
  ).toLowerCase();
  const isAdmin = ["admin", "manager", "stuff", "sales", "marketing"].includes(userRole);

  const handleToggleCompare = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!session?.user) {
      toast.error("Please log in to compare products!");
      router.push("/auth/customer/login");
      return;
    }
    if (isAdmin) {
      toast.error("Admins cannot compare products! Please use a customer account.");
      return;
    }
    const targetId = id || "prod-item";
    if (isCompared) {
      dispatch(removeFromCompare(targetId));
      toast("Removed from compare list");
    } else {
      if (compareItems.length >= 4) { toast.error("You can compare up to 4 products at a time"); return; }
      const photoUrl = productImg || "/placeholder-product.png";
      dispatch(addToCompare({ id: targetId, name: displayTitle, price: displayPrice, mrp: displayMrp, photo: photoUrl }));
      toast.success("Added to compare list");
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();

    if (!session?.user) {
      toast.error("Please log in to add items to cart!");
      router.push("/auth/customer/login");
      return;
    }

    if (isAdmin) {
      toast.error("Admins cannot add products to cart! Please use a customer account.");
      return;
    }

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
      toast.error("You cannot order or add your own product to cart!");
      return;
    }

    const existingItem = cartItems.find((item) => item.id === id);
    const photoUrl = productImg || "/placeholder-product.png";
    dispatch(addToCart({ id: id || "prod-item", quantity: 1, name: displayTitle, photo: photoUrl, price: displayPrice, mrp: displayMrp }));
    toast(existingItem ? "Product quantity updated in cart" : "Product added to cart");
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();

    if (!session?.user) {
      toast.error("Please log in to add items to wishlist!");
      router.push("/auth/customer/login");
      return;
    }

    if (isAdmin) {
      toast.error("Admins cannot add products to wishlist! Please use a customer account.");
      return;
    }

    const targetId = id || "prod-item";
    if (isWishlisted) {
      dispatch(removeFromWishlist(targetId));
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

      const photoUrl = productImg || "/placeholder-product.png";
      dispatch(
        addToWishlist({
          id: targetId,
          name: displayTitle,
          price: displayPrice,
          mrp: displayMrp,
          photo: photoUrl,
        })
      );
      sendClientNotification({
        category: "Wishlist",
        title: "Added to Wishlist ❤️",
        message: `"${displayTitle}" has been added to your wishlist.`,
        link: "/dashboard/customer/wishlist",
      });
      toast.success("Added to wishlist!");
    }
  };

  return (
    <div
      className="group relative bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-300 flex flex-col cursor-pointer select-none"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Discount Badge */}
      {discountPercent > 0 && (
        <div className="absolute top-3 right-3 z-20 bg-rose-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-sm shadow-sm tracking-wide select-none">
          {discountPercent}% {t("off")}
        </div>
      )}

      {/* Product Image Area */}
      <Link href={`/products/${id}`} className="block">
        <div className="relative w-full aspect-square bg-[#f8f8fb] dark:bg-slate-800/60 flex items-center justify-center overflow-hidden">
          <Image
            src={productImg}
            alt={displayTitle || "Product Image"}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImageError(true)}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
            priority={false}
          />

          {/* Hover Action Buttons */}
          <div className={`absolute inset-x-0 bottom-0 flex items-center justify-center gap-1.5 pb-3 transition-all duration-300 ${hovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <button onClick={handleToggleCompare} className={`w-7 h-7 rounded-lg flex items-center justify-center shadow-md transition-all active:scale-95 cursor-pointer border ${isCompared ? "bg-black border-black text-white" : "bg-white border-slate-200 text-slate-600 hover:border-black hover:text-black"}`} title={isCompared ? "Remove from Compare" : "Add to Compare"} aria-label="Compare product">
              <GitCompare className="w-3.5 h-3.5 stroke-[2]" />
            </button>
            <button onClick={handleAddToCart} className="flex items-center gap-1.5 bg-black hover:bg-slate-800 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-md transition-all active:scale-95 cursor-pointer" title="Add to Cart">
              <ShoppingCart className="w-3 h-3" />
              {t("add_to_cart")}
            </button>
            <button onClick={handleWishlist} className={`w-7 h-7 rounded-lg flex items-center justify-center shadow-md transition-all active:scale-95 cursor-pointer border ${isWishlisted ? "bg-rose-500 border-rose-500 text-white" : "bg-white border-slate-200 text-slate-600 hover:border-rose-400 hover:text-rose-500"}`} title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}>
              <Heart className={`w-3.5 h-3.5 ${isWishlisted ? "fill-white" : ""}`} />
            </button>
          </div>
        </div>
      </Link>

      {/* Divider */}
      <div className="h-px bg-slate-100 dark:bg-slate-800 mx-3" />

      {/* Product Info */}
      <div className="px-3 py-3 flex flex-col gap-1.5 flex-1">
        <Link href={`/products/${id}`}>
          <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-200 line-clamp-2 leading-snug hover:text-black transition-colors min-h-[30px]">
            {displayTitle}
          </h3>
        </Link>
        <div className="flex items-center gap-1.5">
          <StarRating rating={ratingScore} />
          <span className="text-[10px] text-slate-400">({reviewCount})</span>
        </div>
        <div className="flex items-baseline gap-2 flex-wrap mt-0.5">
          {displayMrp && displayMrp > displayPrice && (
            <span className="text-xs text-slate-400 line-through font-normal">৳{displayMrp.toLocaleString()}</span>
          )}
          <span className="text-sm font-extrabold text-black dark:text-white">৳{displayPrice.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
