"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { api } from "@/lib/api";
import { Product } from "@shared/products";
import { getImageUrl } from "@/lib/utils";

interface ProductRecommendationsProps {
  productId: string;
}

export function ProductRecommendations({
  productId,
}: ProductRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchRecommendations() {
      try {
        const response = await api.products.getRecommendations(productId, 4);
        if (response.products.length > 0) {
          setRecommendations(response.products);
        } else {
          const allProductsResponse = await api.products.getAll({
            limit: 20,
            inStock: true,
          });
          const filteredProducts = allProductsResponse.products
            .filter((product) => product.id !== productId)
            .slice(0, 4);
          setRecommendations(filteredProducts);
        }
      } catch (error) {
        console.error("Failed to load recommendations:", error);
        try {
          const allProductsResponse = await api.products.getAll({
            limit: 20,
            inStock: true,
          });
          const filteredProducts = allProductsResponse.products
            .filter((product) => product.id !== productId)
            .slice(0, 4);
          setRecommendations(filteredProducts);
        } catch (fallbackError) {
          console.error("Failed to load fallback products:", fallbackError);
          setRecommendations([]);
        }
      } finally {
        setIsLoading(false);
      }
    }
    fetchRecommendations();
  }, [productId]);

  return (
    <div className="flex-1 border border-border rounded-lg p-4">
      <h3 className="text-lg font-bold uppercase tracking-tighter mb-4">
        You May Also Like
      </h3>
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground" />
        </div>
      ) : recommendations.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">
          No recommendations available
        </p>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {recommendations.map((product) => (
            <Link
              key={product.id}
              href={`/explore/${product.id}`}
              className="flex-shrink-0 w-40 hover:opacity-80 transition-opacity"
            >
              <div className="relative aspect-square w-full overflow-hidden mb-2">
                <Image
                  src={getImageUrl(product.images[0] || "/placeholder-product.jpg")}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="160px"
                  unoptimized={true}
                />
              </div>
              <h4 className="font-medium text-xs line-clamp-2 mb-1">
                {product.name}
              </h4>
              <p className="text-sm font-bold">
                $
                {typeof product.price === "number"
                  ? product.price.toFixed(2)
                  : parseFloat(String(product.price)).toFixed(2)}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
