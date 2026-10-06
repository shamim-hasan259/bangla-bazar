"use client";

import React, { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
  onImageClick?: (url: string) => void;
}

const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({
  images,
  productName,
  onImageClick,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZooming, setIsZooming] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [lensPosition, setLensPosition] = useState({ x: 0, y: 0 });

  const imageContainerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const ZOOM_LEVEL = 2.5;
  const LENS_SIZE = 140;

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!imageContainerRef.current) return;

      const rect = imageContainerRef.current.getBoundingClientRect();

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const xPercent = (x / rect.width) * 100;
      const yPercent = (y / rect.height) * 100;

      const lensX = Math.max(
        LENS_SIZE / 2,
        Math.min(x, rect.width - LENS_SIZE / 2)
      );

      const lensY = Math.max(
        LENS_SIZE / 2,
        Math.min(y, rect.height - LENS_SIZE / 2)
      );

      setZoomPosition({ x: xPercent, y: yPercent });
      setLensPosition({ x: lensX, y: lensY });
    },
    []
  );

  const handleMouseEnter = () => setIsZooming(true);
  const handleMouseLeave = () => setIsZooming(false);

  const isValidUrl = (url: any): boolean => {
    if (typeof url !== "string") return false;
    const trimmed = url.trim();
    if (trimmed === "") return false;
    return (
      trimmed.startsWith("/") ||
      trimmed.startsWith("http://") ||
      trimmed.startsWith("https://")
    );
  };

  const validImages = images.filter(isValidUrl);
  const currentImage = validImages[selectedIndex] || "/placeholder-product.png";

  const handlePrev = () => {
    if (validImages.length <= 1) return;
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : validImages.length - 1));
  };

  const handleNext = () => {
    if (validImages.length <= 1) return;
    setSelectedIndex((prev) => (prev < validImages.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Main Image Container */}
      <div className="relative w-full">
        <div
          ref={imageContainerRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="relative w-full aspect-square overflow-hidden rounded-xl border border-slate-150 dark:border-slate-800 bg-[#fdfdfd] dark:bg-slate-900/60 flex items-center justify-center cursor-crosshair max-md:cursor-default shadow-2xs"
        >
          <Image
            src={currentImage}
            alt={productName}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 500px"
            className="object-contain p-4 transition-transform duration-300 hover:scale-105"
          />

          {/* Lens */}
          {isZooming && (
            <div
              className="absolute z-10 pointer-events-none border-2 border-slate-800 dark:border-white bg-white/20 backdrop-blur-[1px] max-md:hidden rounded-lg shadow-sm"
              style={{
                width: LENS_SIZE,
                height: LENS_SIZE,
                left: lensPosition.x - LENS_SIZE / 2,
                top: lensPosition.y - LENS_SIZE / 2,
              }}
            />
          )}
        </div>

        {/* Zoom Panel */}
        {isZooming && (
          <div
            className="absolute top-0 left-[calc(100%+16px)] z-[100] hidden h-[450px] w-[450px] rounded-2xl border border-slate-200 dark:border-slate-800 bg-white bg-no-repeat shadow-2xl md:block overflow-hidden"
            style={{
              backgroundImage: `url(${currentImage})`,
              backgroundSize: `${ZOOM_LEVEL * 100}%`,
              backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
            }}
          />
        )}
      </div>

      {/* Thumbnails Row with navigation */}
      {validImages.length > 1 && (
        <div className="relative flex items-center gap-1.5 justify-center">
          <button
            type="button"
            onClick={handlePrev}
            className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div
            ref={scrollContainerRef}
            className="flex items-center gap-2 overflow-x-auto py-1 px-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {validImages.map((img, index) => {
              const isSelected = index === selectedIndex;
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    setSelectedIndex(index);
                    if (onImageClick) {
                      onImageClick(img);
                    }
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`relative w-12 h-12 rounded border-2 transition-all duration-150 cursor-pointer shrink-0 p-0.5 bg-white dark:bg-slate-900 ${
                    isSelected
                      ? "border-[#2563eb] shadow-2xs scale-105"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-400 opacity-80 hover:opacity-100"
                  }`}
                >
                  <div className="relative w-full h-full">
                    <Image
                      src={img}
                      alt={`${productName} - ${index + 1}`}
                      fill
                      sizes="48px"
                      className="object-contain"
                    />
                  </div>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleNext}
            className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
            aria-label="Next image"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductImageGallery;