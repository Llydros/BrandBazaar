import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { Product } from '../entities/product.entity';
import { Review } from '../entities/review.entity';
import { User } from '../entities/user.entity';
import { AuthModule } from '../auth/auth.module';

import { ProductVariant } from '../entities/product-variant.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Review, User, ProductVariant]),
    AuthModule,
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
