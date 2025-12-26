"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useProduct } from "@/hooks/use-product";
import { ProductImageGallery } from "@/components/product/product-image-gallery";
import { ProductInfoTop } from "@/components/product/product-info-top";
import { ProductInfoDetails } from "@/components/product/product-info-details";
import { ProductActions } from "@/components/product/product-actions";
import { SellerInfo } from "@/components/product/seller-info";
import { ReviewList } from "@/components/product/review-list";
import { ReviewForm } from "@/components/product/review-form";
import { ProductRecommendations } from "@/components/product/product-recommendations";
import { ProductQA } from "@/components/product/product-qa";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { RecentlyViewed } from "@/components/product/recently-viewed";
import { ChevronDown } from "lucide-react";
import { getImageUrl } from "@/lib/utils";

const RECENTLY_VIEWED_KEY = "recently_viewed_products";

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;
  const { data: product, isLoading, error } = useProduct(productId);
  const [isSelectedSizeInStock, setIsSelectedSizeInStock] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [unavailableSizes, setUnavailableSizes] = useState<
    { size: string; stock: number }[]
  >([]);

  // Track recently viewed
  useEffect(() => {
    if (product) {
      const saved = localStorage.getItem(RECENTLY_VIEWED_KEY);
      let recent: any[] = saved ? JSON.parse(saved) : [];

      // Remove current product if exists
      recent = recent.filter((item) => item.id !== productId);

      // Add current product to the beginning
      const toNumber = (value: number | string | null | undefined): number => {
        if (value === null || value === undefined) return 0;
        return typeof value === "number"
          ? value
          : parseFloat(String(value)) || 0;
      };

      const finalPrice =
        product.salePrice &&
        toNumber(product.salePrice) < toNumber(product.price)
          ? product.salePrice
          : product.price;

      recent.unshift({
        id: product.id,
        name: product.name,
        price: new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(toNumber(finalPrice)),
        image: getImageUrl(product.images[0] || ""),
      });

      // Keep only last 10
      recent = recent.slice(0, 10);

      localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(recent));
    }
  }, [product, productId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="uppercase tracking-widest animate-pulse">
            Loading product...
          </p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold uppercase">Product Not Found</h1>
          <p className="text-muted-foreground">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <Link href="/">
            <Button
              variant="outline"
              className="rounded-none uppercase border-border text-foreground hover:bg-secondary"
            >
              Go Back Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="container mx-auto px-4 scale-[0.9] origin-top">
        <nav className="py-6 text-sm font-mono uppercase tracking-widest mb-6">
          <ol className="flex items-center space-x-2 text-muted-foreground">
            <li>
              <Link
                href="/"
                className="hover:text-foreground transition-colors"
              >
                Home
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link
                href="/explore"
                className="hover:text-foreground transition-colors"
              >
                Explore
              </Link>
            </li>
            <li>/</li>
            <li className="text-foreground">{product.name}</li>
          </ol>
        </nav>

        {/* Main Product Section - 2 Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Left Column - Images */}
          <div>
            <ProductImageGallery
              images={product.images}
              productName={product.name}
              tags={product.tags || []}
            />
          </div>

          {/* Right Column - Top Info & Actions */}
          <div className="space-y-4 sticky top-24 h-fit">
            <ProductInfoTop
              product={product}
              onSizeSelectionChange={(size, inStock) => {
                setSelectedSize(size);
                setIsSelectedSizeInStock(inStock);
              }}
              onUnavailableSizesChange={(sizes) => {
                setUnavailableSizes(sizes);
              }}
            />
            <ProductActions
              product={product}
              isSizeInStock={isSelectedSizeInStock}
              selectedSize={selectedSize}
            />
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="flex justify-center py-4">
          <ChevronDown className="w-6 h-6 text-muted-foreground animate-bounce" />
        </div>

        {/* Details Section */}
        <div className="mb-16 pt-16">
          <ProductInfoDetails product={product} />
        </div>

        {/* Recommendations and Recently Viewed */}
        <div className="mb-16 pt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <RecentlyViewed currentProductId={product.id} />
          <ProductRecommendations productId={product.id} />
        </div>

        {/* Seller Info */}
        <div className="mb-16">
          <SellerInfo seller={product.seller} />
        </div>

        {/* Q&A Section */}
        <div className="pt-16 mb-16">
          <ProductQA productId={product.id} productName={product.name} />
        </div>

        {/* Reviews Section */}
        <div className="pt-16 space-y-12 mb-16">
          <div>
            <h2 className="text-4xl font-bold uppercase tracking-tighter mb-8">
              Customer Reviews
            </h2>
            {product.reviews && product.reviews.length > 0 ? (
              <ReviewList reviews={product.reviews} />
            ) : (
              <p className="text-muted-foreground font-mono text-center py-12 border border-dashed border-border">
                NO REVIEWS YET. BE THE FIRST.
              </p>
            )}
          </div>

          {/* Review Form */}
          <div>
            <h3 className="text-2xl font-bold uppercase mb-6">
              Write a Review
            </h3>
            <ReviewForm productId={product.id} reviews={product.reviews} />
          </div>
        </div>
      </div>
    </div>
  );
}
