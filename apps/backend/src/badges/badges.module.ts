import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BadgesService } from './badges.service';
import { BadgesController, AdminBadgesController } from './badges.controller';
import { Badge } from '../entities/badge.entity';
import { UserBadge } from '../entities/user-badge.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Badge, UserBadge]), AuthModule],
  controllers: [BadgesController, AdminBadgesController],
  providers: [BadgesService],
  exports: [BadgesService],
})
export class BadgesModule {}
