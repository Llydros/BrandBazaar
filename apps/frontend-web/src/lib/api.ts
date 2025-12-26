import {
  AuthResponse,
  LogoutResponse,
  RegisterRequest,
  LoginRequest,
  User,
} from "@shared/auth";
import {
  Product,
  ProductWithReviews,
  Review,
  CreateReviewRequest,
} from "@shared/products";
import { Order, UpdateOrderStatusRequest } from "@shared/orders";
import {
  Address,
  CreateAddressRequest,
  UpdateAddressRequest,
} from "@shared/addresses";
import {
  PaymentMethod,
  CreatePaymentMethodRequest,
  UpdatePaymentMethodRequest,
} from "@shared/payment-methods";
import {
  Raffle,
  CreateRaffleRequest,
  UpdateRaffleRequest,
} from "@shared/raffles";
import type {
  DashboardResponse,
} from "@shared/admin";
import { z } from "zod";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8080";

class ApiError extends Error {
  constructor(message: string, public status: number, public response?: any) {
    super(message);
    this.name = "ApiError";
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch((err: unknown) => ({
      message: err instanceof Error ? err.message : "Unknown error",
    }));
    throw new ApiError(
      error?.message || `HTTP ${response.status}`,
      response.status,
      error
    );
  }
  return response.json();
}

//#region hamza: move to shared
export enum OrderStatus {
  PENDING_PAYMENT = "PENDING_PAYMENT",
  PAID = "PAID",
  PROCESSING = "PROCESSING",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
}

export const ShippingAddressSchema = z.object({
  street: z.string(),
  city: z.string(),
  state: z.string(),
  zipCode: z.string(),
  country: z.string(),
});
export type ShippingAddress = z.infer<typeof ShippingAddressSchema>;

export const CheckoutItemSchema = z.object({
  productVariantId: z.string(),
  productName: z.string(),
  price: z.number(),
  quantity: z.number().int().positive(),
});
export type CheckoutItem = z.infer<typeof CheckoutItemSchema>;

export const CreateOrderRequestSchema = z.object({
  shippingAddress: ShippingAddressSchema,
  items: z.array(CheckoutItemSchema).min(1),
  totalAmount: z.number().positive(),
});
export type CreateOrderRequest = z.infer<typeof CreateOrderRequestSchema>;

export interface OrderItem {
  id: string;
  orderId: string;
  productVariantId: string;
  productName: string;
  quantity: number;
  price: number;
}
//#endregion

