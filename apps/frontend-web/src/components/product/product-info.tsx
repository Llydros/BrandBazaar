"use client";

import { useState } from "react";
import { Product } from "@shared/products";
import { Star } from "lucide-react";
import { SizeSelector } from "./size-selector";
import { VisitorCount } from "./visitor-count";
import { EcoInfo } from "./eco-info";

interface ProductInfoProps {
  product: Product;
  onSizeSelectionChange?: (size: string | null, inStock: boolean) => void;
}

export function ProductInfo({ product, onSizeSelectionChange }: ProductInfoProps) {
  const [selectedSizeInStock, setSelectedSizeInStock] = useState(true);
  // Helper to safely convert to number
  const toNumber = (value: number | string | null | undefined): number => {
    if (value === null || value === undefined) return 0;
    return typeof value === 'number' ? value : parseFloat(String(value)) || 0;
  };

  const formatPrice = (price: number | string) => {
    const numPrice = typeof price === 'number' ? price : parseFloat(price);
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(numPrice);
  };

  const renderStars = (rating: number | string) => {
    const numRating = toNumber(rating);
    const fullStars = Math.floor(numRating);
    const hasHalfStar = numRating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: fullStars }).map((_, i) => (
          <Star
            key={`full-${i}`}
            className="w-5 h-5 fill-yellow-400 text-yellow-400"
          />
        ))}
        {hasHalfStar && (
          <Star className="w-5 h-5 fill-yellow-400/50 text-yellow-400" />
        )}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <Star
            key={`empty-${i}`}
            className="w-5 h-5 fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700"
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Title and rating */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          {product.name}
        </h1>
        <div className="flex items-center gap-4">
          {(() => {
            const avgRating = toNumber(product.averageRating);
            const totalReviews = toNumber(product.totalReviews);
            
            return avgRating > 0 ? (
              <>
                {renderStars(avgRating)}
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {avgRating.toFixed(1)} ({totalReviews}{" "}
                  {totalReviews === 1 ? "review" : "reviews"})
                </span>
              </>
            ) : (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                No reviews yet
              </span>
            );
          })()}
        </div>
        
        {/* Visitor Count */}
        <VisitorCount productId={product.id} />
      </div>

      {/* Price */}
      <div className="space-y-2">
        <div className="flex items-baseline gap-2">
          {(() => {
            const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
            const salePrice = product.salePrice ? (typeof product.salePrice === 'string' ? parseFloat(product.salePrice) : product.salePrice) : null;
            
            if (salePrice && salePrice < price) {
              return (
                <>
                  <span className="text-4xl font-bold text-gray-900 dark:text-gray-100">
                    {formatPrice(salePrice)}
                  </span>
                  <span className="text-2xl text-gray-500 dark:text-gray-400 line-through">
                    {formatPrice(price)}
                  </span>
                  <span className="text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded">
                    {Math.round(((price - salePrice) / price) * 100)}% OFF
                  </span>
                </>
              );
            }
            return (
              <span className="text-4xl font-bold text-gray-900 dark:text-gray-100">
                {formatPrice(price)}
              </span>
            );
          })()}
        </div>
        {/* Financing option - show installment payment */}
        {(() => {
          const finalPrice = product.salePrice && toNumber(product.salePrice) < toNumber(product.price) 
            ? toNumber(product.salePrice) 
            : toNumber(product.price);
          
          if (finalPrice > 50) {
            const monthlyPayment = Math.round(finalPrice / 4);
            return (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium text-blue-600 dark:text-blue-400">📅 4 interest-free installments:</span>
                {' '}
                <span className="font-semibold">{formatPrice(monthlyPayment)}/month</span>
              </div>
            );
          }
          return null;
        })()}
      </div>

      {/* Size Selector */}
      {product.specifications?.Size && (
        <SizeSelector 
          sizes={product.specifications.Size} 
          onSizeChange={(size, inStock) => {
            setSelectedSizeInStock(inStock);
            onSizeSelectionChange?.(size, inStock);
          }}
        />
      )}

      {/* Stock status */}
      <div className="flex items-center gap-2">
        {(() => {
          const stock = toNumber(product.stock);
          if (stock > 0 && stock <= 5) {
            return (
              <span className="text-sm text-orange-600 dark:text-orange-400 font-medium bg-orange-50 dark:bg-orange-900/20 px-3 py-1 rounded-lg border border-orange-200 dark:border-orange-800">
                ⚠️ Only {stock} left in stock!
              </span>
            );
          }
          if (stock > 5) {
            return (
              <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                In Stock ({stock} available)
              </span>
            );
          }
          return (
            <span className="text-sm text-red-600 dark:text-red-400 font-medium">
              Out of Stock
            </span>
          );
        })()}
      </div>

      {/* Shipping Info */}
      {(product.shippingInfo || product.estimatedDeliveryDays) && selectedSizeInStock && (
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
            Shipping Information
          </div>
          {product.estimatedDeliveryDays && (() => {
            const days = toNumber(product.estimatedDeliveryDays);
            return (
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Estimated delivery: {days} {days === 1 ? "day" : "days"}
              </div>
            );
          })()}
          {product.shippingInfo && (
            <div className="text-sm text-gray-700 dark:text-gray-300 mt-1">
              {product.shippingInfo}
            </div>
          )}
        </div>
      )}
      
      {/* Return Policy */}
      {selectedSizeInStock && (
        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-start gap-2">
            <span className="text-lg">✓</span>
            <div>
              <div className="text-sm font-medium text-green-900 dark:text-green-100">
                Easy Returns in 14 Days
              </div>
              <div className="text-xs text-green-700 dark:text-green-300 mt-1">
                Free return shipping. Full refund or exchange. No questions asked.
              </div>
            </div>
          </div>
        </div>
      )}
      {!selectedSizeInStock && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <div className="text-sm font-medium text-red-900 dark:text-red-100">
            ⚠️ Selected size is out of stock
          </div>
          <div className="text-xs text-red-700 dark:text-red-300 mt-1">
            Not shippable due to selected size not being in stock
          </div>
        </div>
      )}

      {/* Short Description */}
      {product.shortDescription && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {product.shortDescription}
          </p>
        </div>
      )}

      {/* Tags */}
      {product.tags && product.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {product.tags.map((tag, index) => (
            <span
              key={index}
              className="px-3 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full border border-gray-200 dark:border-gray-700"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Category */}
      {product.category && (
        <div>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Category:{" "}
          </span>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {product.category}
          </span>
        </div>
      )}

      {/* Specifications */}
      {product.specifications && Object.keys(product.specifications).length > 0 && (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Specifications
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.entries(product.specifications).map(([key, value]) => (
              <div
                key={key}
                className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700"
              >
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400 capitalize">
                  {key}:
                </span>
                <span className="text-sm text-gray-900 dark:text-gray-100 text-right">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Description */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Description
        </h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
          {product.description}
        </p>
      </div>

      {/* Eco Info */}
      <EcoInfo product={product} />
    </div>
  );
}

