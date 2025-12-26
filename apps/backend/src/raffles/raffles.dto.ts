import { createZodDto } from 'nestjs-zod';
import {
  CreateRaffleRequestSchema,
  UpdateRaffleRequestSchema,
} from '@shared/raffles';

export class CreateRaffleDto extends createZodDto(CreateRaffleRequestSchema) {}
export class UpdateRaffleDto extends createZodDto(UpdateRaffleRequestSchema) {}
