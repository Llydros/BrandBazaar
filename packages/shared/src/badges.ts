import { z } from "zod";

export const BadgeStatusSchema = z.enum(["Unlocked", "Pending", "Locked"]);

export const BadgeSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  xpRequired: z.number().int().min(0),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const UserBadgeSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  badgeId: z.string().uuid(),
  status: BadgeStatusSchema,
  unlockedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const CreateBadgeRequestSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  xpRequired: z.number().int().min(0),
});

export const UpdateBadgeRequestSchema = CreateBadgeRequestSchema.partial();

export type Badge = z.infer<typeof BadgeSchema>;
export type UserBadge = z.infer<typeof UserBadgeSchema>;
export type BadgeStatus = z.infer<typeof BadgeStatusSchema>;
export type CreateBadgeRequest = z.infer<typeof CreateBadgeRequestSchema>;
export type UpdateBadgeRequest = z.infer<typeof UpdateBadgeRequestSchema>;

