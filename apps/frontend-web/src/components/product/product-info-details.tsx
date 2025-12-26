"use client";

import { Product } from "@shared/products";
import { EcoInfo } from "./eco-info";

interface ProductInfoDetailsProps {
  product: Product;
}

export function ProductInfoDetails({ product }: ProductInfoDetailsProps) {
  const toNumber = (value: number | string | null | undefined): number => {
    if (value === null || value === undefined) return 0;
    return typeof value === 'number' ? value : parseFloat(String(value)) || 0;
  };

  return (
    <div className="space-y-8">
      {/* Description - consolidate shortDescription and description */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold uppercase tracking-tighter">
          Description
        </h2>
        {product.shortDescription && (
          <p className="text-muted-foreground leading-relaxed">
            {product.shortDescription}
          </p>
        )}
        {product.description && (
          <p className="leading-relaxed whitespace-pre-line">
            {product.description}
          </p>
        )}
      </div>

      {/* Specifications */}
      {product.specifications && Object.keys(product.specifications).length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold uppercase tracking-tighter">
            Specifications
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(product.specifications).map(([key, value]) => (
              <div
                key={key}
                className="flex justify-between py-2 border-b border-border"
              >
                <span className="text-sm font-medium text-muted-foreground capitalize">
                  {key}:
                </span>
                <span className="text-sm text-right">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Eco Info */}
      <EcoInfo product={product} />
    </div>
  );
}

