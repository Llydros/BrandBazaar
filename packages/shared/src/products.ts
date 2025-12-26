import { z } from 'zod';

// Seller schema (optional on product payloads)
export const SellerSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string(),
  email: z.string().email(),
  description: z.string().nullable().optional(),
  rating: z.number().min(0).max(5).optional(),
  totalReviews: z.number().int().min(0).optional(),
});

export type Seller = z.infer<typeof SellerSchema>;

// Product Variant Schema
export const ProductVariantSchema = z.object({
  id: z.string().uuid(),
  productId: z.string().uuid().optional(), // Optional for creation flow before ID is assigned
  sku: z.string().min(1),
  size: z.string().min(1),
  color: z.string().min(1),
  stockQuantity: z.number().int().min(0),
  priceModifier: z.number().default(0),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export type ProductVariant = z.infer<typeof ProductVariantSchema>;

// Product schemas
export const ProductSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  shortDescription: z.string().nullable().optional(),
  description: z.string(),
  price: z.number().positive(),
  salePrice: z.number().positive().nullable().optional(),
  images: z.array(z.string()),
  category: z.string().nullable(),
  tags: z.array(z.string()).optional(),
  specifications: z.record(z.string(), z.string()).nullable().optional(),
  stock: z.number().int().min(0),
  shippingInfo: z.string().nullable().optional(),
  estimatedDeliveryDays: z.number().int().nullable().optional(),
  averageRating: z.number().min(0).max(5),
  totalReviews: z.number().int().min(0),
  isPublic: z.boolean().default(true),
  seller: SellerSchema.optional(),
  variants: z.array(ProductVariantSchema).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Product = z.infer<typeof ProductSchema>;

// Review schemas
export const ReviewSchema = z.object({
  id: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().nullable(),
  productId: z.string().uuid(),
  userId: z.string().uuid(),
  user: z.object({
    id: z.string().uuid(),
    email: z.string().email(),
  }),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Review = z.infer<typeof ReviewSchema>;

// Request DTOs
export const CreateProductVariantRequestSchema = z.object({
  sku: z.string().min(1),
  size: z.string().min(1),
  color: z.string().min(1),
  stockQuantity: z.number().int().min(0),
  priceModifier: z.number().default(0),
});

export const CreateProductRequestSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number().positive(),
  images: z.array(z.string()).optional().default([]),
  category: z.string().nullable().optional(),
  stock: z.number().int().min(0).default(0),
  isPublic: z.boolean().default(true),
  variants: z.array(CreateProductVariantRequestSchema).optional().default([]),
});

export const UpdateProductRequestSchema = CreateProductRequestSchema.partial().extend({
    variants: z.array(CreateProductVariantRequestSchema.extend({
        id: z.string().uuid().optional(), // ID optional if it's a new variant on update
    })).optional(),
});

export const CreateReviewRequestSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().nullable().optional(),
});

// Response types
export type CreateProductRequest = z.infer<typeof CreateProductRequestSchema>;
export type CreateProductVariantRequest = z.infer<typeof CreateProductVariantRequestSchema>;
export type UpdateProductRequest = z.infer<typeof UpdateProductRequestSchema>;
export type CreateReviewRequest = z.infer<typeof CreateReviewRequestSchema>;

// Product with reviews response
export const ProductWithReviewsSchema = ProductSchema.extend({
  reviews: z.array(ReviewSchema).optional(),
});

export type ProductWithReviews = z.infer<typeof ProductWithReviewsSchema>;

// Upload response schema
export const UploadFilesResponseSchema = z.object({
  files: z.array(z.string()),
});

export type UploadFilesResponse = z.infer<typeof UploadFilesResponseSchema>;
