import { z } from "zod";

export const AddressSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  zipCode: z.string().min(1),
  country: z.string().min(1),
  label: z.string().optional().nullable(),
  isDefault: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Address = z.infer<typeof AddressSchema>;

export const CreateAddressRequestSchema = z.object({
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  zipCode: z.string().min(1),
  country: z.string().min(1),
  label: z.string().optional(),
  isDefault: z.boolean().optional(),
});

export type CreateAddressRequest = z.infer<typeof CreateAddressRequestSchema>;

export const UpdateAddressRequestSchema = z.object({
  street: z.string().min(1).optional(),
  city: z.string().min(1).optional(),
  state: z.string().min(1).optional(),
  zipCode: z.string().min(1).optional(),
  country: z.string().min(1).optional(),
  label: z.string().optional(),
  isDefault: z.boolean().optional(),
});

export type UpdateAddressRequest = z.infer<typeof UpdateAddressRequestSchema>;
