"use client";

import { Seller } from "@shared/products";
import { Star, Mail } from "lucide-react";

interface SellerInfoProps {
  seller?: Seller;
}

export function SellerInfo({ seller }: SellerInfoProps) {
  if (!seller) {
    return (
      <div className="p-6 rounded-lg border">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Seller Information
        </h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
              BrandBazaar
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Your trusted marketplace for authentic products
            </p>
          </div>
        </div>
      </div>
    );
  }
  // Helper to safely convert to number
  const toNumber = (value: number | string | null | undefined): number => {
    if (value === null || value === undefined) return 0;
    return typeof value === "number" ? value : parseFloat(String(value)) || 0;
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
            className="w-4 h-4 fill-yellow-400 text-yellow-400"
          />
        ))}
        {hasHalfStar && (
          <Star className="w-4 h-4 fill-yellow-400/50 text-yellow-400" />
        )}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <Star
            key={`empty-${i}`}
            className="w-4 h-4 fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700"
          />
        ))}
      </div>
    );
  };

  return (
    <div className="p-6 rounded-lg border">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Seller Information
      </h3>
      <div className="space-y-4">
        <div>
          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
            {seller.name}
          </h4>
          {seller.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {seller.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Mail className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <span className="text-gray-600 dark:text-gray-400">
            {seller.email}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {(() => {
            const rating = toNumber(seller.rating);
            const totalReviews = toNumber(seller.totalReviews);

            return rating > 0 ? (
              <>
                {renderStars(rating)}
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {rating.toFixed(1)} ({totalReviews}{" "}
                  {totalReviews === 1 ? "review" : "reviews"})
                </span>
              </>
            ) : (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                No ratings yet
              </span>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
