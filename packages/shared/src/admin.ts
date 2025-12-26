import { z } from 'zod';

export const RevenueDataPointSchema = z.object({
  date: z.string(),
  revenue: z.number(),
});

export type RevenueDataPoint = z.infer<typeof RevenueDataPointSchema>;

export const DashboardStatsSchema = z.object({
  totalRevenue: z.number(),
  totalOrders: z.number(),
  totalProducts: z.number(),
  activeUsers: z.number(),
  revenueChange: z.number(),
  ordersChange: z.number(),
  productsChange: z.number(),
  activeUsersChange: z.number(),
  revenueChartData: z.array(RevenueDataPointSchema),
});

export type DashboardStats = z.infer<typeof DashboardStatsSchema>;

export const DashboardResponseSchema = z.object({
  stats: DashboardStatsSchema,
});

export type DashboardResponse = z.infer<typeof DashboardResponseSchema>;

