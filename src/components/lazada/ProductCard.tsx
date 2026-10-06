"use client";

import React, { useState } from 'react';
import { Star, ShoppingCart, GitCompare } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { useSession } from 'next-auth/react';
import { RootState } from '@/app/redux-store/store';
import { addToCart } from '@/app/redux-store/Slice/CartSlice';
import { addToCompare, removeFromCompare } from '@/app/redux-store/Slice/CompareSlice';
import { toast } from 'sonner';

import headphoneImg from "@/assets/banner/headphone.png";
import watchesImg from "@/assets/banner/watches.png";
import techBundleImg from "@/assets/banner/tech_bundle.png";
import electronicsImg from "@/assets/categories/electronics.png";
import fashionImg from "@/assets/categories/fashion.png";
import beautyImg from "@/assets/categories/beauty.png";
import laptopsImg from "@/assets/categories/laptops.png";
import watch__img from "@/assets/smart-watch.png";

const DIVERSE_FALLBACK_IMAGES = [
  techBundleImg.src,  // Power Bank / Tech Gadgets
  electronicsImg.src, // Audio / Earphones
  headphoneImg.src,   // Over-ear Headphones
  watchesImg.src,     // Luxury Watches
  fashionImg.src,     // Sneakers / Accessories
  beautyImg.src,      // Beauty / Perfume
  laptopsImg.src,     // Laptops
  watch__img.src,     // Smartwatches
];

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    mrp?: number | null;
    photo: any;
    rating?: number;
    reviews?: number;
    sellerId?: string;
    seller?: {
      id?: string;
      email?: string;
      phone?: string;
    };
    store?: {
      sellerId?: string;
      email?: string;
      phone?: string;
    };
  };
  showProgress?: boolean;
  soldCount?: number;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { data: session } = useSession();
  const dispatch = useDispatch();
  const cartItems = useSelector((state: RootState) => state.cart?.items || []);
  const compareItems = useSelector((state: RootState) => state.compare?.items || []);
  const [imageError, setImageError] = useState(false);

  const getFallbackImage = () => {
    const key = String(product.id || product.name || "prod");
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      hash = key.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % DIVERSE_FALLBACK_IMAGES.length;
    return DIVERSE_FALLBACK_IMAGES[index];
  };

  const router = useRouter();
  const fallbackUrl = getFallbackImage();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session?.user) {
      toast.error("Please log in to add items to cart!");
      router.push("/auth/customer/login");
      return;
    }

    const userRole = String(
      (session?.user as any)?.role || (session?.user as any)?.type || ""
    ).toLowerCase();
    const isAdmin = ["admin", "manager", "stuff", "sales", "marketing"].includes(userRole);

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

    const existingItem = cartItems.find((item) => item.id === product.id);

    let photoUrl = fallbackUrl;
    if (Array.isArray(product.photo) && product.photo.length > 0 && typeof product.photo[0] === "string") {
      photoUrl = product.photo[0];
    } else if (typeof product.photo === "string" && product.photo.trim() !== "") {
      photoUrl = product.photo;
    }

    dispatch(
      addToCart({
        id: product.id,
        quantity: 1,
        name: product.name || "Product",
        photo: photoUrl,
        price: product.price,
        mrp: product.mrp ?? undefined,
      })
    );

    if (existingItem) {
      toast("Product quantity updated in cart");
    } else {
      toast.success("Product added to cart");
    }
  };

  let imageUrl = fallbackUrl;
  if (!imageError && product.photo) {
    if (Array.isArray(product.photo) && product.photo.length > 0) {
      const p = product.photo[0];
      if (typeof p === 'string' && p.trim() !== '' && !p.includes('placeholder')) {
        imageUrl = p;
      }
    } else if (typeof product.photo === 'string' && product.photo.trim() !== '' && !product.photo.includes('placeholder')) {
      imageUrl = product.photo;
    }
  }

  const discountText = product.mrp && product.mrp > product.price
    ? `${Math.round(((product.mrp - product.price) / product.mrp) * 100)}% off`
    : "6% off";

  const ratingScore = "4.5";
  const reviewCount = "21k";

  const isCompared = compareItems.some((item) => item.id === product.id);

  const handleToggleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session?.user) {
      toast.error("Please log in to compare products!");
      router.push("/auth/customer/login");
      return;
    }

    if (isCompared) {
      dispatch(removeFromCompare(product.id));
      toast("Removed from compare list");
    } else {
      if (compareItems.length >= 4) {
        toast.error("You can compare up to 4 products at a time");
        return;
      }
      dispatch(
        addToCompare({
          id: product.id,
          name: product.name || "Product",
          price: product.price,
          mrp: product.mrp || undefined,
          photo: imageUrl,
        })
      );
      toast.success("Added to compare list");
    }
  };

  return (
    <Link
      href={`/products/${product.id}`}
      className="group flex flex-col justify-between h-full bg-transparent select-none transition-all duration-300"
    >
      {/* Top Image Container Wrapper */}
      <div className="relative w-full aspect-square">
        {/* Floating Compare Button */}
        <button
          onClick={handleToggleCompare}
          className={`absolute top-2 left-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-200 z-20 cursor-pointer shadow-xs border ${
            isCompared
              ? "bg-[#2563eb] text-white border-[#2563eb]"
              : "bg-white/90 dark:bg-slate-800/90 text-slate-500 dark:text-slate-300 border-slate-200/80 dark:border-slate-700 hover:text-[#2563eb] hover:bg-white hover:border-[#2563eb]"
          }`}
          title={isCompared ? "Remove from Compare" : "Add to Compare"}
          aria-label="Compare product"
        >
          <GitCompare className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2]" />
        </button>
        {/* Light Gray Box with Radial Mask Creating Concave Corner Cutout */}
        {/* Light Off-White Box with Corner Concave Cutout */}
        <div
          className="w-full h-full bg-[#f4f4f6] dark:bg-slate-800/60 rounded-[22px] flex items-center justify-center relative overflow-hidden"
          style={{
            maskImage: "radial-gradient(circle 28px at 100% 100%, transparent 27px, black 28px)",
            WebkitMaskImage: "radial-gradient(circle 28px at 100% 100%, transparent 27px, black 28px)"
          }}
        >
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImageError(true)}
          />
        </div>

        {/* White Socket Wrapper + Cart Button Positioned Inside Concave Corner Cutout */}
        <div className="absolute -bottom-1 -right-1 p-0.5 sm:p-1 bg-white dark:bg-slate-900 rounded-full z-10 shadow-xs">
          <button
            onClick={handleAddToCart}
            className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer"
            title="Add to Cart"
          >
            <ShoppingCart className="w-4 h-4 text-white stroke-[2.2]" />
          </button>
        </div>
      </div>

      {/* Product Details Content Below Image Container */}
      <div className="pt-3 sm:pt-3.5 pb-1 px-0.5 flex flex-col gap-1">
        {/* Rating Line */}
        <div className="flex items-center gap-1 text-xs">
          <Star className="w-3.5 h-3.5 text-[#ffb800] fill-[#ffb800]" />
          <span className="font-semibold text-slate-700 dark:text-slate-300 text-xs">
            {ratingScore}
          </span>
          <span className="text-slate-400 text-xs font-normal">
            ({reviewCount})
          </span>
        </div>

        {/* Product Title */}
        <h3 className="font-bold text-xs sm:text-sm text-[#1e1e38] dark:text-slate-100 group-hover:text-blue-600 transition-colors line-clamp-1">
          {product.name}
        </h3>

        {/* Pricing Row */}
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className="text-sm sm:text-base font-extrabold text-[#111111] dark:text-white">
            ৳{product.price}
          </span>
          {product.mrp && product.mrp > product.price ? (
            <>
              <span className="text-xs text-[#999999] line-through font-normal">
                ৳{product.mrp}
              </span>
              <span className="text-xs text-[#777777] font-normal">
                {discountText}
              </span>
            </>
          ) : (
            <>
              <span className="text-xs text-[#999999] line-through font-normal">
                ৳{Math.round(product.price * 1.15)}
              </span>
              <span className="text-xs text-[#777777] font-normal">
                6% off
              </span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
