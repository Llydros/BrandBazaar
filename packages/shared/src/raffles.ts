import { z } from "zod";

export const RaffleTypeSchema = z.enum(["sneaker", "event"]);

export const UserLevelSchema = z.enum(["Hobbyist", "Enthusiast", "Sneakerhead"]);

export const RaffleSchema = z.object({
  id: z.string().uuid(),
  type: RaffleTypeSchema,
  name: z.string(),
  description: z.string(),
  imageUrl: z.string().url(),
  entryPrice: z.number().positive(),
  xpReward: z.number().int().min(0),
  requiredLevel: UserLevelSchema,
  releaseDate: z.string().datetime().optional(),
  eventDate: z.string().datetime().optional(),
  location: z.string().optional(),
  capacity: z.number().int().min(0).optional(),
  status: z.enum(["active", "upcoming", "ended"]).default("active"),
  productId: z.string().uuid().optional().nullable(),
  winnerSelectionStartedAt: z.string().datetime().optional().nullable(),
  currentWinnerId: z.string().uuid().optional().nullable(),
  winnerPurchaseDeadline: z.string().datetime().optional().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const CreateRaffleRequestSchema = z.object({
  type: RaffleTypeSchema,
  name: z.string().min(1),
  description: z.string().min(1),
  imageUrl: z.string().url(),
  entryPrice: z.number().positive(),
  xpReward: z.number().int().min(0),
  requiredLevel: UserLevelSchema,
  releaseDate: z.string().datetime().optional(),
  eventDate: z.string().datetime().optional(),
  location: z.string().optional(),
  capacity: z.number().int().min(0).optional(),
  status: z.enum(["active", "upcoming", "ended"]).optional(),
  productId: z.string().uuid().optional().nullable(),
});

export const UpdateRaffleRequestSchema = CreateRaffleRequestSchema.partial();

export const RaffleEntrySchema = z.object({
  id: z.string().uuid(),
  raffleId: z.string().uuid(),
  userId: z.string().uuid(),
  enteredAt: z.string().datetime(),
  isWinner: z.boolean(),
  winnerSelectedAt: z.string().datetime().optional().nullable(),
  purchasedAt: z.string().datetime().optional().nullable(),
  removedFromPool: z.boolean(),
  updatedAt: z.string().datetime(),
});

export const EnterRaffleRequestSchema = z.object({
  raffleId: z.string().uuid(),
});

export const RaffleEntryResponseSchema = RaffleEntrySchema.extend({
  raffle: RaffleSchema.optional(),
  user: z.object({
    id: z.string().uuid(),
    email: z.string().email(),
  }).optional(),
});

export type Raffle = z.infer<typeof RaffleSchema>;
export type RaffleType = z.infer<typeof RaffleTypeSchema>;
export type UserLevel = z.infer<typeof UserLevelSchema>;
export type CreateRaffleRequest = z.infer<typeof CreateRaffleRequestSchema>;
export type UpdateRaffleRequest = z.infer<typeof UpdateRaffleRequestSchema>;
export type RaffleEntry = z.infer<typeof RaffleEntrySchema>;
export type EnterRaffleRequest = z.infer<typeof EnterRaffleRequestSchema>;
export type RaffleEntryResponse = z.infer<typeof RaffleEntryResponseSchema>;

