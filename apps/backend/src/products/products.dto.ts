import { createZodDto } from 'nestjs-zod';
import {
  CreateProductRequestSchema,
  UpdateProductRequestSchema,
  CreateReviewRequestSchema,
  UploadFilesResponseSchema,
} from '@shared/products';

export class CreateProductDto extends createZodDto(
  CreateProductRequestSchema,
) {}

export class UpdateProductDto extends createZodDto(
  UpdateProductRequestSchema,
) {}

export class CreateReviewDto extends createZodDto(CreateReviewRequestSchema) {}

export class UploadFilesResponseDto extends createZodDto(
  UploadFilesResponseSchema,
) {}
