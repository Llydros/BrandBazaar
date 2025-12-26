"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Order } from "@shared/orders";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { useRouter } from "next/navigation";

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

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await api.admin.orders.getAll({ limit: 50 });
      setOrders(data.orders);
    } catch (error) {
      console.error("Failed to load orders", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAID": return "text-green-600";
      case "PENDING_PAYMENT": return "text-yellow-600";
      case "PROCESSING": return "text-blue-600";
      case "SHIPPED": return "text-blue-600";
      case "DELIVERED": return "text-green-600";
      case "CANCELLED": return "text-red-600";
      default: return "text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight uppercase">Orders</h1>
          <p className="text-muted-foreground">
            Manage customer orders and fulfillment.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div>Loading orders...</div>
      ) : (
        <div className="border-2 border-black">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 [&_tr]:border-b">
              <tr className="border-b border-black transition-colors hover:bg-muted/50">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground uppercase">
                  Order ID
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground uppercase">
                  Date
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground uppercase">
                  Customer
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground uppercase">
                  Status
                </th>
                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground uppercase">
                  Total
                </th>
                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-black transition-colors hover:bg-muted/50"
                >
                  <td className="p-4 align-middle font-mono text-xs">
                    {order.id}
                  </td>
                  <td className="p-4 align-middle">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="p-4 align-middle">
                    {order.user?.email || "Guest"}
                  </td>
                  <td className="p-4 align-middle font-bold">
                    <span className={getStatusColor(order.status)}>
                        {order.status}
                    </span>
                  </td>
                  <td className="p-4 align-middle text-right font-mono">
                    ${order.totalAmount.toFixed(2)}
                  </td>
                  <td className="p-4 align-middle text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/admin/orders/${order.id}`)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                  <tr>
                      <td colSpan={6} className="p-8 text-center text-muted-foreground">
                          No orders found.
                      </td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

