"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Order, OrderStatus } from "@shared/orders";
import { Button } from "@/components/ui/button";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = months[date.getMonth()];
  const day = date.getDate().toString().padStart(2, "0");
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${month} ${day}, ${year} ${hours}:${minutes}`;
};

export default function OrderDetailsPage() {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  useEffect(() => {
    loadOrder();
  }, [id]);

  const loadOrder = async () => {
    try {
      const data = await api.admin.orders.getById(id);
      setOrder(data.order);
    } catch (error) {
      console.error("Failed to load order", error);
      router.push("/admin/orders");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!order) return;
    setIsUpdating(true);
    try {
      // @ts-ignore - enum vs string issues
      await api.admin.orders.updateStatus(order.id, { status: newStatus });
      await loadOrder();
    } catch (error) {
      console.error("Failed to update status", error);
      alert("Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading || !order) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
        <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push("/admin/orders")}>
                <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
                <h1 className="text-3xl font-bold tracking-tight uppercase">Order Details</h1>
                <p className="text-muted-foreground font-mono text-xs">
                    ID: {order.id}
                </p>
            </div>
        </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Order Info */}
        <div className="space-y-6">
            <div className="border-2 border-black p-6 space-y-4">
                <h3 className="font-bold uppercase border-b border-black pb-2">Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-muted-foreground">Date Placed</div>
                    <div className="font-medium">{formatDate(order.createdAt)}</div>
                    
                    <div className="text-muted-foreground">Customer</div>
                    <div className="font-medium">{order.user?.email || "Guest"}</div>
                    
                    <div className="text-muted-foreground">Payment Status</div>
                    <div className="font-medium">{order.status}</div>
                </div>
            </div>

            <div className="border-2 border-black p-6 space-y-4">
                <h3 className="font-bold uppercase border-b border-black pb-2">Shipping Address</h3>
                <div className="text-sm space-y-1">
                    <p>{order.shippingAddress.street}</p>
                    <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                    <p>{order.shippingAddress.country}</p>
                </div>
            </div>
        </div>

        {/* Order Actions & Items */}
        <div className="space-y-6">
             <div className="border-2 border-black p-6 space-y-4">
                <h3 className="font-bold uppercase border-b border-black pb-2">Order Status</h3>
                <div className="flex items-center gap-4">
                    <select 
                        className="h-10 w-full border-2 border-black bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={order.status}
                        onChange={(e) => handleStatusChange(e.target.value)}
                        disabled={isUpdating}
                    >
                        {Object.values(OrderStatus).map((status) => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="border-2 border-black p-6 space-y-4">
                <h3 className="font-bold uppercase border-b border-black pb-2">Order Items</h3>
                <div className="space-y-4">
                    {order.items?.map((item) => (
                        <div key={item.id} className="flex items-start justify-between border-b pb-4 last:border-0 last:pb-0">
                            <div className="space-y-1">
                                <p className="font-bold text-sm">{item.productName}</p>
                                {item.productVariant && (
                                    <p className="text-xs text-muted-foreground">
                                        Size: {item.productVariant.size} | Color: {item.productVariant.color}
                                    </p>
                                )}
                                <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                            </div>
                            <div className="font-mono text-sm">
                                ${(item.price * item.quantity).toFixed(2)}
                            </div>
                        </div>
                    ))}
                    <div className="flex justify-between border-t border-black pt-4 font-bold">
                        <span>Total</span>
                        <span>${order.totalAmount.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

