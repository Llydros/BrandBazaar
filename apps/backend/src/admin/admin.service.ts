import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, FindOptionsWhere } from 'typeorm';
import { Order, OrderStatus } from '../entities/order.entity';
import { Product } from '../entities/product.entity';
import { User } from '../entities/user.entity';

interface RevenueDataPoint {
  date: string;
  revenue: number;
}

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  activeUsers: number;
  revenueChange: number;
  ordersChange: number;
  productsChange: number;
  activeUsersChange: number;
  revenueChartData: RevenueDataPoint[];
}

interface RawRevenueResult {
  total: string;
}

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getDashboardStats(): Promise<DashboardStats> {
    const now = new Date();
    const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonthStart = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1,
    );
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      totalRevenue,
      totalOrders,
      totalProducts,
      activeUsers,
      currentMonthRevenue,
      previousMonthRevenue,
      currentMonthOrders,
      previousMonthOrders,
      currentProducts,
      previousProducts,
      currentActiveUsers,
      previousActiveUsers,
    ]: [
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
    ] = await Promise.all([
      this.orderRepository
        .createQueryBuilder('order')
        .select('COALESCE(SUM(order.totalAmount), 0)', 'total')
        .where('order.status IN (:...statuses)', {
          statuses: [OrderStatus.PAID, OrderStatus.DELIVERED],
        })
        .getRawOne<RawRevenueResult>()
        .then((result: RawRevenueResult | undefined) =>
          parseFloat(result?.total || '0'),
        ),

      this.orderRepository.count(),

      this.productRepository.count(),

      this.userRepository.count({
        where: {
          lastSeenAt: MoreThanOrEqual(tenMinutesAgo),
        },
      }),

      this.orderRepository
        .createQueryBuilder('order')
        .select('COALESCE(SUM(order.totalAmount), 0)', 'total')
        .where('order.status IN (:...statuses)', {
          statuses: [OrderStatus.PAID, OrderStatus.DELIVERED],
        })
        .andWhere('order.createdAt >= :start', { start: currentMonthStart })
        .getRawOne<RawRevenueResult>()
        .then((result: RawRevenueResult | undefined) =>
          parseFloat(result?.total || '0'),
        ),

      this.orderRepository
        .createQueryBuilder('order')
        .select('COALESCE(SUM(order.totalAmount), 0)', 'total')
        .where('order.status IN (:...statuses)', {
          statuses: [OrderStatus.PAID, OrderStatus.DELIVERED],
        })
        .andWhere('order.createdAt >= :start', { start: previousMonthStart })
        .andWhere('order.createdAt < :end', { end: currentMonthStart })
        .getRawOne<RawRevenueResult>()
        .then((result: RawRevenueResult | undefined) =>
          parseFloat(result?.total || '0'),
        ),

      this.orderRepository.count({
        where: {
          createdAt: MoreThanOrEqual(currentMonthStart),
        } as FindOptionsWhere<Order>,
      }),

      this.orderRepository.count({
        where: {
          createdAt: MoreThanOrEqual(previousMonthStart),
        } as FindOptionsWhere<Order>,
      }),

      this.productRepository.count(),

      this.productRepository
        .createQueryBuilder('product')
        .where('product.createdAt < :start', { start: currentMonthStart })
        .getCount(),

      this.userRepository.count({
        where: {
          lastSeenAt: MoreThanOrEqual(tenMinutesAgo),
        },
      }),

      this.userRepository
        .createQueryBuilder('user')
        .where('user.lastSeenAt >= :start', {
          start: new Date(tenMinutesAgo.getTime() - 10 * 60 * 1000),
        })
        .andWhere('user.lastSeenAt < :end', { end: tenMinutesAgo })
        .getCount(),
    ]);

    const revenueChange =
      previousMonthRevenue > 0
        ? ((currentMonthRevenue - previousMonthRevenue) /
            previousMonthRevenue) *
          100
        : currentMonthRevenue > 0
          ? 100
          : 0;

    const ordersChange =
      previousMonthOrders > 0
        ? ((currentMonthOrders - previousMonthOrders) / previousMonthOrders) *
          100
        : currentMonthOrders > 0
          ? 100
          : 0;

    const productsChange =
      previousProducts > 0
        ? ((currentProducts - previousProducts) / previousProducts) * 100
        : currentProducts > 0
          ? 100
          : 0;

    const activeUsersChange =
      previousActiveUsers > 0
        ? ((currentActiveUsers - previousActiveUsers) / previousActiveUsers) *
          100
        : currentActiveUsers > 0
          ? 100
          : 0;

    const revenueChartData = await this.getRevenueChartData(thirtyDaysAgo);

    return {
      totalRevenue,
      totalOrders,
      totalProducts,
      activeUsers,
      revenueChange,
      ordersChange,
      productsChange,
      activeUsersChange,
      revenueChartData,
    };
  }

  private async getRevenueChartData(
    startDate: Date,
  ): Promise<RevenueDataPoint[]> {
    const results = await this.orderRepository
      .createQueryBuilder('order')
      .select('DATE(order.createdAt)', 'date')
      .addSelect('COALESCE(SUM(order.totalAmount), 0)', 'revenue')
      .where('order.status IN (:...statuses)', {
        statuses: [OrderStatus.PAID, OrderStatus.DELIVERED],
      })
      .andWhere('order.createdAt >= :startDate', { startDate })
      .groupBy('DATE(order.createdAt)')
      .orderBy('DATE(order.createdAt)', 'ASC')
      .getRawMany();

    const revenueMap = new Map<string, number>();
    results.forEach((row) => {
      const date = new Date(row.date).toISOString().split('T')[0];
      revenueMap.set(date, parseFloat(row.revenue || '0'));
    });

    const chartData: RevenueDataPoint[] = [];
    const endDate = new Date();
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      chartData.push({
        date: dateStr,
        revenue: revenueMap.get(dateStr) || 0,
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return chartData;
  }
}
