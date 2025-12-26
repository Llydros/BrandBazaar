"use client";

import { Product } from "@shared/products";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/cart-context";
import { useWishlist } from "@/contexts/wishlist-context";
import { useAuth } from "@/contexts/auth-context";
import { ShoppingCart, Heart, Share2 } from "lucide-react";
import { useState } from "react";
import { LoginDialog } from "@/components/auth/login-dialog";
import { getImageUrl } from "@/lib/utils";

interface ProductActionsProps {
  product: Product;
  isSizeInStock?: boolean;
  selectedSize?: string | null;
}

export function ProductActions({ product, isSizeInStock = true, selectedSize }: ProductActionsProps) {
  // Helper to safely convert to number
  const toNumber = (value: number | string | null | undefined): number => {
    if (value === null || value === undefined) return 0;
    return typeof value === 'number' ? value : parseFloat(String(value)) || 0;
  };

  const { addItem: addToCart } = useCart();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  const inWishlist = isInWishlist(product.id);
  const stock = toNumber(product.stock);

  const handleAddToCart = () => {
    if (stock === 0) return;
    
    let variantId: string;
    let price: number;
    
    if (product.variants && product.variants.length > 0) {
      let selectedVariant = product.variants.find(
        (v) => selectedSize && v.size === selectedSize
      );
      
      if (!selectedVariant) {
        selectedVariant = product.variants.find((v) => v.stockQuantity > 0);
      }
      
      if (!selectedVariant) {
        selectedVariant = product.variants[0];
      }
      
      if (!selectedVariant) {
        alert("No variant available for this product");
        return;
      }
      
      variantId = selectedVariant.id;
      const basePrice = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
      const priceModifier = typeof selectedVariant.priceModifier === 'number' 
        ? selectedVariant.priceModifier 
        : parseFloat(String(selectedVariant.priceModifier || 0));
      price = basePrice + priceModifier;
    } else {
      alert("This product has no variants. Please contact support.");
      return;
    }
    
    setIsAddingToCart(true);
    addToCart({
      productId: product.id,
      productVariantId: variantId,
      productName: product.name,
      price,
      image: getImageUrl(product.images[0] || ""),
    });
    setTimeout(() => setIsAddingToCart(false), 500);
  };

  const handleWishlistToggle = () => {
    // Check if user is logged in
    if (!user) {
      setShowLoginDialog(true);
      return;
    }
    
    if (inWishlist) {
      removeFromWishlist(product.id);
    } else {
      const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
      addToWishlist({
        productId: product.id,
        productName: product.name,
        price,
        image: getImageUrl(product.images[0] || ""),
        originalPrice: price,
        category: product.category || undefined,
        stock: typeof product.stock === 'number' ? product.stock : parseFloat(String(product.stock)),
        onSale: !!product.salePrice,
      });
    }
  };

  const handleShare = () => {
    const shareUrl = typeof window !== "undefined" ? window.location.href : "";
    navigator.clipboard.writeText(shareUrl);
  };

  // Hide Add to Cart and Buy Now if size is not in stock
  if (!isSizeInStock && stock > 0) {
    return (
      <div className="space-y-3">
        {/* Only show wishlist button if size is out of stock */}
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={handleWishlistToggle}
            variant="outline"
            className={`flex items-center justify-center gap-2 rounded-none h-12 uppercase tracking-widest w-full ${
              inWishlist
                ? "bg-secondary text-foreground"
                : ""
            }`}
            size="lg"
            aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              className={`w-4 h-4 ${inWishlist ? "fill-current" : ""}`}
            />
            <span className="hidden sm:inline">
              {inWishlist ? "SAVED" : "SAVE FOR LATER"}
            </span>
          </Button>
        </div>
        <Button
          onClick={handleShare}
          variant="ghost"
          className="w-full rounded-none text-xs font-mono uppercase tracking-widest h-10"
          aria-label="Copy link"
        >
          <Share2 className="w-3 h-3 mr-2" />
          Copy Link
        </Button>
        {/* Login Dialog */}
        <LoginDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Main action buttons */}
      <div className="flex gap-2">
        <Button
          onClick={handleAddToCart}
          disabled={stock === 0 || isAddingToCart}
          className="flex-1 rounded-none h-12 uppercase tracking-widest text-base disabled:opacity-50"
          size="lg"
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          {isAddingToCart
            ? "ADDING..."
            : stock === 0
            ? "SOLD OUT"
            : "ADD TO CART"}
        </Button>

        <Button
          onClick={handleWishlistToggle}
          variant="outline"
          className={`flex-shrink-0 w-12 h-12 rounded-none items-center justify-center ${
            inWishlist ? "bg-secondary" : ""
          }`}
          aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            className={`w-5 h-5 ${inWishlist ? "fill-foreground" : ""}`}
          />
        </Button>
      </div>

      {/* Share button */}
      <Button
        onClick={handleShare}
        variant="ghost"
        className="w-full rounded-none text-xs font-mono uppercase tracking-widest h-10"
        aria-label="Copy link"
      >
        <Share2 className="w-3 h-3 mr-2" />
        Copy Link
      </Button>
      
      {/* Login Dialog */}
      <LoginDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} />
    </div>
  );
}
