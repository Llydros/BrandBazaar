import { z } from "zod";
import { ProductVariantSchema } from "./products";

export enum OrderStatus {
  PENDING_PAYMENT = "PENDING_PAYMENT",
  PAID = "PAID",
  PROCESSING = "PROCESSING",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
}

export const ShippingAddressSchema = z.object({
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  zipCode: z.string().min(1),
  country: z.string().min(1),
});

export type ShippingAddress = z.infer<typeof ShippingAddressSchema>;

export const OrderItemSchema = z.object({
  id: z.string().uuid(),
  orderId: z.string().uuid(),
  productVariantId: z.string().uuid(),
  productVariant: ProductVariantSchema.optional(), // Full object might be populated
  productName: z.string(), // Snapshot of product name at time of order
  quantity: z.number().int().positive(),
  price: z.number().positive(), // Price at time of order
});

export type OrderItem = z.infer<typeof OrderItemSchema>;

export const OrderSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  user: z
    .object({
      id: z.string().uuid(),
      email: z.string().email(),
      fullName: z.string().optional(),
    })
    .optional(),
  status: z.nativeEnum(OrderStatus),
  totalAmount: z.number().positive(),
  shippingAddress: ShippingAddressSchema,
  items: z.array(OrderItemSchema).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Order = z.infer<typeof OrderSchema>;

export const UpdateOrderStatusRequestSchema = z.object({
  status: z.nativeEnum(OrderStatus),
});

export type UpdateOrderStatusRequest = z.infer<
  typeof UpdateOrderStatusRequestSchema
>;

export const CheckoutItemSchema = z.object({
  productVariantId: z.string().uuid(),
  productName: z.string(),
  price: z.number().positive(),
  quantity: z.number().int().positive(),
});

export type CheckoutItem = z.infer<typeof CheckoutItemSchema>;

export const CreateOrderRequestSchema = z.object({
  shippingAddress: ShippingAddressSchema,
  items: z.array(CheckoutItemSchema).min(1),
  totalAmount: z.number().positive(),
});

export type CreateOrderRequest = z.infer<typeof CreateOrderRequestSchema>;
