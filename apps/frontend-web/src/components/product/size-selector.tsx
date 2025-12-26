"use client";

import { useState, useEffect } from "react";
import { SizeGuide } from "./size-guide";

interface SizeSelectorProps {
  sizes?: string; // e.g., "US 7-15"
  onSizeChange?: (size: string, inStock: boolean) => void;
  onStockChange?: (stock: number) => void;
  onAllSizesChange?: (allSizes: { size: string; stock: number }[]) => void;
}

export function SizeSelector({ sizes, onSizeChange, onStockChange, onAllSizesChange }: SizeSelectorProps) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [sizeAvailability, setSizeAvailability] = useState<Record<string, boolean>>({});
  const [sizeStock, setSizeStock] = useState<Record<string, number>>({});
  
  // Mock availability data - randomly mark some sizes as unavailable
  useEffect(() => {
    const parseSizes = (sizeString?: string): string[] => {
      if (!sizeString) return [];
      
      const match = sizeString.match(/US\s*(\d+)-(\d+)/i);
      if (match) {
        const start = parseInt(match[1], 10);
        const end = parseInt(match[2], 10);
        const sizesArray: string[] = [];
        
        for (let i = start; i <= end; i++) {
          sizesArray.push(`${i}`);
        }
        return sizesArray;
      }
      
      const singleMatch = sizeString.match(/US\s*(\d+)/i);
      if (singleMatch) {
        return [singleMatch[1]];
      }
      
      return ["7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "11.5", "12"];
    };

    const availableSizes = parseSizes(sizes);
    const availability: Record<string, boolean> = {};
    const stock: Record<string, number> = {};
    
    // Generate deterministic stock based on size string (use size as seed)
    const hashString = (str: string) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return Math.abs(hash);
    };
    
    availableSizes.forEach((size, index) => {
      // Use a simple pattern to ensure some sizes are out of stock
      // Every 4th size (indices 3, 7, 11, etc.) will be out of stock for demonstration
      // This gives us ~25% out of stock for realistic demo
      const isAvailable = index % 4 !== 3;
      
      availability[size] = isAvailable;
      
      if (isAvailable) {
        // Stock between 1-15, with some having low stock for variety
        const seed = hashString(`${size}-${index}`) % 100;
        stock[size] = (seed % 15) + 1;
      } else {
        stock[size] = 0;
      }
    });
    
    setSizeAvailability(availability);
    setSizeStock(stock);
    
    // Report all sizes to parent component
    const allSizes = availableSizes.map(size => ({
      size,
      stock: stock[size] ?? 0,
    }));
    onAllSizesChange?.(allSizes);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sizes]);

  const handleSizeClick = (size: string) => {
    setSelectedSize(size);
    const isAvailable = sizeAvailability[size] ?? true;
    const stockCount = sizeStock[size] ?? 0;
    onSizeChange?.(size, isAvailable);
    onStockChange?.(isAvailable ? stockCount : 0);
  };

  // Parse sizes for display (already computed in useEffect)
  const parseSizes = (sizeString?: string): string[] => {
    if (!sizeString) return [];
    
    const match = sizeString.match(/US\s*(\d+)-(\d+)/i);
    if (match) {
      const start = parseInt(match[1], 10);
      const end = parseInt(match[2], 10);
      const sizesArray: string[] = [];
      
      for (let i = start; i <= end; i++) {
        sizesArray.push(`${i}`);
      }
      return sizesArray;
    }
    
    const singleMatch = sizeString.match(/US\s*(\d+)/i);
    if (singleMatch) {
      return [singleMatch[1]];
    }
    
    return ["7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "11.5", "12"];
  };

  const availableSizes = parseSizes(sizes);

  if (availableSizes.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-baseline">
         <h3 className="text-sm font-bold uppercase tracking-widest">
           Select Size (US)
         </h3>
         <SizeGuide />
      </div>
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
        {availableSizes.map((size) => {
          const isAvailable = sizeAvailability[size] ?? true;
          return (
            <button
              key={size}
              onClick={() => handleSizeClick(size)}
              disabled={!isAvailable}
              className={`h-12 w-full border text-sm font-medium transition-all ${
                !isAvailable
                  ? "border-border bg-secondary/20 text-muted-foreground cursor-not-allowed diagonal-strike"
                  : selectedSize === size
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-background text-foreground hover:border-foreground"
              }`}
            >
              {size}
            </button>
          );
        })}
      </div>
      {sizes && (
        <p className="text-xs font-mono text-muted-foreground">
          Range: {sizes}
        </p>
      )}
    </div>
  );
}
