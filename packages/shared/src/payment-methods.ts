import { z } from "zod";

export const PaymentMethodSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  type: z.string().min(1),
  last4: z.string().min(4),
  brand: z.string().min(1),
  expiryMonth: z.number().int().min(1).max(12).optional().nullable(),
  expiryYear: z.number().int().min(2024).optional().nullable(),
  holderName: z.string().optional().nullable(),
  isDefault: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;

export const CreatePaymentMethodRequestSchema = z.object({
  type: z.string().min(1),
  last4: z.string().min(4),
  brand: z.string().min(1),
  expiryMonth: z.number().int().min(1).max(12).optional(),
  expiryYear: z.number().int().min(2024).optional(),
  holderName: z.string().optional(),
  isDefault: z.boolean().optional(),
});

export type CreatePaymentMethodRequest = z.infer<
  typeof CreatePaymentMethodRequestSchema
>;

export const UpdatePaymentMethodRequestSchema = z.object({
  type: z.string().min(1).optional(),
  last4: z.string().min(4).optional(),
  brand: z.string().min(1).optional(),
  expiryMonth: z.number().int().min(1).max(12).optional(),
  expiryYear: z.number().int().min(2024).optional(),
  holderName: z.string().optional(),
  isDefault: z.boolean().optional(),
});

export type UpdatePaymentMethodRequest = z.infer<
  typeof UpdatePaymentMethodRequestSchema
>;
