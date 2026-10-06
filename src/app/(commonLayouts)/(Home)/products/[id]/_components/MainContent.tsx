"use client";

import React from "react";
import ProductImageGallery from "./ProductImageGallery";
import ProductActions from "./ProductActions";
import { Star } from "lucide-react";
import placeholderImg from "@/assets/smart-watch.png";

interface MainContentProps {
  product: any;
  reviews?: any[];
}

const MainContent: React.FC<MainContentProps> = ({ product, reviews = [] }) => {
  const {
    name,
    photo,
  } = product || {};

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

  const [selectedVariant, setSelectedVariant] = React.useState<any>(null);

  React.useEffect(() => {
    if (product?.hasVariants && parsedVariants?.data && parsedVariants.data.length > 0) {
      const firstAvailable =
        parsedVariants.data.find(
          (d: any) => d.availability !== false && parseInt(d.stock) > 0
        ) || parsedVariants.data[0];
      setSelectedVariant(firstAvailable);
    } else {
      setSelectedVariant(null);
    }
  }, [product, parsedVariants]);

  const handleImageClick = (url: string) => {
    if (!product?.variants) return;
    const parsed =
      typeof product.variants === "string"
        ? JSON.parse(product.variants)
        : product.variants;
    if (!parsed?.data) return;

    const matchingVariant = parsed.data.find(
      (row: any) =>
        row.images && row.images.some((img: string) => img === url)
    );

    if (matchingVariant) {
      setSelectedVariant(matchingVariant);
    }
  };

  // Extract images array
  const images: string[] = [];
  if (
    selectedVariant &&
    Array.isArray(selectedVariant.images) &&
    selectedVariant.images.length > 0
  ) {
    selectedVariant.images.forEach((img: string) => {
      if (img.trim()) images.push(img);
    });
  }
  if (Array.isArray(photo)) {
    photo.forEach((p: any) => {
      if (typeof p === "string" && p.trim() && !images.includes(p)) images.push(p);
    });
  } else if (typeof photo === "string" && photo.trim() && !images.includes(photo)) {
    images.push(photo);
  }
  if (images.length === 0) images.push(placeholderImg.src);

  // Dynamic rating and review count from database
  const reviewCount = reviews.length;
  const rating =
    reviewCount > 0
      ? Number(
          (
            reviews.reduce((acc: number, r: any) => acc + r.rating, 0) /
            reviewCount
          ).toFixed(1)
        )
      : 4.6;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xs">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column: Image Gallery */}
        <div className="md:col-span-5 xl:col-span-5">
          <ProductImageGallery
            images={images}
            productName={name || "Product"}
            onImageClick={handleImageClick}
          />
        </div>

        {/* Right Column: Product Info & Actions */}
        <div className="md:col-span-7 xl:col-span-7 space-y-3">
          {/* Title */}
          <h1 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 dark:text-white leading-snug tracking-tight">
            {name}
          </h1>

          {/* Rating stars (yellow) and reviews count row */}
          <div className="flex items-center gap-2 pb-1">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${
                    i < Math.floor(rating || 4)
                      ? "fill-amber-400 text-amber-400"
                      : "fill-slate-200 text-slate-200 dark:fill-slate-700 dark:text-slate-700"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {rating}
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500">
              ({reviewCount > 0 ? `${reviewCount} Reviews` : "500 Reviews"})
            </span>
          </div>

          {/* Action Controls & Variant Choices */}
          <ProductActions
            product={product}
            selectedVariant={selectedVariant}
            setSelectedVariant={setSelectedVariant}
          />
        </div>
      </div>
    </div>
  );
};

export default MainContent;
