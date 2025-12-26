"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Product } from "@shared/products";
import { BadgeCheck } from "lucide-react";
import { SizeSelector } from "./size-selector";
import { InstallmentsInfo } from "./installments-info";

interface ProductInfoTopProps {
  product: Product;
  onSizeSelectionChange?: (size: string | null, inStock: boolean) => void;
  onUnavailableSizesChange?: (sizes: { size: string; stock: number }[]) => void;
}

export function ProductInfoTop({
  product,
  onSizeSelectionChange,
  onUnavailableSizesChange,
}: ProductInfoTopProps) {
  const [selectedSizeInStock, setSelectedSizeInStock] = useState(true);
  const [currentStock, setCurrentStock] = useState<number | null>(null);

  // Track unavailable sizes
  const [unavailableSizes, setUnavailableSizes] = useState<
    { size: string; stock: number }[]
  >([]);

  // Update parent when unavailable sizes change
  useEffect(() => {
    onUnavailableSizesChange?.(unavailableSizes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unavailableSizes]);
  // Helper to safely convert to number
  const toNumber = (value: number | string | null | undefined): number => {
    if (value === null || value === undefined) return 0;
    return typeof value === "number" ? value : parseFloat(String(value)) || 0;
  };

  const formatPrice = (price: number | string) => {
    const numPrice = typeof price === "number" ? price : parseFloat(price);
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(numPrice);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold uppercase tracking-tighter leading-[0.9]">
          {product.name}
        </h1>

        <div className="flex items-center gap-6">
          <Link
            href={`/legit-check/${product.id}`}
            className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider hover:underline transition-colors"
          >
            <BadgeCheck className="h-3 w-3" />
            <span>Legit Check Verified</span>
          </Link>
        </div>
      </div>

      {/* Price */}
      <div className="space-y-2 py-6 border-y border-border">
        <div className="flex items-baseline gap-3 mb-8">
          {(() => {
            const price =
              typeof product.price === "string"
                ? parseFloat(product.price)
                : product.price;
            const salePrice = product.salePrice
              ? typeof product.salePrice === "string"
                ? parseFloat(product.salePrice)
                : product.salePrice
              : null;

            if (salePrice && salePrice < price) {
              return (
                <>
                  <span className="text-6xl font-bold tracking-tighter">
                    {formatPrice(salePrice)}
                  </span>
                  <span className="text-2xl text-muted-foreground line-through decoration-1">
                    {formatPrice(price)}
                  </span>
                  <span className="text-xs font-bold bg-foreground text-background px-2 py-1 uppercase tracking-wider">
                    {Math.round(((price - salePrice) / price) * 100)}% OFF
                  </span>
                </>
              );
            }
            return (
              <span className="text-4xl font-bold tracking-tighter">
                {formatPrice(price)}
              </span>
            );
          })()}
        </div>
        {/* Financing option - show installment payment */}
        {(() => {
          const finalPrice =
            product.salePrice &&
            toNumber(product.salePrice) < toNumber(product.price)
              ? toNumber(product.salePrice)
              : toNumber(product.price);

          if (finalPrice > 50) {
            const monthlyPayment = Math.round(finalPrice / 4);
            return (
              <div className="text-xs font-mono text-muted-foreground">
                <InstallmentsInfo
                  monthlyPayment={monthlyPayment}
                  totalPrice={finalPrice}
                />
              </div>
            );
          }
          return null;
        })()}
      </div>

      {/* Size Selector */}
      {product.specifications?.Size && (
        <div className="py-1">
          <SizeSelector
            sizes={product.specifications.Size}
            onSizeChange={(size, inStock) => {
              setSelectedSizeInStock(inStock);
              onSizeSelectionChange?.(size, inStock);
            }}
            onStockChange={(stock) => {
              setCurrentStock(stock);
            }}
            onAllSizesChange={(allSizes) => {
              // Filter to only unavailable sizes
              const unavailable = allSizes.filter((s) => s.stock === 0);
              setUnavailableSizes(unavailable);
            }}
          />
        </div>
      )}

      {/* Stock status */}
      <div className="font-mono text-xs uppercase tracking-wider">
        {(() => {
          const stock =
            currentStock !== null ? currentStock : toNumber(product.stock);
          if (stock > 0 && stock <= 5) {
            return (
              <span className="text-destructive">
                Only {stock} left in stock
              </span>
            );
          }
          if (stock > 5) {
            return <span className="text-green-600">In Stock</span>;
          }
          return <span className="text-destructive">Out of Stock</span>;
        })()}
      </div>

      {!selectedSizeInStock && (
        <div className="p-3 bg-destructive/10 border border-destructive space-y-1">
          <div className="text-xs font-bold uppercase tracking-widest text-destructive">
            Selection Unavailable
          </div>
          <div className="text-xs font-mono text-destructive/80">
            This size combination is currently out of stock.
          </div>
        </div>
      )}
    </div>
  );
}
