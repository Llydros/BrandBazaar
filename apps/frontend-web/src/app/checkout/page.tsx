"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { LoginDialog } from "@/components/auth/login-dialog";
import { AddressSelector } from "@/components/checkout/address-selector";
import { PaymentSelector } from "@/components/checkout/payment-selector";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useCart } from "@/contexts/cart-context";
import { useCreateOrder } from "@/hooks/use-order";
import { api } from "@/lib/api";
import { CreateAddressRequest } from "@shared/addresses";
import { CreatePaymentMethodRequest } from "@shared/payment-methods";

export default function CheckoutPage() {
  const { items, clearCart, totalPrice } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [addressId, setAddressId] = useState<string | null>(null);
  const [paymentMethodId, setPaymentMethodId] = useState<string | null>(null);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showAddressDialog, setShowAddressDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  
  const [addressFormData, setAddressFormData] = useState<CreateAddressRequest>({
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    label: "",
    isDefault: false,
  });
  
  const [paymentFormData, setPaymentFormData] = useState<CreatePaymentMethodRequest>({
    type: "card",
    last4: "",
    brand: "card",
    expiryMonth: undefined,
    expiryYear: undefined,
    holderName: "",
    isDefault: false,
  });
  const [cardNumber, setCardNumber] = useState("");
  const [cvv, setCvv] = useState("");

  const queryClient = useQueryClient();

  const addressesQuery = useQuery({
    queryKey: ["addresses"],
    queryFn: () => api.addresses.getAll(),
  });
  const paymentMethodsQuery = useQuery({
    queryKey: ["payment-methods"],
    queryFn: () => api.paymentMethods.getAll(),
  });

  useEffect(() => {
    if (items.length === 0) {
      router.replace("/cart");
    }
  }, [items.length, router]);

  const { mutateAsync: createOrder, isPending: isPlacingOrder } =
    useCreateOrder();

  const createAddressMutation = useMutation({
    mutationFn: (data: CreateAddressRequest) => api.addresses.create(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      setAddressId(response.address.id);
      setShowAddressDialog(false);
      setAddressFormData({
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "",
        label: "",
        isDefault: false,
      });
    },
  });

  const createPaymentMutation = useMutation({
    mutationFn: (data: CreatePaymentMethodRequest) =>
      api.paymentMethods.create(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["payment-methods"] });
      setPaymentMethodId(response.paymentMethod.id);
      setShowPaymentDialog(false);
      setPaymentFormData({
        type: "card",
        last4: "",
        brand: "card",
        expiryMonth: undefined,
        expiryYear: undefined,
        holderName: "",
        isDefault: false,
      });
      setCardNumber("");
      setCvv("");
    },
  });

  const totals = useMemo(() => {
    const subtotal = totalPrice;
    const shipping = subtotal > 0 ? 10 : 0;
    const tax = subtotal * 0.1;
    const total = subtotal + shipping + tax;
    return { subtotal, shipping, tax, total };
  }, [totalPrice]);

  const handlePlaceOrder = async () => {
    if (!user) {
      setShowLoginDialog(true);
      return;
    }
    const selectedAddress = addressesQuery.data?.addresses.find(
      (addr) => addr.id === addressId
    );
    if (!selectedAddress) {
      alert("Please select a shipping address");
      return;
    }
    if (!paymentMethodId) {
      alert("Please select a payment method");
      return;
    }
    try {
      const order = await createOrder({
        shippingAddress: {
          street: selectedAddress.street,
          city: selectedAddress.city,
          state: selectedAddress.state,
          zipCode: selectedAddress.zipCode,
          country: selectedAddress.country,
        },
        items: items.map((item) => ({
          productVariantId: item.productVariantId,
          productName: item.productName,
          price: item.price,
          quantity: item.quantity,
        })),
        totalAmount: totals.total,
      });
      clearCart();
      router.push(`/orders/${order.id}`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to place order";
      alert(message);
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8 uppercase tracking-wider">
          Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Dialog open={showAddressDialog} onOpenChange={setShowAddressDialog}>
              <AddressSelector
                value={addressId}
                onChange={setAddressId}
                headerAction={
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-none uppercase tracking-wider"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </DialogTrigger>
                }
              />
              <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="uppercase">Add Address</DialogTitle>
                  </DialogHeader>
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      await createAddressMutation.mutateAsync(addressFormData);
                    }}
                    className="space-y-4"
                  >
                    <div className="grid gap-2">
                      <Label htmlFor="label" className="uppercase text-xs font-bold">
                        Label (Optional)
                      </Label>
                      <Input
                        id="label"
                        value={addressFormData.label}
                        onChange={(e) =>
                          setAddressFormData({
                            ...addressFormData,
                            label: e.target.value,
                          })
                        }
                        className="rounded-none"
                        placeholder="Home, Work, etc."
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="street" className="uppercase text-xs font-bold">
                        Street
                      </Label>
                      <Input
                        id="street"
                        value={addressFormData.street}
                        onChange={(e) =>
                          setAddressFormData({
                            ...addressFormData,
                            street: e.target.value,
                          })
                        }
                        className="rounded-none"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="city" className="uppercase text-xs font-bold">
                        City
                      </Label>
                      <Input
                        id="city"
                        value={addressFormData.city}
                        onChange={(e) =>
                          setAddressFormData({
                            ...addressFormData,
                            city: e.target.value,
                          })
                        }
                        className="rounded-none"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="state" className="uppercase text-xs font-bold">
                        State
                      </Label>
                      <Input
                        id="state"
                        value={addressFormData.state}
                        onChange={(e) =>
                          setAddressFormData({
                            ...addressFormData,
                            state: e.target.value,
                          })
                        }
                        className="rounded-none"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="zipCode" className="uppercase text-xs font-bold">
                        Zip Code
                      </Label>
                      <Input
                        id="zipCode"
                        value={addressFormData.zipCode}
                        onChange={(e) =>
                          setAddressFormData({
                            ...addressFormData,
                            zipCode: e.target.value,
                          })
                        }
                        className="rounded-none"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="country" className="uppercase text-xs font-bold">
                        Country
                      </Label>
                      <Input
                        id="country"
                        value={addressFormData.country}
                        onChange={(e) =>
                          setAddressFormData({
                            ...addressFormData,
                            country: e.target.value,
                          })
                        }
                        className="rounded-none"
                        required
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="isDefault"
                        checked={addressFormData.isDefault}
                        onChange={(e) =>
                          setAddressFormData({
                            ...addressFormData,
                            isDefault: e.target.checked,
                          })
                        }
                        className="rounded-none"
                      />
                      <Label htmlFor="isDefault" className="uppercase text-xs font-bold">
                        Set as default
                      </Label>
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button
                        type="submit"
                        className="rounded-none uppercase tracking-wider flex-1"
                        disabled={createAddressMutation.isPending}
                      >
                        {createAddressMutation.isPending ? "Adding..." : "Add"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-none uppercase tracking-wider"
                        onClick={() => setShowAddressDialog(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </DialogContent>
            </Dialog>

            <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
              <PaymentSelector
                value={paymentMethodId}
                onChange={setPaymentMethodId}
                headerAction={
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-none uppercase tracking-wider"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </DialogTrigger>
                }
              />
              <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="uppercase">Add Payment Method</DialogTitle>
                  </DialogHeader>
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const cardNumberDigits = cardNumber.replace(/\s/g, "");
                      if (cardNumberDigits.length < 4) {
                        alert("Please enter a valid card number");
                        return;
                      }
                      const last4 = cardNumberDigits.slice(-4);
                      await createPaymentMutation.mutateAsync({
                        ...paymentFormData,
                        last4,
                      });
                    }}
                    className="space-y-4"
                  >
                    <div className="grid gap-2">
                      <Label htmlFor="cardNumber" className="uppercase text-xs font-bold">
                        Card Number
                      </Label>
                      <Input
                        id="cardNumber"
                        type="text"
                        value={cardNumber}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\s/g, "");
                          if (value.length <= 16 && /^\d*$/.test(value)) {
                            const formatted = value.match(/.{1,4}/g)?.join(" ") || value;
                            setCardNumber(formatted);
                          }
                        }}
                        className="rounded-none"
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="holderName" className="uppercase text-xs font-bold">
                        Cardholder Name
                      </Label>
                      <Input
                        id="holderName"
                        value={paymentFormData.holderName}
                        onChange={(e) =>
                          setPaymentFormData({
                            ...paymentFormData,
                            holderName: e.target.value,
                          })
                        }
                        className="rounded-none"
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="expiryMonth" className="uppercase text-xs font-bold">
                          Expiration Month
                        </Label>
                        <Input
                          id="expiryMonth"
                          type="number"
                          min="1"
                          max="12"
                          value={paymentFormData.expiryMonth || ""}
                          onChange={(e) =>
                            setPaymentFormData({
                              ...paymentFormData,
                              expiryMonth: e.target.value
                                ? parseInt(e.target.value)
                                : undefined,
                            })
                          }
                          className="rounded-none"
                          placeholder="MM"
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="expiryYear" className="uppercase text-xs font-bold">
                          Expiration Year
                        </Label>
                        <Input
                          id="expiryYear"
                          type="number"
                          min="2024"
                          value={paymentFormData.expiryYear || ""}
                          onChange={(e) =>
                            setPaymentFormData({
                              ...paymentFormData,
                              expiryYear: e.target.value
                                ? parseInt(e.target.value)
                                : undefined,
                            })
                          }
                          className="rounded-none"
                          placeholder="YYYY"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="cvv" className="uppercase text-xs font-bold">
                        CVV
                      </Label>
                      <Input
                        id="cvv"
                        type="text"
                        value={cvv}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "");
                          if (value.length <= 4) {
                            setCvv(value);
                          }
                        }}
                        className="rounded-none"
                        placeholder="123"
                        maxLength={4}
                        required
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="isDefaultPayment"
                        checked={paymentFormData.isDefault}
                        onChange={(e) =>
                          setPaymentFormData({
                            ...paymentFormData,
                            isDefault: e.target.checked,
                          })
                        }
                        className="rounded-none"
                      />
                      <Label htmlFor="isDefaultPayment" className="uppercase text-xs font-bold">
                        Set as default
                      </Label>
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button
                        type="submit"
                        className="rounded-none uppercase tracking-wider flex-1"
                        disabled={createPaymentMutation.isPending}
                      >
                        {createPaymentMutation.isPending ? "Adding..." : "Add"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-none uppercase tracking-wider"
                        onClick={() => setShowPaymentDialog(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </DialogContent>
            </Dialog>
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
                    <span>${totals.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>
                      {totals.shipping > 0
                        ? `$${totals.shipping.toFixed(2)}`
                        : "Free"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span>${totals.tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between text-lg font-semibold">
                    <span className="uppercase tracking-wider">Total</span>
                    <span>${totals.total.toFixed(2)}</span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.productId}
                      className="flex justify-between text-sm"
                    >
                      <span className="text-muted-foreground">
                        {item.productName} × {item.quantity}
                      </span>
                      <span>
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <Button
                  className="w-full rounded-none uppercase tracking-widest h-12 mt-4"
                  disabled={
                    isPlacingOrder ||
                    items.length === 0 ||
                    addressesQuery.isLoading ||
                    paymentMethodsQuery.isLoading
                  }
                  onClick={handlePlaceOrder}
                >
                  {isPlacingOrder ? "Placing order..." : "Place Order"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <LoginDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} />
    </main>
  );
}

