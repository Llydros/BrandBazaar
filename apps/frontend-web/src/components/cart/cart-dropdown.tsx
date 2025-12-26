"use client";

import { useCart } from "@/contexts/cart-context";
import { Button } from "@/components/ui/button";
import { ShoppingCart, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { getImageUrl } from "@/lib/utils";

export function CartDropdown() {
  const { items, removeItem, updateQuantity, totalItems, totalPrice } =
    useCart();
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
        aria-label="Cart"
      >
        <ShoppingCart className="h-5 w-5" />
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
                Cart ({totalItems})
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
                <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm uppercase tracking-wider">
                  Your cart is empty
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {items.map((item) => (
                  <div key={item.productVariantId} className="p-4 flex gap-4">
                    <Link
                      href={`/explore/${item.productId}`}
                      onClick={() => setIsOpen(false)}
                      className="relative w-20 h-20 flex-shrink-0 bg-muted rounded-none"
                    >
                      {item.image && (
                        <Image
                          src={getImageUrl(item.image)}
                          alt={item.productName}
                          fill
                          className="object-cover"
                          unoptimized={true}
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
                        ${item.price.toFixed(2)} × {item.quantity}
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center border rounded-none">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 rounded-none"
                            onClick={() =>
                              updateQuantity(item.productVariantId, item.quantity - 1)
                            }
                          >
                            <span className="text-xs">−</span>
                          </Button>
                          <span className="px-2 text-sm min-w-[2rem] text-center">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 rounded-none"
                            onClick={() =>
                              updateQuantity(item.productVariantId, item.quantity + 1)
                            }
                          >
                            <span className="text-xs">+</span>
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 ml-auto"
                          onClick={() => removeItem(item.productVariantId)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {items.length > 0 && (
            <div className="p-4 border-t space-y-3">
              <div className="flex items-center justify-between text-lg font-semibold">
                <span className="uppercase tracking-wider">Total</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <Link href="/cart" onClick={() => setIsOpen(false)}>
                <Button className="w-full rounded-none uppercase tracking-widest h-12">
                  View Cart
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
