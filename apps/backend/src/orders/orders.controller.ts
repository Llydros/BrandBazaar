import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  UnauthorizedException,
  Post,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import {
  UpdateOrderStatusDto,
  GetOrdersDto,
  CreateOrderDto,
} from './orders.dto';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { UserRole } from '../entities/user.entity';

@ApiTags('orders')
@Controller('orders')
@UseGuards(RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user orders' })
  @ApiResponse({ status: 200, description: 'List of user orders' })
  async findMyOrders(@Request() req, @Query() query: GetOrdersDto) {
    if (!req.user) {
      throw new UnauthorizedException('Unauthorized');
    }
    const orders = await this.ordersService.findByUserId(
      req.user.id,
      query.status,
      query.limit,
      query.offset,
    );
    return { orders };
  }

  @Get('me/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user order by ID' })
  @ApiResponse({ status: 200, description: 'Order details' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async findMyOrder(@Request() req, @Param('id') id: string) {
    if (!req.user) {
      throw new UnauthorizedException('Unauthorized');
    }
    const order = await this.ordersService.findOneByUser(id, req.user.id);
    return { order };
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all orders (Admin only)' })
  @ApiResponse({ status: 200, description: 'List of orders' })
  async findAll(@Query() query: GetOrdersDto) {
    const orders = await this.ordersService.findAll(
      query.status,
      query.limit,
      query.offset,
    );
    return { orders };
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get order by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'Order details' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async findOne(@Param('id') id: string) {
    const order = await this.ordersService.findOne(id);
    return { order };
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update order status (Admin only)' })
  @ApiResponse({ status: 200, description: 'Order updated' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async updateStatus(
    @Param('id') id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    const order = await this.ordersService.updateStatus(
      id,
      updateOrderStatusDto,
    );
    return { order };
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new order from checkout' })
  @ApiResponse({ status: 201, description: 'Order created' })
  async createOrder(@Request() req, @Body() createOrderDto: CreateOrderDto) {
    if (!req.user) {
      throw new UnauthorizedException('Unauthorized');
    }
    const order = await this.ordersService.createOrder(
      req.user.id,
      createOrderDto,
    );
    return { order };
  }
}
