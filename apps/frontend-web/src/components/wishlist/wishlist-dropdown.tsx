"use client";

import { useWishlist } from "@/contexts/wishlist-context";
import { Button } from "@/components/ui/button";
import { Heart, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";

export function WishlistDropdown() {
  const { items, removeItem, totalItems } = useWishlist();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative cursor-pointer"
        aria-label="Wishlist"
      >
        <Heart className="h-5 w-5" />
        {totalItems > 0 && (
          <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {totalItems > 9 ? "9+" : totalItems}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-4 w-96 bg-background border rounded-none shadow-lg z-50 max-h-[80vh] flex flex-col">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold uppercase tracking-wider">
                Wishlist ({totalItems})
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {items.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm uppercase tracking-wider">
                  Your wishlist is empty
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {items.slice(0, 5).map((item) => (
                  <div key={item.productId} className="p-4 flex gap-4">
                    <Link
                      href={`/explore/${item.productId}`}
                      onClick={() => setIsOpen(false)}
                      className="relative w-20 h-20 flex-shrink-0 bg-muted rounded-none"
                    >
                      {item.image && (
                        <Image
                          src={item.image}
                          alt={item.productName}
                          fill
                          className="object-cover"
                        />
                      )}
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/explore/${item.productId}`}
                        onClick={() => setIsOpen(false)}
                        className="block"
                      >
                        <h4 className="font-medium text-sm uppercase tracking-wide truncate mb-1">
                          {item.productName}
                        </h4>
                      </Link>
                      <p className="text-sm text-muted-foreground mb-2">
                        ${item.price.toFixed(2)}
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => removeItem(item.productId)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {items.length > 5 && (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    +{items.length - 5} more items
                  </div>
                )}
              </div>
            )}
          </div>

          {items.length > 0 && (
            <div className="p-4 border-t">
              <Link href="/wishlist" onClick={() => setIsOpen(false)}>
                <Button className="w-full rounded-none uppercase tracking-widest h-12">
                  View Wishlist
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

