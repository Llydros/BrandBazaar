import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { CreateOrderRequest, Order } from "@shared/orders";

export function useCreateOrder() {
  return useMutation({
    mutationFn: async (data: CreateOrderRequest) => {
      const response = await api.orders.create(data);
      return response.order;
    },
  });
}

export function useOrder(orderId: string | null) {
  return useQuery({
    queryKey: ["order", orderId],
    enabled: !!orderId,
    queryFn: async (): Promise<Order> => {
      if (!orderId) throw new Error("orderId is required");
      const response = await api.orders.getMyOrder(orderId);
      return response.order;
    },
  });
}

