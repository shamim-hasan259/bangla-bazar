"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { addToCart } from "@/app/redux-store/Slice/CartSlice";
import { addToWishlist, removeFromWishlist } from "@/app/redux-store/Slice/WishlistSlice";
import { addToCompare, removeFromCompare } from "@/app/redux-store/Slice/CompareSlice";
import { RootState } from "@/app/redux-store/store";
import { IoCartOutline, IoBagCheckOutline } from "react-icons/io5";
import {
  Heart,
  Minus,
  Plus,
  Share2,
  GitCompare,
  Ruler,
  MessageSquare,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { sendClientNotification } from "@/lib/clientNotifications";

interface ProductActionsProps {
  product: any;
  selectedVariant: any;
  setSelectedVariant: React.Dispatch<React.SetStateAction<any>>;
}

const ProductActions: React.FC<ProductActionsProps> = ({
  product,
  selectedVariant,
  setSelectedVariant,
}) => {
  const { data: session } = useSession();
  const dispatch = useDispatch();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [currentUrl, setCurrentUrl] = useState("");

  const userRole = String(
    (session?.user as any)?.role || (session?.user as any)?.type || ""
  ).toLowerCase();
  const isAdmin = userRole === "admin" || userRole === "manager" || userRole === "stuff";
  const isCustomer = userRole === "customer";

  const isOwnProduct = React.useMemo(() => {
    if (!session?.user || !product) return false;
    const currentUserId = (session.user as any).id;
    const currentUserEmail = session.user.email;
    const currentUserPhone = (session.user as any).phone;

    if (product.sellerId && (product.sellerId === currentUserId || product.seller?.id === currentUserId)) {
      return true;
    }
    if (product.supplierId && product.supplierId === currentUserId) {
      return true;
    }
    if (product.store?.sellerId && product.store.sellerId === currentUserId) {
      return true;
    }
    if (currentUserEmail && (product.seller?.email === currentUserEmail || product.store?.email === currentUserEmail)) {
      return true;
    }
    if (currentUserPhone && (product.seller?.phone === currentUserPhone || product.store?.phone === currentUserPhone)) {
      return true;
    }
    return false;
  }, [session, product]);

  const viewTrackedRef = React.useRef<string | null>(null);

  const parsedVariants = React.useMemo(() => {
    if (product?.variantsList && product.variantsList.length > 0) {
      return {
        name: "Color / Size",
        options: product.variantsList.map((v: any) =>
          v.color && v.size ? `${v.color} / ${v.size}` : v.color || v.size || ""
        ),
        data: product.variantsList.map((v: any) => ({
          id: v.id,
          variantName: "Color / Size",
          color: v.color || "",
          size: v.size || "",
          optionValue: v.color && v.size ? `${v.color} / ${v.size}` : v.color || v.size || "",
          price: v.price,
          specialPrice: v.specialPrice,
          mrp: v.mrp,
          costPrice: v.costPrice,
          stock: v.stock,
          sku: v.sku,
          barcode: v.barcode,
          images: v.images,
          availability: v.availability,
        })),
      };
    }
    if (!product?.variants) return null;
    return typeof product.variants === "string"
      ? JSON.parse(product.variants)
      : product.variants;
  }, [product?.variants, product?.variantsList]);

  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  const isMultiDimension = React.useMemo(() => {
    if (!parsedVariants?.data || parsedVariants.data.length === 0) return false;
    return parsedVariants.data.some(
      (row: any) =>
        row.optionValue &&
        (row.optionValue.includes("/") || row.optionValue.includes(",") || row.optionValue.includes("-"))
    );
  }, [parsedVariants]);

  const dimensionsData = React.useMemo(() => {
    if (!isMultiDimension || !parsedVariants?.data) return null;

    const colorsSet = new Set<string>();
    const sizesSet = new Set<string>();
    const colorImages: Record<string, string> = {};

    parsedVariants.data.forEach((row: any) => {
      const parts = row.optionValue.split(/[/,-]+/).map((s: string) => s.trim());
      if (parts.length >= 2) {
        const color = parts[0];
        const size = parts[1];
        colorsSet.add(color);
        sizesSet.add(size);

        if (row.images && row.images.length > 0 && !colorImages[color]) {
          colorImages[color] = row.images[0];
        }
      }
    });

    return {
      colors: Array.from(colorsSet),
      sizes: Array.from(sizesSet),
      colorImages,
    };
  }, [isMultiDimension, parsedVariants]);

  useEffect(() => {
    if (selectedVariant && isMultiDimension) {
      const parts = selectedVariant.optionValue.split(/[/,-]+/).map((s: string) => s.trim());
      if (parts.length >= 2) {
        setSelectedColor(parts[0]);
        setSelectedSize(parts[1]);
      }
    }
  }, [selectedVariant, isMultiDimension]);

  const isSizeDisabled = (size: string) => {
    if (!selectedColor) return false;
    return !parsedVariants.data.some((row: any) => {
      const parts = row.optionValue.split(/[/,-]+/).map((s: string) => s.trim());
      return parts[0] === selectedColor && parts[1] === size && parseInt(row.stock) > 0 && row.availability !== false;
    });
  };

  const isColorDisabled = (color: string) => {
    if (!selectedSize) return false;
    return !parsedVariants.data.some((row: any) => {
      const parts = row.optionValue.split(/[/,-]+/).map((s: string) => s.trim());
      return parts[0] === color && parts[1] === selectedSize && parseInt(row.stock) > 0 && row.availability !== false;
    });
  };

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    if (selectedSize) {
      const match = parsedVariants.data.find((row: any) => {
        const parts = row.optionValue.split(/[/,-]+/).map((s: string) => s.trim());
        return parts[0] === color && parts[1] === selectedSize && parseInt(row.stock) > 0 && row.availability !== false;
      });
      if (match) {
        setSelectedVariant(match);
        return;
      }
    }

    const firstAvailable = parsedVariants.data.find((row: any) => {
      const parts = row.optionValue.split(/[/,-]+/).map((s: string) => s.trim());
      return parts[0] === color && parseInt(row.stock) > 0 && row.availability !== false;
    });
    if (firstAvailable) {
      const parts = firstAvailable.optionValue.split(/[/,-]+/).map((s: string) => s.trim());
      setSelectedSize(parts[1]);
      setSelectedVariant(firstAvailable);
    } else {
      const fallback = parsedVariants.data.find((row: any) => {
        const parts = row.optionValue.split(/[/,-]+/).map((s: string) => s.trim());
        return parts[0] === color;
      });
      if (fallback) {
        const parts = fallback.optionValue.split(/[/,-]+/).map((s: string) => s.trim());
        setSelectedSize(parts[1]);
        setSelectedVariant(fallback);
      }
    }
  };

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size);
    if (selectedColor) {
      const match = parsedVariants.data.find((row: any) => {
        const parts = row.optionValue.split(/[/,-]+/).map((s: string) => s.trim());
        return parts[0] === selectedColor && parts[1] === size && parseInt(row.stock) > 0 && row.availability !== false;
      });
      if (match) {
        setSelectedVariant(match);
        return;
      }
    }

    const firstAvailable = parsedVariants.data.find((row: any) => {
      const parts = row.optionValue.split(/[/,-]+/).map((s: string) => s.trim());
      return parts[1] === size && parseInt(row.stock) > 0 && row.availability !== false;
    });
    if (firstAvailable) {
      const parts = firstAvailable.optionValue.split(/[/,-]+/).map((s: string) => s.trim());
      setSelectedColor(parts[0]);
      setSelectedVariant(firstAvailable);
    } else {
      const fallback = parsedVariants.data.find((row: any) => {
        const parts = row.optionValue.split(/[/,-]+/).map((s: string) => s.trim());
        return parts[1] === size;
      });
      if (fallback) {
        const parts = fallback.optionValue.split(/[/,-]+/).map((s: string) => s.trim());
        setSelectedColor(parts[0]);
        setSelectedVariant(fallback);
      }
    }
  };

  const maxStock = selectedVariant
    ? parseInt(selectedVariant.stock) || 0
    : product?.availableQty || product?.stock || 300;

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentUrl(window.location.href);
    }

    if (product?.id && viewTrackedRef.current !== product.id) {
      viewTrackedRef.current = product.id;
      fetch("/api/analytics/track", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventType: "PRODUCT_VIEW",
          productId: product.id,
          sellerId: product.sellerId || product.supplierId || undefined,
        }),
      }).catch((err) => console.error("Analytics tracking failed:", err));
    }
  }, [product]);

  useEffect(() => {
    if (quantity > maxStock && maxStock > 0) {
      setQuantity(Math.max(1, maxStock));
    }
  }, [selectedVariant, maxStock]);

  const [showSizeGuide, setShowSizeGuide] = useState(false);

  const handleMessageSeller = () => {
    if (!session?.user) {
      toast.error("Please log in as a customer to message the seller!");
      router.push("/auth/customer/login");
      return;
    }

    if (isAdmin) {
      toast.error("Message seller feature is only for customers!");
      return;
    }

    const storeId = product?.store?.id || product?.storeId;
    if (!storeId) {
      toast.error("Cannot identify seller store for this product.");
      return;
    }

    // Direct routing to customer dashboard chat
    router.push(
      `/dashboard/customer/chat?storeId=${storeId}${
        product?.id ? `&productId=${product.id}` : ""
      }`
    );
  };

  const wishlistItems = useSelector((state: RootState) => state.wishlist.items);
  const isWishlisted = wishlistItems.some((item) => item.id === product?.id);

  const compareItems = useSelector((state: RootState) => state.compare?.items || []);
  const isCompared = compareItems.some((item) => item.id === product?.id);

  const getPhotoUrl = () => {
    let photoUrl = "/placeholder-product.png";
    const photo = product?.photo;
    if (Array.isArray(photo) && photo.length > 0) {
      photoUrl = photo[0];
    } else if (typeof photo === "string" && photo.trim() !== "") {
      photoUrl = photo;
    }
    return photoUrl;
  };

  const handleToggleCompare = () => {
    if (!session?.user) {
      toast.error("Please log in to compare products!");
      router.push("/auth/customer/login");
      return;
    }

    if (isAdmin) {
      toast.error("Admins cannot compare products!");
      return;
    }

    if (isCompared) {
      dispatch(removeFromCompare(product?.id));
      toast.success("Removed from compare list");
    } else {
      if (compareItems.length >= 4) {
        toast.error("You can compare up to 4 products at a time");
        return;
      }
      dispatch(
        addToCompare({
          id: product?.id,
          name: product?.name,
          price: product?.price,
          mrp: product?.mrp,
          photo: getPhotoUrl(),
          brand: product?.brand,
          category: product?.category,
          stock: product?.stock,
        })
      );
      toast.success("Added to compare list");
    }
  };

  const handleToggleWishlist = () => {
    if (!session?.user) {
      toast.error("Please log in to add items to wishlist!");
      router.push("/auth/customer/login");
      return;
    }

    if (isAdmin) {
      toast.error("Admins cannot add products to wishlist!");
      return;
    }

    if (isWishlisted) {
      dispatch(removeFromWishlist(product?.id));
      toast.success("Removed from wishlist");
    } else {
      if (isOwnProduct) {
        toast.error("You cannot add your own product to wishlist!");
        return;
      }
      dispatch(
        addToWishlist({
          id: product?.id,
          name: product?.name,
          photo: getPhotoUrl(),
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

  // Pricing calculations
  const now = new Date();
  const isPromoActive =
    product?.promoPrice &&
    product?.promoPrice > 0 &&
    (!product?.promoStart || new Date(product?.promoStart) <= now) &&
    (!product?.promoEnd || new Date(product?.promoEnd) >= now);

  const basePrice = selectedVariant ? parseFloat(selectedVariant.price) : product?.price || 0;
  const basePromoPrice = selectedVariant
    ? selectedVariant.specialPrice
      ? parseFloat(selectedVariant.specialPrice)
      : null
    : isPromoActive
    ? product?.promoPrice
    : null;
  const baseMrp = selectedVariant
    ? selectedVariant.mrp
      ? parseFloat(selectedVariant.mrp)
      : parseFloat(selectedVariant.price)
    : product?.mrp || (product?.price ? product.price * 1.2 : 0);

  const effectivePrice = basePromoPrice || basePrice;
  const regularPrice = basePromoPrice ? (baseMrp > basePrice ? baseMrp : basePrice) : (baseMrp || basePrice);
  const totalPrice = (effectivePrice * quantity).toFixed(2);

  const handleAddToCart = (silent = false) => {
    if (!session?.user) {
      toast.error("Please log in to add items to cart!");
      router.push("/auth/customer/login");
      return;
    }

    if (isAdmin) {
      toast.error("Admins cannot add products to cart!");
      return;
    }

    if (isOwnProduct) {
      toast.error("You cannot order or add your own product to cart!");
      return;
    }

    const itemId = selectedVariant
      ? `${product?.id}_${selectedVariant.variantName}:${selectedVariant.optionValue}`
      : product?.id;

    const itemName = selectedVariant
      ? `${product?.name} (${selectedVariant.variantName}: ${selectedVariant.optionValue})`
      : product?.name;

    const itemPrice = effectivePrice;
    const itemMrp = regularPrice;
    const itemPhoto =
      selectedVariant && selectedVariant.images && selectedVariant.images.length > 0
        ? selectedVariant.images[0]
        : getPhotoUrl();

    for (let i = 0; i < quantity; i++) {
      dispatch(
        addToCart({
          id: itemId,
          productId: product?.id,
          variantId: selectedVariant?.id || undefined,
          quantity: 1,
          name: itemName,
          photo: itemPhoto,
          price: itemPrice,
          mrp: itemMrp,
        })
      );
    }

    if (product?.id) {
      fetch("/api/analytics/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType: "ADD_TO_CART",
          productId: product.id,
          sellerId: product.sellerId || product.supplierId || undefined,
        }),
      }).catch((err) => console.error("Analytics tracking failed:", err));
    }

    sendClientNotification({
      category: "System",
      title: "Added to Cart 🛒",
      message: `${quantity}x "${itemName}" added to your cart.`,
      link: "/cart",
    });

    if (!silent) {
      toast.success("Added to cart!");
    }
  };

  const handleBuyNow = () => {
    if (!session?.user) {
      toast.error("Please log in to complete purchase!");
      router.push("/auth/customer/login");
      return;
    }

    if (isAdmin) {
      toast.error("Admins cannot order products!");
      return;
    }

    if (isOwnProduct) {
      toast.error("You cannot order your own product!");
      return;
    }

    handleAddToCart(true);
    router.push("/checkout");
  };

  const decrementQty = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const incrementQty = () => {
    if (quantity < maxStock) {
      setQuantity(quantity + 1);
    }
  };

  const storeName = product?.store?.storeNameEn || product?.seller?.name || "ABC SHOP";

  // WhatsApp Order Setup
  const waItemName = selectedVariant
    ? `${product?.name} (${selectedVariant.variantName}: ${selectedVariant.optionValue})`
    : product?.name || "Product";
  const whatsappNumber = "8801780566585";
  const messageText = `❖ অর্ডার করতে চাই:
পণ্য: ${waItemName}
দাম: ৳${effectivePrice}
পরিমাণ: ${quantity}
মোট দাম: ৳${totalPrice}
লিংক: ${currentUrl}

দয়া করে অর্ডার কনফার্ম করুন।`;
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(messageText)}`;

  return (
    <div className="space-y-4 text-xs">
      {/* 1. Sold By, Message Seller, Wishlist, Compare Row */}
      <div className="flex items-center justify-between flex-wrap gap-2 pb-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#fed700] text-slate-900 text-[11px] font-bold px-2 py-0.5 rounded shadow-2xs">
            Sold by
          </div>
          <span className="font-extrabold text-slate-800 dark:text-slate-100 uppercase text-xs tracking-tight">
            {storeName}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Message Seller Button -> Direct Dashboard Routing */}
          <button
            onClick={handleMessageSeller}
            className="h-7 px-2.5 bg-[#e11d48] hover:bg-[#be123c] text-white text-[11px] font-bold rounded flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
          >
            <MessageSquare className="w-3 h-3" />
            <span>Message Seller</span>
          </button>

          {/* Wishlist Heart with "Save" */}
          <button
            onClick={handleToggleWishlist}
            className={`h-7 px-2 border rounded flex items-center gap-1 text-[11px] font-medium transition-colors cursor-pointer ${
              isWishlisted
                ? "bg-rose-50 border-rose-200 text-[#e11d48]"
                : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-400 bg-white dark:bg-slate-900"
            }`}
            title="Save to Wishlist"
          >
            <Heart className={`w-3.5 h-3.5 ${isWishlisted ? "fill-[#e11d48]" : ""}`} />
            <span>Save</span>
          </button>

          {/* Compare Button */}
          <button
            onClick={handleToggleCompare}
            className={`h-7 w-7 border rounded flex items-center justify-center transition-colors cursor-pointer ${
              isCompared
                ? "bg-blue-50 border-blue-200 text-blue-600"
                : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-400 bg-white dark:bg-slate-900"
            }`}
            title="Compare Product"
          >
            <GitCompare className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Price & Offer Price Row */}
      <div className="space-y-1 py-1">
        {regularPrice > effectivePrice && (
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium">
            <span>Price :</span>
            <span className="line-through">৳{regularPrice.toFixed(2)}/pc</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-700 dark:text-slate-300">Offer Price :</span>
          <span className="text-[#e11d48] font-black text-base sm:text-lg">
            ৳ {effectivePrice.toFixed(2)}<span className="text-xs font-semibold">/pc</span>
          </span>
        </div>
      </div>

      {/* 3. Color Selection */}
      {dimensionsData && dimensionsData.colors.length > 0 ? (
        <div className="flex items-center gap-3 py-1">
          <span className="font-bold text-slate-700 dark:text-slate-300 min-w-[50px]">
            Color :
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            {dimensionsData.colors.map((color) => {
              const isSelected = selectedColor === color;
              const disabled = isColorDisabled(color);
              const thumbnail = dimensionsData.colorImages[color] || getPhotoUrl();

              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => !disabled && handleColorSelect(color)}
                  disabled={disabled}
                  className={`w-10 h-10 rounded border-2 p-0.5 bg-white dark:bg-slate-900 transition-all cursor-pointer relative overflow-hidden ${
                    isSelected
                      ? "border-[#2563eb] shadow-sm"
                      : disabled
                      ? "opacity-40 cursor-not-allowed border-slate-200"
                      : "border-slate-200 dark:border-slate-700 hover:border-slate-400"
                  }`}
                  title={color}
                >
                  <img src={thumbnail} alt={color} className="w-full h-full object-contain" />
                </button>
              );
            })}
          </div>
        </div>
      ) : parsedVariants?.data && parsedVariants.data.length > 0 ? (
        <div className="flex items-center gap-3 py-1">
          <span className="font-bold text-slate-700 dark:text-slate-300 min-w-[50px]">
            Option :
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            {parsedVariants.data.map((row: any) => {
              const isSelected = selectedVariant?.optionValue === row.optionValue;
              const isOutOfStock = parseInt(row.stock) <= 0 || row.availability === false;
              return (
                <button
                  key={row.optionValue}
                  type="button"
                  onClick={() => !isOutOfStock && setSelectedVariant(row)}
                  disabled={isOutOfStock}
                  className={`px-2.5 py-1 text-xs font-bold rounded border transition-all cursor-pointer ${
                    isSelected
                      ? "border-[#2563eb] bg-blue-50 text-[#2563eb] dark:bg-blue-950/40"
                      : isOutOfStock
                      ? "border-slate-200 text-slate-300 line-through cursor-not-allowed"
                      : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400 bg-white dark:bg-slate-900"
                  }`}
                >
                  {row.optionValue}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* 4. Size Selection */}
      {dimensionsData && dimensionsData.sizes.length > 0 && (
        <div className="flex items-center gap-3 py-1">
          <span className="font-bold text-slate-700 dark:text-slate-300 min-w-[50px]">
            Size :
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            {dimensionsData.sizes.map((size) => {
              const isSelected = selectedSize === size;
              const disabled = isSizeDisabled(size);

              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => !disabled && handleSizeSelect(size)}
                  disabled={disabled}
                  className={`w-9 h-7 rounded border text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#e11d48] text-white border-[#e11d48] shadow-2xs"
                      : disabled
                      ? "border-slate-200 text-slate-300 line-through cursor-not-allowed"
                      : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400 bg-white dark:bg-slate-900"
                  }`}
                >
                  {size}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => setShowSizeGuide(true)}
              className="ml-2 flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              <Ruler className="w-3 h-3" />
              <span>Guide</span>
            </button>
          </div>
        </div>
      )}

      {/* 5. Quantity Selection & Available Stock */}
      <div className="flex items-center gap-3 py-1">
        <span className="font-bold text-slate-700 dark:text-slate-300 min-w-[50px]">
          Quantity :
        </span>
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center border border-slate-200 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-800">
            <button
              onClick={decrementQty}
              disabled={quantity <= 1}
              className="w-7 h-7 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-8 text-center font-bold text-[#e11d48] text-xs">
              {quantity < 10 ? `0${quantity}` : quantity}
            </span>
            <button
              onClick={incrementQty}
              disabled={quantity >= maxStock}
              className="w-7 h-7 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          <span className="text-slate-500 dark:text-slate-400 text-xs">
            ({maxStock > 0 ? `${maxStock} Available` : "Out of Stock"})
          </span>
        </div>
      </div>

      {/* 6. Total Price */}
      <div className="flex items-center gap-2 py-1">
        <span className="font-bold text-slate-700 dark:text-slate-300">Total Price :</span>
        <span className="text-[#e11d48] font-black text-sm sm:text-base">
          ৳{totalPrice}
        </span>
      </div>

      {/* 7. Action CTA Buttons (Add to Cart + Buy Now) */}
      <div className="space-y-2.5 pt-2">
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleAddToCart()}
            className="flex-1 h-10 bg-[#fed700] hover:bg-[#facc15] text-slate-900 font-bold rounded-md flex items-center justify-center gap-2 transition-all shadow-2xs cursor-pointer active:scale-[0.99]"
          >
            <IoCartOutline className="w-4 h-4" />
            <span>Add to cart</span>
          </button>

          <button
            onClick={handleBuyNow}
            className="flex-1 h-10 bg-[#e11d48] hover:bg-[#be123c] text-white font-bold rounded-md flex items-center justify-center gap-2 transition-all shadow-2xs cursor-pointer active:scale-[0.99]"
          >
            <IoBagCheckOutline className="w-4 h-4" />
            <span>Buy Now</span>
          </button>
        </div>

        {/* WhatsApp Fast Order Button with full functionality */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => {
            if (isAdmin) {
              e.preventDefault();
              toast.error("Admins cannot order products!");
            }
          }}
          className="w-full h-10 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs rounded-md flex items-center justify-center gap-2 transition-all shadow-2xs cursor-pointer active:scale-[0.99]"
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.62.963 3.41 1.47 5.259 1.471 5.53 0 10.029-4.505 10.03-10.034.002-2.68-1.038-5.197-2.93-7.092-1.892-1.893-4.41-2.934-7.096-2.934-5.533 0-10.03 4.505-10.034 10.037-.002 1.884.492 3.73 1.431 5.358L2.247 21.8l4.4-1.646zm11.716-5.885c-.326-.163-1.927-.951-2.223-1.059-.297-.109-.513-.163-.73.163-.216.325-.838 1.059-1.026 1.275-.189.217-.378.244-.704.082-.326-.163-1.377-.508-2.624-1.622-.969-.865-1.624-1.933-1.813-2.259-.189-.325-.02-.501.142-.663.146-.145.326-.379.488-.569.163-.189.217-.325.326-.541.109-.217.054-.407-.027-.57-.081-.162-.73-1.761-1.002-2.414-.265-.636-.532-.55-.73-.56-.189-.01-.406-.011-.623-.011-.217 0-.569.081-.867.407-.297.325-1.137 1.112-1.137 2.71 0 1.599 1.164 3.142 1.326 3.358.163.217 2.291 3.498 5.55 4.9.775.333 1.38.533 1.852.684.779.248 1.488.213 2.048.129.624-.093 1.927-.787 2.197-1.547.271-.76.271-1.41.19-1.547-.082-.136-.297-.217-.622-.38z" />
          </svg>
          <span>WhatsApp এ অর্ডার করুন</span>
        </a>
      </div>

      {/* 8. Refund / Policy Row & Share */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px]">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-600 dark:text-slate-400">Refund :</span>
          <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 px-2 py-0.5 rounded text-amber-800 dark:text-amber-300">
            <RotateCcw className="w-3 h-3 text-amber-600" />
            <span className="font-bold">7 Days Returns</span>
          </div>
          <span className="text-slate-400 dark:text-slate-500 hidden sm:inline">
            Change of mind is not applicable
          </span>
        </div>

        <button
          onClick={() => {
            navigator.clipboard?.writeText(window.location.href);
            toast.success("Link copied to clipboard!");
          }}
          className="w-7 h-7 rounded bg-[#e11d48] hover:bg-[#be123c] text-white flex items-center justify-center transition-colors shadow-2xs cursor-pointer shrink-0"
          title="Share Product"
        >
          <Share2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Size Guide Modal */}
      {showSizeGuide && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl animate-in fade-in-50 zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Ruler className="w-4 h-4 text-[#e11d48]" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Size Guide</h3>
              </div>
              <button
                onClick={() => setShowSizeGuide(false)}
                className="text-slate-400 hover:text-black dark:hover:text-white text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    <th className="py-2 px-3 rounded-l-lg">Size</th>
                    <th className="py-2 px-3">Chest (in)</th>
                    <th className="py-2 px-3">Length (in)</th>
                    <th className="py-2 px-3 rounded-r-lg">Waist (in)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                  <tr>
                    <td className="py-2 px-3 font-bold">S</td>
                    <td className="py-2 px-3">36 - 38</td>
                    <td className="py-2 px-3">27</td>
                    <td className="py-2 px-3">28 - 30</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-bold">M</td>
                    <td className="py-2 px-3">38 - 40</td>
                    <td className="py-2 px-3">28</td>
                    <td className="py-2 px-3">30 - 32</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-bold">L</td>
                    <td className="py-2 px-3">40 - 42</td>
                    <td className="py-2 px-3">29</td>
                    <td className="py-2 px-3">32 - 34</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-bold">XL</td>
                    <td className="py-2 px-3">42 - 44</td>
                    <td className="py-2 px-3">30</td>
                    <td className="py-2 px-3">34 - 36</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-bold">XXL</td>
                    <td className="py-2 px-3">44 - 46</td>
                    <td className="py-2 px-3">31</td>
                    <td className="py-2 px-3">36 - 38</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <button
              onClick={() => setShowSizeGuide(false)}
              className="w-full py-2 bg-[#e11d48] text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductActions;
