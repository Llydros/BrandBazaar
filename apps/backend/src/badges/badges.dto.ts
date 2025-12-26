import { createZodDto } from 'nestjs-zod';
import {
  CreateBadgeRequestSchema,
  UpdateBadgeRequestSchema,
} from '@shared/badges';

export class CreateBadgeDto extends createZodDto(CreateBadgeRequestSchema) {}
export class UpdateBadgeDto extends createZodDto(UpdateBadgeRequestSchema) {}
