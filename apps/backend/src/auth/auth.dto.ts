import { createZodDto } from 'nestjs-zod';
import { RegisterRequestSchema, LoginRequestSchema } from '@shared/auth';

export class RegisterDto extends createZodDto(RegisterRequestSchema) {}
export class LoginDto extends createZodDto(LoginRequestSchema) {}
