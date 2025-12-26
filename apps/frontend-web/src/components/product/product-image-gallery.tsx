"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { ZoomIn } from "lucide-react";
import ObjectCustomizer from "@/components/object-customizer/ObjectCustomizer";
import { getImageUrl } from "@/lib/utils";

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
  tags?: string[];
}

export function ProductImageGallery({
  images,
  productName,
  tags = [],
}: ProductImageGalleryProps) {
  const processedImages = useMemo(() => {
    return images.length > 0 ? images.map(getImageUrl) : ["/placeholder-product.jpg"];
  }, [images]);
  
  const [selectedImage, setSelectedImage] = useState(processedImages[0] || "");
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [showZoomHint, setShowZoomHint] = useState(true);

  const isSpecial = tags.includes("3d-model");

  // Use placeholder if no images
  const displayImages = processedImages;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    // Invert the axis for natural zoom movement
    setZoomPosition({
      x: Math.max(0, Math.min(100, 100 - x)),
      y: Math.max(0, Math.min(100, 100 - y)),
    });
    setShowZoomHint(false);
  };

  const handleImageClick = () => {
    setIsZoomed(!isZoomed);
    if (!isZoomed) {
      setShowZoomHint(true);
      setTimeout(() => setShowZoomHint(false), 2000);
    }
  };

  if (isSpecial) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-center">
          <div className="relative aspect-square w-[90%] overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
            <ObjectCustomizer
              name="nike"
              autoRotate={true}
              autoRotateSpeed={0.5}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        {/* Main image with zoom */}
        <div className="flex items-center justify-start">
          <div
            className="relative aspect-square w-[90%] overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 cursor-pointer"
            onMouseMove={handleMouseMove}
            onClick={handleImageClick}
          >
            <Image
              src={selectedImage}
              alt={productName}
              fill
              className={`object-cover transition-transform duration-300 ${
                isZoomed ? "scale-200" : "scale-100"
              }`}
              style={{
                objectPosition: isZoomed
                  ? `${zoomPosition.x}% ${zoomPosition.y}%`
                  : "center",
              }}
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
              unoptimized={true}
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://via.placeholder.com/600x600?text=No+Image";
              }}
            />
            {!isZoomed && (
              <div className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full transition-opacity">
                <ZoomIn className="w-4 h-4" />
              </div>
            )}
            {isZoomed && showZoomHint && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none transition-opacity duration-500">
                <div className="bg-white/90 dark:bg-gray-900/90 px-4 py-2 rounded-lg text-sm font-medium text-gray-900 dark:text-gray-100">
                  Click again to zoom out
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Thumbnail gallery */}
        {displayImages.length > 1 && (
          <div className="flex gap-2 overflow-x-auto">
            {displayImages.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(image)}
                className={`relative flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-all ${
                  selectedImage === image
                    ? "border-blue-600 dark:border-blue-400"
                    : "border-gray-200 dark:border-gray-700"
                }`}
              >
                <Image
                  src={image}
                  alt={`${productName} thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                  unoptimized={true}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://via.placeholder.com/80x80?text=No+Image";
                  }}
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
