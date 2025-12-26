"use client";

import { useMemo } from "react";
import { useWishlist } from "../../contexts/WishlistContext";
import { Heart } from "lucide-react";

export default function WishlistButton({ productId }: { productId: string }) {
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const inList = useMemo(() => wishlist.includes(productId), [wishlist, productId]);

  return (
    <button
      aria-label={inList ? "Remove from wishlist" : "Add to wishlist"}
      onClick={() => (inList ? removeFromWishlist(productId) : addToWishlist(productId))}
      className={`rounded-none px-4 py-3 text-sm font-mono uppercase tracking-widest border-2 transition-colors flex items-center gap-2
        ${inList 
          ? "bg-foreground text-background border-foreground hover:bg-background hover:text-foreground" 
          : "bg-background text-foreground border-foreground hover:bg-foreground hover:text-background"}`}
    >
      <Heart className={`w-4 h-4 ${inList ? "fill-background" : ""}`} />
      {inList ? "Remove" : "Add"}
    </button>
  );
}
