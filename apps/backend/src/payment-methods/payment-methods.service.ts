import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentMethod } from '../entities/payment-method.entity';
import {
  CreatePaymentMethodDto,
  UpdatePaymentMethodDto,
} from './payment-methods.dto';

@Injectable()
export class PaymentMethodsService {
  constructor(
    @InjectRepository(PaymentMethod)
    private paymentMethodRepository: Repository<PaymentMethod>,
  ) {}

  async findAllByUserId(userId: string): Promise<PaymentMethod[]> {
    return this.paymentMethodRepository.find({
      where: { userId },
      order: { isDefault: 'DESC', createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<PaymentMethod> {
    const paymentMethod = await this.paymentMethodRepository.findOne({
      where: { id, userId },
    });

    if (!paymentMethod) {
      throw new NotFoundException('Payment method not found');
    }

    return paymentMethod;
  }

  async create(
    userId: string,
    createPaymentMethodDto: CreatePaymentMethodDto,
  ): Promise<PaymentMethod> {
    if (createPaymentMethodDto.isDefault) {
      await this.unsetDefaultPaymentMethods(userId);
    }

    const paymentMethod = this.paymentMethodRepository.create({
      ...createPaymentMethodDto,
      userId,
    });

    return this.paymentMethodRepository.save(paymentMethod);
  }

  async update(
    id: string,
    userId: string,
    updatePaymentMethodDto: UpdatePaymentMethodDto,
  ): Promise<PaymentMethod> {
    const paymentMethod = await this.findOne(id, userId);

    if (updatePaymentMethodDto.isDefault && !paymentMethod.isDefault) {
      await this.unsetDefaultPaymentMethods(userId);
    }

    Object.assign(paymentMethod, updatePaymentMethodDto);
    return this.paymentMethodRepository.save(paymentMethod);
  }

  async remove(id: string, userId: string): Promise<void> {
    await this.findOne(id, userId);
    await this.paymentMethodRepository.softDelete(id);
  }

  private async unsetDefaultPaymentMethods(userId: string): Promise<void> {
    await this.paymentMethodRepository.update(
      { userId, isDefault: true },
      { isDefault: false },
    );
  }
}
