"use client";

import { useState } from "react";
import { Review } from "@shared/products";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReviewListProps {
  reviews: Review[];
}

const REVIEWS_PER_PAGE = 5;

export function ReviewList({ reviews }: ReviewListProps) {
  // Helper to safely convert to number
  const toNumber = (value: number | string | null | undefined): number => {
    if (value === null || value === undefined) return 0;
    return typeof value === 'number' ? value : parseFloat(String(value)) || 0;
  };

  // Helper to blur email addresses
  const blurEmail = (email: string): string => {
    const [localPart, domain] = email.split('@');
    if (localPart.length <= 2) return `${localPart[0]}***@${domain}`;
    return `${localPart.substring(0, 2)}***@${domain}`;
  };

  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [displayCount, setDisplayCount] = useState(REVIEWS_PER_PAGE);

  // Filter reviews by rating if filter is set
  const filteredReviews = filterRating
    ? reviews.filter((review) => toNumber(review.rating) === filterRating)
    : reviews;

  // Get paginated reviews
  const displayedReviews = filteredReviews.slice(0, displayCount);
  const hasMore = filteredReviews.length > displayCount;

  const handleLoadMore = () => {
    setDisplayCount((prev) => prev + REVIEWS_PER_PAGE);
  };

  // Count reviews by rating
  const ratingCounts = {
    5: reviews.filter((r) => toNumber(r.rating) === 5).length,
    4: reviews.filter((r) => toNumber(r.rating) === 4).length,
    3: reviews.filter((r) => toNumber(r.rating) === 3).length,
    2: reviews.filter((r) => toNumber(r.rating) === 2).length,
    1: reviews.filter((r) => toNumber(r.rating) === 1).length,
  };
  
  const renderStars = (rating: number | string) => {
    const numRating = toNumber(rating);
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < numRating
            ? "fill-foreground text-foreground"
            : "fill-muted text-muted-foreground/30"
        }`}
      />
    ));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground font-mono uppercase tracking-wider border border-dashed border-border">
        <p>No reviews yet. Be the first to review this product!</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Rating Filter */}
      <div className="flex flex-wrap items-center gap-2 pb-4 border-b border-border">
        <span className="text-xs font-bold uppercase tracking-widest mr-2">
          Filter by rating:
        </span>
        <Button
          onClick={() => setFilterRating(null)}
          variant={filterRating === null ? "default" : "outline"}
          size="sm"
          className="rounded-none text-xs uppercase tracking-wider h-8"
        >
          All ({reviews.length})
        </Button>
        {[5, 4, 3, 2, 1].map((rating) => (
          <Button
            key={rating}
            onClick={() => {
              setFilterRating(rating);
              setDisplayCount(REVIEWS_PER_PAGE);
            }}
            variant={filterRating === rating ? "default" : "outline"}
            size="sm"
            className="rounded-none text-xs uppercase tracking-wider h-8"
          >
            {rating} Star{rating > 1 ? "s" : ""} ({ratingCounts[rating as keyof typeof ratingCounts]})
          </Button>
        ))}
      </div>

      {/* Filtered Results Message */}
      {filterRating && filteredReviews.length === 0 && (
        <div className="text-center py-12 border border-dashed border-border">
          <p className="font-mono text-muted-foreground mb-4">No {filterRating}-star reviews found.</p>
          <Button
            onClick={() => setFilterRating(null)}
            variant="link"
            className="uppercase tracking-widest"
          >
            Show all reviews
          </Button>
        </div>
      )}

      {/* Review List */}
      {displayedReviews.length === 0 && filteredReviews.length > 0 ? null : (
        <div className="space-y-4">
          {displayedReviews.map((review) => (
            <div
              key={review.id}
              className="p-6 border border-border bg-background"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="font-bold uppercase tracking-wide">
                    {blurEmail(review.user.email)}
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex">{renderStars(review.rating)}</div>
                    <span className="text-xs font-mono text-muted-foreground uppercase">
                      {formatDate(review.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
              {review.comment && (
                <p className="text-sm leading-relaxed">
                  {review.comment}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center pt-8">
          <Button
            onClick={handleLoadMore}
            variant="outline"
            className="rounded-none uppercase tracking-widest w-full sm:w-auto px-8 h-12"
          >
            Load More Reviews ({filteredReviews.length - displayCount} remaining)
          </Button>
        </div>
      )}
    </div>
  );
}
