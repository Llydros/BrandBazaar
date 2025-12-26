import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Request,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PaymentMethodsService } from './payment-methods.service';
import {
  CreatePaymentMethodDto,
  UpdatePaymentMethodDto,
} from './payment-methods.dto';
import { RolesGuard } from '../auth/roles.guard';

@ApiTags('payment-methods')
@Controller('payment-methods')
@UseGuards(RolesGuard)
export class PaymentMethodsController {
  constructor(private readonly paymentMethodsService: PaymentMethodsService) {}

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user payment methods' })
  @ApiResponse({ status: 200, description: 'List of payment methods' })
  async findAll(@Request() req) {
    if (!req.user) {
      throw new UnauthorizedException('Unauthorized');
    }
    const paymentMethods = await this.paymentMethodsService.findAllByUserId(
      req.user.id,
    );
    return { paymentMethods };
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get payment method by ID' })
  @ApiResponse({ status: 200, description: 'Payment method details' })
  @ApiResponse({ status: 404, description: 'Payment method not found' })
  async findOne(@Request() req, @Param('id') id: string) {
    if (!req.user) {
      throw new UnauthorizedException('Unauthorized');
    }
    const paymentMethod = await this.paymentMethodsService.findOne(
      id,
      req.user.id,
    );
    return { paymentMethod };
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new payment method' })
  @ApiResponse({ status: 201, description: 'Payment method created' })
  async create(
    @Request() req,
    @Body() createPaymentMethodDto: CreatePaymentMethodDto,
  ) {
    if (!req.user) {
      throw new UnauthorizedException('Unauthorized');
    }
    const paymentMethod = await this.paymentMethodsService.create(
      req.user.id,
      createPaymentMethodDto,
    );
    return { paymentMethod };
  }

  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update payment method' })
  @ApiResponse({ status: 200, description: 'Payment method updated' })
  @ApiResponse({ status: 404, description: 'Payment method not found' })
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updatePaymentMethodDto: UpdatePaymentMethodDto,
  ) {
    if (!req.user) {
      throw new UnauthorizedException('Unauthorized');
    }
    const paymentMethod = await this.paymentMethodsService.update(
      id,
      req.user.id,
      updatePaymentMethodDto,
    );
    return { paymentMethod };
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete payment method' })
  @ApiResponse({ status: 200, description: 'Payment method deleted' })
  @ApiResponse({ status: 404, description: 'Payment method not found' })
  async remove(@Request() req, @Param('id') id: string) {
    if (!req.user) {
      throw new UnauthorizedException('Unauthorized');
    }
    await this.paymentMethodsService.remove(id, req.user.id);
    return { message: 'Payment method deleted successfully' };
  }
}
