import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { Order, OrderStatus } from '../entities/order.entity';
import { UpdateOrderStatusDto, CreateOrderDto } from './orders.dto';
import { OrderItem } from '../entities/order-item.entity';
import { ProductVariant } from '../entities/product-variant.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(ProductVariant)
    private productVariantRepository: Repository<ProductVariant>,
    @InjectDataSource()
    private dataSource: DataSource,
    private usersService: UsersService,
  ) {}

  async findAll(
    status?: string,
    limit: number = 20,
    offset: number = 0,
  ): Promise<Order[]> {
    const query = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.productVariant', 'variant')
      .orderBy('order.createdAt', 'DESC')
      .take(limit)
      .skip(offset);

    if (status) {
      query.where('order.status = :status', { status });
    }

    return query.getMany();
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['user', 'items', 'items.productVariant'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async updateStatus(
    id: string,
    updateOrderStatusDto: UpdateOrderStatusDto,
  ): Promise<Order> {
    const order = await this.findOne(id);
    order.status = updateOrderStatusDto.status;
    return this.orderRepository.save(order);
  }

  async findByUserId(
    userId: string,
    status?: string,
    limit: number = 20,
    offset: number = 0,
  ): Promise<Order[]> {
    const query = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.productVariant', 'variant')
      .where('order.userId = :userId', { userId })
      .orderBy('order.createdAt', 'DESC')
      .take(limit)
      .skip(offset);

    if (status) {
      query.andWhere('order.status = :status', { status });
    }

    return query.getMany();
  }

  async findOneByUser(id: string, userId: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id, userId },
      relations: ['items', 'items.productVariant'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async createOrder(userId: string, dto: CreateOrderDto): Promise<Order> {
    if (!dto.items?.length) {
      throw new BadRequestException('Order items cannot be empty');
    }

    const variantIds = dto.items.map((item) => item.productVariantId);
    const variants = await this.productVariantRepository.find({
      where: { id: In(variantIds) },
      relations: ['product'],
    });
    const variantsById = new Map(
      variants.map((variant) => [variant.id, variant]),
    );

    let calculatedTotal = 0;
    const orderItems: Partial<OrderItem>[] = dto.items.map((item) => {
      const variant = variantsById.get(item.productVariantId);
      if (!variant) {
        throw new BadRequestException(
          `Variant ${item.productVariantId} not found`,
        );
      }
      if (variant.stockQuantity < item.quantity) {
        throw new BadRequestException(`Variant ${variant.id} is out of stock`);
      }

      const basePrice = variant.product.salePrice ?? variant.product.price;
      const unitPrice = Number(basePrice) + Number(variant.priceModifier ?? 0);
      const lineTotal = unitPrice * item.quantity;
      calculatedTotal += lineTotal;

      return {
        productVariantId: variant.id,
        productName: item.productName || variant.product.name,
        quantity: item.quantity,
        price: unitPrice,
      };
    });

    if (dto.totalAmount <= 0) {
      throw new BadRequestException('Total amount must be positive');
    }

    return this.dataSource.transaction(async (manager) => {
      // Decrement stock for each variant
      for (const item of dto.items) {
        await manager.decrement(
          ProductVariant,
          { id: item.productVariantId },
          'stockQuantity',
          item.quantity,
        );
      }

      const order = manager.create(Order, {
        userId,
        status: OrderStatus.PENDING_PAYMENT,
        totalAmount: calculatedTotal,
        shippingAddress: dto.shippingAddress,
      });
      const savedOrder = await manager.save(order);

      const orderItemEntities = orderItems.map((item) =>
        manager.create(OrderItem, {
          ...item,
          orderId: savedOrder.id,
        }),
      );
      await manager.save(orderItemEntities);

      const finalOrder = (await manager.findOne(Order, {
        where: { id: savedOrder.id },
        relations: ['items', 'items.productVariant'],
      })) as Order;

      await this.usersService.awardXP(userId, 250);

      return finalOrder;
    });
  }
}
