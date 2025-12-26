"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Star } from "lucide-react";
import { useCreateReview } from "@/hooks/use-product";
import { useAuth } from "@/contexts/auth-context";
import { LoginDialog } from "@/components/auth/login-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Review } from "@shared/products";

interface ReviewFormProps {
  productId: string;
  reviews?: Review[];
}

export function ReviewForm({ productId, reviews = [] }: ReviewFormProps) {
  const { user } = useAuth();
  const { mutate: createReview, isPending } = useCreateReview(productId);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [hoveredRating, setHoveredRating] = useState(0);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [hasAlreadyReviewed, setHasAlreadyReviewed] = useState(false);

  const [errors, setErrors] = useState<{ rating?: string; comment?: string }>(
    {}
  );

  // Check if user has already reviewed this product
  useEffect(() => {
    if (user && reviews.length > 0) {
      const userReviewed = reviews.some((review) => review.user.id === user.id);
      setHasAlreadyReviewed(userReviewed);
    }
  }, [user, reviews]);

  const validateForm = () => {
    const newErrors: { rating?: string; comment?: string } = {};

    if (rating < 1 || rating > 5) {
      newErrors.rating = "Please select a rating between 1 and 5 stars";
    }

    if (comment && comment.length > 5000) {
      newErrors.comment = "Comment must be less than 5000 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!validateForm()) {
      return;
    }

    // Show confirmation dialog
    setShowConfirmation(true);
  };

  const handleConfirmSubmit = () => {
    if (!user) return;

    createReview(
      { rating, comment: comment.trim() || null },
      {
        onSuccess: () => {
          setComment("");
          setRating(5);
          setErrors({});
          setShowConfirmation(false);
          setHasAlreadyReviewed(true);
        },
        onError: (error: any) => {
          setShowConfirmation(false);
          if (error?.response?.message) {
            setErrors({ comment: error.response.message });
          }
        },
      }
    );
  };

  if (!user) {
    return (
      <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg text-center">
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Please log in to leave a review
        </p>
        <LoginDialog>
          <Button>Login</Button>
        </LoginDialog>
      </div>
    );
  }

  if (hasAlreadyReviewed) {
    return (
      <div className="p-6 border border-success rounded-lg text-center">
        <p className="text-success font-medium">
          You have already reviewed this product
        </p>
        <p className="text-sm text-green-600 dark:text-green-500 mt-2">
          You can submit reviews for other products.
        </p>
      </div>
    );
  }

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="space-y-4 p-6 border border-gray-200 dark:border-gray-700 rounded-lg"
      >
        <div>
          <Label htmlFor="rating">Rating *</Label>
          <div className="flex items-center gap-1 mt-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => {
                  setRating(star);
                  setErrors({ ...errors, rating: undefined });
                }}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="focus:outline-none"
                aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
              >
                <Star
                  className={`w-6 h-6 transition-colors ${
                    star <= (hoveredRating || rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700"
                  }`}
                />
              </button>
            ))}
          </div>
          {errors.rating && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
              {errors.rating}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="comment">Comment (optional)</Label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => {
              setComment(e.target.value);
              setErrors({ ...errors, comment: undefined });
            }}
            placeholder="Share your thoughts about this product..."
            className={`min-h-[100px] w-full mt-2 px-3 py-2 border rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 ${
              errors.comment
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 dark:border-gray-600 focus:ring-blue-500"
            }`}
            rows={4}
            maxLength={5000}
          />
          <div className="flex justify-between mt-1">
            {errors.comment && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.comment}
              </p>
            )}
            <p
              className={`text-xs ml-auto ${
                comment.length > 4800 ? "text-orange-600" : "text-gray-500"
              }`}
            >
              {comment.length}/5000 characters
            </p>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isPending || rating === 0}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "Submitting..." : "Submit Review"}
        </Button>
      </form>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Review Submission</DialogTitle>
            <DialogDescription>
              Are you sure you want to submit this review? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-medium">Rating:</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      star <= rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700"
                    }`}
                  />
                ))}
              </div>
            </div>
            {comment.trim() && (
              <div>
                <span className="font-medium">Comment:</span>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                  {comment.trim()}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmation(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmSubmit}
              disabled={isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isPending ? "Submitting..." : "Confirm & Submit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
