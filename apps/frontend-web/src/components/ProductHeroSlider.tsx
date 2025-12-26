"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Product } from "@shared/products";
import { getImageUrl } from "@/lib/utils";

interface ProductHeroSliderProps {
  products: Product[];
}

export function ProductHeroSlider({ products }: ProductHeroSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (products.length === 0 || !isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % products.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [products.length, isAutoPlaying]);

  if (products.length === 0) {
    return (
      <div className="border border-border p-12 text-center">
        <p className="text-muted-foreground uppercase tracking-widest">
          No products available
        </p>
      </div>
    );
  }

  const goToPrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + products.length) % products.length);
  };

  const goToNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % products.length);
  };

  const goToSlide = (index: number) => {
    setIsAutoPlaying(false);
    setCurrentIndex(index);
  };

  const currentProduct = products[currentIndex];

  return (
    <div
      className="relative w-full h-[600px] overflow-hidden group"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      <Link
        href={`/explore/${currentProduct.id}`}
        className="relative w-full h-full block"
      >
        <div className="relative w-full h-full">
          <Image
            src={getImageUrl(currentProduct.images[0] || "/placeholder-product.jpg")}
            alt={currentProduct.name}
            fill
            className="object-cover transition-opacity duration-700"
            priority
            sizes="100vw"
            unoptimized={true}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/50 to-transparent" />
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 lg:p-16">
          <div className="container mx-auto max-w-4xl">
            <p className="text-xs md:text-sm font-mono text-muted-foreground mb-2 uppercase tracking-widest">
              {currentProduct.seller?.name || "BrandBazaar"}
            </p>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold uppercase mb-4 text-foreground leading-tight">
              {currentProduct.name}
            </h2>
            <p className="text-lg md:text-xl font-mono text-foreground mb-6">
              $
              {typeof currentProduct.price === "number"
                ? currentProduct.price
                : parseFloat(String(currentProduct.price)).toFixed(2)}
            </p>
            <Button
              size="lg"
              className="rounded-none text-lg px-8 h-14 bg-foreground text-background hover:bg-foreground/90"
              onClick={(e) => {
                e.preventDefault();
                window.location.href = `/explore/${currentProduct.id}`;
              }}
            >
              Shop Now
            </Button>
          </div>
        </div>
      </Link>

      <Button
        variant="outline"
        size="icon"
        className="absolute left-4 top-1/2 -translate-y-1/2 rounded-none w-12 h-12 md:w-14 md:h-14 border-2 border-foreground bg-background/80 backdrop-blur-sm hover:bg-foreground hover:text-background transition-all opacity-0 group-hover:opacity-100"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          goToPrevious();
        }}
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6 md:w-7 md:h-7" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-none w-12 h-12 md:w-14 md:h-14 border-2 border-foreground bg-background/80 backdrop-blur-sm hover:bg-foreground hover:text-background transition-all opacity-0 group-hover:opacity-100"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          goToNext();
        }}
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6 md:w-7 md:h-7" />
      </Button>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
        {products.map((_, index) => (
          <button
            key={index}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              goToSlide(index);
            }}
            className={`h-1.5 transition-all duration-300 ${
              index === currentIndex
                ? "w-8 bg-foreground"
                : "w-1.5 bg-muted-foreground/50 hover:bg-muted-foreground"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