export const api = {
  auth: {
    async register(data: RegisterRequest): Promise<AuthResponse> {
      const response = await fetch(`${BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });
      return handleResponse<AuthResponse>(response);
    },

    async login(data: LoginRequest): Promise<AuthResponse> {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });
      return handleResponse<AuthResponse>(response);
    },

    async logout(): Promise<LogoutResponse> {
      const response = await fetch(`${BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      return handleResponse<LogoutResponse>(response);
    },

    async getMe(): Promise<{ user: User | null }> {
      const response = await fetch(`${BASE_URL}/auth/me`, {
        method: "GET",
        credentials: "include",
      });
      return handleResponse<{ user: User | null }>(response);
    },

    async heartbeat(): Promise<{ success: boolean }> {
      const response = await fetch(`${BASE_URL}/auth/heartbeat`, {
        method: "POST",
        credentials: "include",
      });
      return handleResponse<{ success: boolean }>(response);
    },
  },

  products: {
    async getAll(params?: {
      category?: string;
      limit?: number;
      offset?: number;
      search?: string;
      inStock?: boolean;
      sortBy?: string;
      sortOrder?: "ASC" | "DESC";
    }): Promise<{ products: Product[]; total: number }> {
      const queryParams = new URLSearchParams();
      if (params?.category) queryParams.append("category", params.category);
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.offset)
        queryParams.append("offset", params.offset.toString());
      if (params?.search) queryParams.append("search", params.search);
      if (params?.inStock !== undefined)
        queryParams.append("inStock", params.inStock.toString());
      if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
      if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);

      const response = await fetch(
        `${BASE_URL}/products${
          queryParams.toString() ? `?${queryParams}` : ""
        }`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      return handleResponse<{ products: Product[]; total: number }>(response);
    },

    async getById(id: string): Promise<{ product: ProductWithReviews }> {
      const response = await fetch(`${BASE_URL}/products/${id}`, {
        method: "GET",
        credentials: "include",
      });
      return handleResponse<{ product: ProductWithReviews }>(response);
    },

    async createReview(
      productId: string,
      data: CreateReviewRequest
    ): Promise<{ review: Review }> {
      const response = await fetch(
        `${BASE_URL}/products/${productId}/reviews`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(data),
        }
      );
      return handleResponse<{ review: Review }>(response);
    },

    async getReviews(productId: string): Promise<{ reviews: Review[] }> {
      const response = await fetch(
        `${BASE_URL}/products/${productId}/reviews`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      return handleResponse<{ reviews: Review[] }>(response);
    },

    async getRecommendations(
      productId: string,
      limit?: number
    ): Promise<{ products: Product[] }> {
      const queryParams = new URLSearchParams();
      if (limit) queryParams.append("limit", limit.toString());

      const response = await fetch(
        `${BASE_URL}/products/${productId}/recommendations${
          queryParams.toString() ? `?${queryParams}` : ""
        }`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      return handleResponse<{ products: Product[] }>(response);
    },
  },

  admin: {
    users: {
      async getAll(params?: {
        limit?: number;
        offset?: number;
      }): Promise<{ users: User[]; total: number }> {
        const queryParams = new URLSearchParams();
        if (params?.limit) queryParams.append("limit", params.limit.toString());
        if (params?.offset)
          queryParams.append("offset", params.offset.toString());

        const response = await fetch(
          `${BASE_URL}/users${queryParams.toString() ? `?${queryParams}` : ""}`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        return handleResponse<{ users: User[]; total: number }>(response);
      },
    },
    products: {
      async create(data: any): Promise<{ product: Product }> {
        const response = await fetch(`${BASE_URL}/products`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(data),
        });
        return handleResponse<{ product: Product }>(response);
      },
      async update(id: string, data: any): Promise<{ product: Product }> {
        const response = await fetch(`${BASE_URL}/products/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(data),
        });
        return handleResponse<{ product: Product }>(response);
      },
      async delete(id: string): Promise<void> {
        const response = await fetch(`${BASE_URL}/products/${id}`, {
          method: "DELETE",
          credentials: "include",
        });
        return handleResponse<void>(response);
      },
      async uploadFiles(files: File[]): Promise<{ files: string[] }> {
        const formData = new FormData();
        files.forEach((file) => {
          formData.append("files", file);
        });
        const response = await fetch(`${BASE_URL}/products/upload`, {
          method: "POST",
          credentials: "include",
          body: formData,
        });
        return handleResponse<{ files: string[] }>(response);
      },
    },
    orders: {
      async getAll(params?: {
        limit?: number;
        offset?: number;
        status?: string;
      }): Promise<{ orders: any[] }> {
        const queryParams = new URLSearchParams();
        if (params?.limit) queryParams.append("limit", params.limit.toString());
        if (params?.offset)
          queryParams.append("offset", params.offset.toString());
        if (params?.status) queryParams.append("status", params.status);

        const response = await fetch(
          `${BASE_URL}/orders${
            queryParams.toString() ? `?${queryParams}` : ""
          }`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        return handleResponse<{ orders: any[] }>(response);
      },
      async getById(id: string): Promise<{ order: Order }> {
        const response = await fetch(`${BASE_URL}/orders/${id}`, {
          method: "GET",
          credentials: "include",
        });
        return handleResponse<{ order: Order }>(response);
      },
      async updateStatus(
        id: string,
        data: UpdateOrderStatusRequest
      ): Promise<{ order: Order }> {
        const response = await fetch(`${BASE_URL}/orders/${id}/status`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(data),
        });
        return handleResponse<{ order: Order }>(response);
      },
    },
    raffles: {
      async getAll(): Promise<{ raffles: Raffle[] }> {
        const response = await fetch(`${BASE_URL}/admin/raffles`, {
          method: "GET",
          credentials: "include",
        });
        return handleResponse<{ raffles: Raffle[] }>(response);
      },
      async getById(id: string): Promise<{ raffle: Raffle }> {
        const response = await fetch(`${BASE_URL}/raffles/${id}`, {
          method: "GET",
          credentials: "include",
        });
        return handleResponse<{ raffle: Raffle }>(response);
      },
      async create(data: CreateRaffleRequest): Promise<{ raffle: Raffle }> {
        const response = await fetch(`${BASE_URL}/admin/raffles`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(data),
        });
        return handleResponse<{ raffle: Raffle }>(response);
      },
      async update(
        id: string,
        data: UpdateRaffleRequest
      ): Promise<{ raffle: Raffle }> {
        const response = await fetch(`${BASE_URL}/admin/raffles/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(data),
        });
        return handleResponse<{ raffle: Raffle }>(response);
      },
      async delete(id: string): Promise<{ message: string }> {
        const response = await fetch(`${BASE_URL}/admin/raffles/${id}`, {
          method: "DELETE",
          credentials: "include",
        });
        return handleResponse<{ message: string }>(response);
      },
      async uploadFiles(files: File[]): Promise<{ files: string[] }> {
        const formData = new FormData();
        files.forEach((file) => {
          formData.append("files", file);
        });
        const response = await fetch(`${BASE_URL}/admin/raffles/upload`, {
          method: "POST",
          credentials: "include",
          body: formData,
        });
        return handleResponse<{ files: string[] }>(response);
      },
    },
    dashboard: {
      async getStats(): Promise<DashboardResponse> {
        const response = await fetch(`${BASE_URL}/admin/dashboard`, {
          method: "GET",
          credentials: "include",
        });
        return handleResponse<DashboardResponse>(response);
      },
    },
  },

  orders: {
    async getMyOrders(params?: {
      limit?: number;
      offset?: number;
      status?: string;
    }): Promise<{ orders: Order[] }> {
      const queryParams = new URLSearchParams();
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.offset)
        queryParams.append("offset", params.offset.toString());
      if (params?.status) queryParams.append("status", params.status);

      const response = await fetch(
        `${BASE_URL}/orders/me${
          queryParams.toString() ? `?${queryParams}` : ""
        }`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      return handleResponse<{ orders: Order[] }>(response);
    },
    async getMyOrder(id: string): Promise<{ order: Order }> {
      const response = await fetch(`${BASE_URL}/orders/me/${id}`, {
        method: "GET",
        credentials: "include",
      });
      return handleResponse<{ order: Order }>(response);
    },

    async getById(id: string): Promise<{ order: Order }> {
      const response = await fetch(`${BASE_URL}/orders/${id}`, {
        method: "GET",
        credentials: "include",
      });
      return handleResponse<{ order: Order }>(response);
    },

    async create(data: CreateOrderRequest): Promise<{ order: Order }> {
      const parsed = CreateOrderRequestSchema.parse(data);
      const response = await fetch(`${BASE_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(parsed),
      });
      return handleResponse<{ order: Order }>(response);
    },
  },

  addresses: {
    async getAll(): Promise<{ addresses: Address[] }> {
      const response = await fetch(`${BASE_URL}/addresses`, {
        method: "GET",
        credentials: "include",
      });
      return handleResponse<{ addresses: Address[] }>(response);
    },
    async getById(id: string): Promise<{ address: Address }> {
      const response = await fetch(`${BASE_URL}/addresses/${id}`, {
        method: "GET",
        credentials: "include",
      });
      return handleResponse<{ address: Address }>(response);
    },
    async create(data: CreateAddressRequest): Promise<{ address: Address }> {
      const response = await fetch(`${BASE_URL}/addresses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });
      return handleResponse<{ address: Address }>(response);
    },
    async update(
      id: string,
      data: UpdateAddressRequest
    ): Promise<{ address: Address }> {
      const response = await fetch(`${BASE_URL}/addresses/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });
      return handleResponse<{ address: Address }>(response);
    },
    async delete(id: string): Promise<{ message: string }> {
      const response = await fetch(`${BASE_URL}/addresses/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      return handleResponse<{ message: string }>(response);
    },
  },

  paymentMethods: {
    async getAll(): Promise<{ paymentMethods: PaymentMethod[] }> {
      const response = await fetch(`${BASE_URL}/payment-methods`, {
        method: "GET",
        credentials: "include",
      });
      return handleResponse<{ paymentMethods: PaymentMethod[] }>(response);
    },
    async getById(id: string): Promise<{ paymentMethod: PaymentMethod }> {
      const response = await fetch(`${BASE_URL}/payment-methods/${id}`, {
        method: "GET",
        credentials: "include",
      });
      return handleResponse<{ paymentMethod: PaymentMethod }>(response);
    },
    async create(
      data: CreatePaymentMethodRequest
    ): Promise<{ paymentMethod: PaymentMethod }> {
      const response = await fetch(`${BASE_URL}/payment-methods`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });
      return handleResponse<{ paymentMethod: PaymentMethod }>(response);
    },
    async update(
      id: string,
      data: UpdatePaymentMethodRequest
    ): Promise<{ paymentMethod: PaymentMethod }> {
      const response = await fetch(`${BASE_URL}/payment-methods/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });
      return handleResponse<{ paymentMethod: PaymentMethod }>(response);
    },
    async delete(id: string): Promise<{ message: string }> {
      const response = await fetch(`${BASE_URL}/payment-methods/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      return handleResponse<{ message: string }>(response);
    },
  },

  raffles: {
    async getAll(): Promise<{ raffles: Raffle[] }> {
      const response = await fetch(`${BASE_URL}/raffles`, {
        method: "GET",
        credentials: "include",
      });
      return handleResponse<{ raffles: Raffle[] }>(response);
    },
    async getById(id: string): Promise<{ raffle: Raffle }> {
      const response = await fetch(`${BASE_URL}/raffles/${id}`, {
        method: "GET",
        credentials: "include",
      });
      return handleResponse<{ raffle: Raffle }>(response);
    },
    async enter(raffleId: string): Promise<{ entry: any }> {
      const response = await fetch(`${BASE_URL}/raffles/${raffleId}/enter`, {
        method: "POST",
        credentials: "include",
      });
      return handleResponse<{ entry: any }>(response);
    },
    async getMyEntries(): Promise<{ entries: any[] }> {
      const response = await fetch(`${BASE_URL}/raffles/entries/my`, {
        method: "GET",
        credentials: "include",
      });
      return handleResponse<{ entries: any[] }>(response);
    },
    async purchase(raffleId: string): Promise<{ entry: any }> {
      const response = await fetch(`${BASE_URL}/raffles/${raffleId}/purchase`, {
        method: "POST",
        credentials: "include",
      });
      return handleResponse<{ entry: any }>(response);
    },
  },
};

export { ApiError };
