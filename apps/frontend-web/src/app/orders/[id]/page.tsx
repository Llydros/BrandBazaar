"use client";

import { useParams } from "next/navigation";
import { useOrder } from "@/hooks/use-order";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { OrderItem } from "@shared/orders";

export default function OrderDetailsPage() {
  const params = useParams();
  const id = params?.id as string | undefined;
  const { data: order, isLoading } = useOrder(id ?? null);

  if (isLoading || !order) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <p className="text-muted-foreground">Loading order...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 space-y-6">
        <div className="flex items-baseline justify-between">
          <h1 className="text-3xl font-bold uppercase tracking-wider">
            Order #{order.id.slice(0, 8)}
          </h1>
          <span className="text-sm uppercase tracking-wide text-muted-foreground">
            {order.status.replace(/_/g, " ")}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="rounded-none lg:col-span-2">
            <CardHeader>
              <CardTitle className="uppercase tracking-wider text-sm">
                Items
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {order.items?.map((item: OrderItem) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="space-y-1">
                    <div className="font-semibold">{item.productName}</div>
                    <div className="text-muted-foreground">
                      Qty {item.quantity}
                    </div>
                  </div>
                  <div className="font-semibold">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-none">
            <CardHeader>
              <CardTitle className="uppercase tracking-wider text-sm">
                Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total</span>
                <span className="font-semibold">
                  ${Number(order.totalAmount).toFixed(2)}
                </span>
              </div>
              <Separator />
              <div className="space-y-1 text-sm">
                <div className="font-semibold">Shipping Address</div>
                <div>{order.shippingAddress.street}</div>
                <div>
                  {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                  {order.shippingAddress.zipCode}
                </div>
                <div>{order.shippingAddress.country}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

