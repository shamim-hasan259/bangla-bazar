"use client";

import React, { useState } from "react";
import Image, { ImageProps } from "next/image";
import watch__img from "@/assets/smart-watch.png";

interface ProductImageProps extends Omit<ImageProps, 'src' | 'onError'> {
    src: string | string[] | null | undefined;
    fallbackSrc?: string | any;
}

/**
 * ProductImage Component with Fallback Handling
 * 
 * A robust image component that handles:
 * - Missing or empty image URLs
 * - Failed image loads
 * - Array of image URLs (uses first valid one)
 * - Automatic fallback to placeholder
 * 
 * @example
 * <ProductImage 
 *   src={product.photo} 
 *   alt="Product" 
 *   fill 
 *   className="object-cover"
 * />
 */
const ProductImage: React.FC<ProductImageProps> = ({
    src,
    fallbackSrc = watch__img,
    alt = "Product Image",
    ...props
}) => {
    const [imageError, setImageError] = useState(false);

    /**
     * Extract valid image URL from various input formats
     */
    const getValidImageSrc = (): string | any => {
        // If image already failed, return fallback
        if (imageError) return fallbackSrc;

        // Handle null or undefined
        if (!src) return fallbackSrc;

        // Handle array of photos
        if (Array.isArray(src)) {
            if (src.length === 0) return fallbackSrc;

            const firstPhoto = src[0];
            // Check if the photo URL is valid (not empty string)
            if (typeof firstPhoto === 'string' && firstPhoto.trim() !== '') {
                return firstPhoto;
            }
            return fallbackSrc;
        }

        // Handle string photo
        if (typeof src === 'string') {
            if (src.trim() === '') return fallbackSrc;
            return src;
        }

        // Fallback for any other type
        return fallbackSrc;
    };

    const imageSrc = getValidImageSrc();

    /**
     * Handle image load error by setting error state
     * This triggers a re-render with the fallback image
     */
    const handleImageError = () => {
        if (!imageError) {
            setImageError(true);
        }
    };

    return (
        <Image
            {...props}
            src={imageSrc}
            alt={alt}
            onError={handleImageError}
        />
    );
};

export default ProductImage;
