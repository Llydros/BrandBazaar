"use client";

import { Leaf, Package, Recycle } from "lucide-react";
import { Product } from "@shared/products";

interface EcoInfoProps {
  product: Product;
}

export function EcoInfo({ product }: EcoInfoProps) {
  // Mock sustainability data
  const sustainabilityScore = Math.floor(Math.random() * 31) + 70; // 70-100
  const isEcoFriendly = sustainabilityScore >= 85;

  return (
    <div className="mt-4 p-4 bg-background rounded-lg border border-success">
      <div className="flex items-center gap-2 mb-3">
        <Leaf className="w-5 h-5 text-success" />
        <h3 className="font-semibold text-foreground">
          Sustainability Information
        </h3>
      </div>
      
      <div className="space-y-3">
        {/* Sustainability Score */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-foreground">
            Sustainability Score
          </span>
          <div className="flex items-center gap-2">
            <div className="w-32 bg-background border border-border rounded-full h-2">
              <div
                className="bg-success h-2 rounded-full transition-all duration-500"
                style={{ width: `${sustainabilityScore}%` }}
              />
            </div>
            <span className="font-bold text-foreground text-sm">
              {sustainabilityScore}/100
            </span>
          </div>
        </div>

        {/* Eco-friendly Badge */}
        {isEcoFriendly && (
          <div className="flex items-center gap-2 text-sm">
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-background border border-success text-success rounded-md">
              <Leaf className="w-4 h-4" />
              Eco-Friendly Product
            </span>
          </div>
        )}

        {/* Packaging Info */}
        <div className="flex items-start gap-3 pt-2 border-t border-border">
          <Package className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
          <div className="text-xs text-foreground">
            <strong>Packaging:</strong> Recycled cardboard. 100% biodegradable. Plastic-free shipping.
          </div>
        </div>

        {/* Materials Info */}
        <div className="flex items-start gap-3">
          <Recycle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
          <div className="text-xs text-foreground">
            <strong>Materials:</strong> Made with {Math.floor(Math.random() * 30) + 30}% recycled materials. Carbon-neutral shipping available.
          </div>
        </div>
      </div>
    </div>
  );
}

