"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ShoppingCart, X, Plus, Minus, ArrowRight } from "lucide-react";
import { useCart } from "@/contexts/cart-context";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginDialog } from "@/components/auth/login-dialog";
import { getImageUrl } from "@/lib/utils";

export default function CartPage() {
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
  } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  const handleCheckout = () => {
    if (!user) {
      setShowLoginDialog(true);
      return;
    }
    router.push("/checkout");
  };

  const subtotal = totalPrice;
  const shipping = subtotal > 0 ? 10 : 0;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8 uppercase tracking-wider">
          Shopping Cart
        </h1>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingCart className="h-24 w-24 mx-auto mb-6 opacity-50" />
            <h2 className="text-2xl font-semibold mb-4 uppercase tracking-wider">
              Your cart is empty
            </h2>
            <p className="text-muted-foreground mb-8">
              Start adding items to your cart to see them here.
            </p>
            <Link href="/products">
              <Button className="rounded-none uppercase tracking-widest h-12 px-8">
                Continue Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold uppercase tracking-wider">
                  Items ({totalItems})
                </h2>
                <Button
                  variant="ghost"
                  onClick={clearCart}
                  className="text-sm uppercase tracking-wider text-muted-foreground hover:text-foreground"
                >
                  Clear Cart
                </Button>
              </div>

              <div className="space-y-4">
                {items.map((item) => (
                  <Card key={item.productVariantId} className="rounded-none">
                    <CardContent className="p-6">
                      <div className="flex gap-6">
                        <Link
                          href={`/explore/${item.productId}`}
                          className="relative w-32 h-32 flex-shrink-0 bg-muted rounded-none"
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
                          <Link href={`/explore/${item.productId}`}>
                            <h3 className="text-lg font-semibold uppercase tracking-wide mb-2 hover:underline">
                              {item.productName}
                            </h3>
                          </Link>
                          <p className="text-muted-foreground mb-4">
                            ${item.price.toFixed(2)} each
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center border rounded-none">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-none"
                                onClick={() =>
                                  updateQuantity(
                                    item.productVariantId,
                                    item.quantity - 1
                                  )
                                }
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="px-4 text-sm min-w-[3rem] text-center">
                                {item.quantity}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-none"
                                onClick={() =>
                                  updateQuantity(
                                    item.productVariantId,
                                    item.quantity + 1
                                  )
                                }
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="flex items-center gap-4">
                              <p className="text-lg font-semibold">
                                ${(item.price * item.quantity).toFixed(2)}
                              </p>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeItem(item.productVariantId)}
                                className="text-muted-foreground hover:text-foreground"
                              >
                                <X className="h-5 w-5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="lg:col-span-1">
              <Card className="rounded-none sticky top-24">
                <CardHeader>
                  <CardTitle className="text-xl uppercase tracking-wider">
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      <span>
                        {shipping > 0 ? `$${shipping.toFixed(2)}` : "Free"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tax</span>
                      <span>${tax.toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-3 flex justify-between text-lg font-semibold">
                      <span className="uppercase tracking-wider">Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>

                  <Button
                    onClick={handleCheckout}
                    className="w-full rounded-none uppercase tracking-widest h-12 mt-6"
                    disabled={items.length === 0}
                  >
                    Proceed to Checkout
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>

                  <Link href="/products">
                    <Button
                      variant="outline"
                      className="w-full rounded-none uppercase tracking-widest h-12"
                    >
                      Continue Shopping
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      <LoginDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} />
    </main>
  );
}

