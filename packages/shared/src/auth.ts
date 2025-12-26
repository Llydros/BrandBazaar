import { z } from "zod";

// User role and status enums
export const UserRoleSchema = z.enum(["admin", "customer", "staff"]);
export const UserStatusSchema = z.enum(["active", "inactive"]);

// User entity schema
export const UserSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  roles: z.array(UserRoleSchema).default(["customer"]),
  status: UserStatusSchema.default("active"),
  xp: z.number().int().min(0).default(0),
  level: z.enum(["Hobbyist", "Enthusiast", "Sneakerhead"]).default("Hobbyist"),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

// Request DTOs
export const RegisterRequestSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

export const LoginRequestSchema = z.object({
  email: z.email("Invalid email format"),
  password: z.string(),
});

// Response DTOs
export const AuthResponseSchema = z.object({
  user: UserSchema,
  message: z.string(),
});

export const LogoutResponseSchema = z.object({
  message: z.string(),
});

// Type exports
export type User = z.infer<typeof UserSchema>;
export type UserRole = z.infer<typeof UserRoleSchema>;
export type UserStatus = z.infer<typeof UserStatusSchema>;
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;
export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type AuthResponse = z.infer<typeof AuthResponseSchema>;
export type LogoutResponse = z.infer<typeof LogoutResponseSchema>;
