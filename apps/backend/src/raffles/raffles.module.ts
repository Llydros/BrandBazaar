import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RafflesService } from './raffles.service';
import {
  RafflesController,
  AdminRafflesController,
} from './raffles.controller';
import { Raffle } from '../entities/raffle.entity';
import { RaffleEntry } from '../entities/raffle-entry.entity';
import { User } from '../entities/user.entity';
import { UsersModule } from '../users/users.module';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Raffle, RaffleEntry, User]),
    UsersModule,
    ProductsModule,
  ],
  controllers: [RafflesController, AdminRafflesController],
  providers: [RafflesService],
  exports: [RafflesService],
})
export class RafflesModule {}
