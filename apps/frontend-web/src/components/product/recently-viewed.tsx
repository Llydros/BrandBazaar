"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const RECENTLY_VIEWED_KEY = "recently_viewed_products";

interface RecentProduct {
  id: string;
  name: string;
  price: string;
  image: string;
}

export function RecentlyViewed({
  currentProductId,
}: {
  currentProductId: string;
}) {
  const [recentProducts, setRecentProducts] = useState<RecentProduct[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem(RECENTLY_VIEWED_KEY);
    const recent: RecentProduct[] = saved ? JSON.parse(saved) : [];

    // Filter out current product and limit to 6
    const filtered = recent
      .filter((product) => product.id !== currentProductId)
      .slice(0, 6);

    setRecentProducts(filtered);
  }, [currentProductId]);

  const checkScrollability = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    checkScrollability();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", checkScrollability);
      return () => container.removeEventListener("scroll", checkScrollability);
    }
  }, [recentProducts]);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 180;
      const newScrollLeft =
        scrollContainerRef.current.scrollLeft +
        (direction === "left" ? -scrollAmount : scrollAmount);
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      });
    }
  };

  if (recentProducts.length === 0) {
    return null;
  }

  return (
    <div className="flex-1 border border-border rounded-lg p-4">
      <h3 className="text-lg font-bold uppercase tracking-tighter mb-4">
        Recently Viewed
      </h3>
      <div className="relative">
        {canScrollLeft && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm border border-border hover:bg-background"
            onClick={() => scroll("left")}
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {recentProducts.map((product) => (
            <Link
              key={product.id}
              href={`/explore/${product.id}`}
              className="flex-shrink-0 w-40 hover:opacity-80 transition-opacity"
            >
              <div className="relative aspect-square w-full overflow-hidden mb-2">
                <Image
                  src={product.image || "/placeholder-product.jpg"}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="160px"
                />
              </div>
              <h3 className="font-medium text-xs mb-1 line-clamp-2">
                {product.name}
              </h3>
              <p className="text-sm font-bold">{product.price}</p>
            </Link>
          ))}
        </div>
        {canScrollRight && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm border border-border hover:bg-background"
            onClick={() => scroll("right")}
            aria-label="Scroll right"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
